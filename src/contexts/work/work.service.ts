// src/contexts/work/work.service.ts - VERSÃO CORRIGIDA
import { WorkSession, IWorkSession, WorkPhoto } from './work.model';
import { Contract } from '../contracts/contracts.model';
import { AppError } from '../../shared/utils/error';

export class WorkService {
  /**
   * Converter array de strings (URLs/base64) para array de WorkPhoto
   */
  private static convertToWorkPhotos(photoStrings: string[], type: 'check-in' | 'check-out'): WorkPhoto[] {
    return photoStrings.map((photo, index) => ({
      url: photo,
      thumbnailUrl: photo, // Em produção, gerar thumbnail
      metadata: {
        originalName: `${type}_${Date.now()}_${index}.jpg`,
        size: this.estimatePhotoSize(photo),
        mimeType: this.detectMimeType(photo),
        uploadedAt: new Date(),
        takenAt: new Date()
      }
    }));
  }
  

  /**
   * Estimar tamanho da foto baseado no formato
   */
  private static estimatePhotoSize(photoData: string): number {
    if (photoData.startsWith('data:')) {
      // Base64: remover header e calcular
      const base64 = photoData.split(',')[1];
      return Math.floor((base64.length * 3) / 4);
    }
    // URL: estimar 500KB como padrão
    return 500000;
  }

  /**
   * Detectar tipo MIME baseado no formato
   */
  private static detectMimeType(photoData: string): string {
    if (photoData.startsWith('data:image/jpeg')) return 'image/jpeg';
    if (photoData.startsWith('data:image/png')) return 'image/png';
    if (photoData.startsWith('data:image/webp')) return 'image/webp';
    return 'image/jpeg'; // Padrão
  }

  /**
   * Fazer check-in para um contrato (CORRIGIDO)
   */
 static async checkIn(contractId: string, workerId: string, checkInData: any): Promise<IWorkSession> {
  const contract = await Contract.findById(contractId)
    .populate('job')
    .populate('worker') // ⚠️ Isso retorna OBJETO completo, não ID
    .populate('company');
  
  if (!contract) {
    throw new AppError('Contrato não encontrado', 404);
  }
  

  let contractWorkerId: string;
  
  if (typeof contract.worker === 'object' && contract.worker._id) {
    // Worker foi populado - pegar _id do objeto
    contractWorkerId = contract.worker._id.toString();
  } else {
    // Worker não foi populado - já é o ID
    contractWorkerId = contract.worker.toString();
  }
  
  console.log('🔍 DEBUG Check-in:');
  console.log('  - Contract worker ID:', contractWorkerId);
  console.log('  - Authenticated worker ID:', workerId);
  console.log('  - Worker object type:', typeof contract.worker);
  
  if (contractWorkerId !== workerId) {
    throw new AppError('Apenas o worker do contrato pode fazer check-in', 403);
  };
  
  
}

  /**
   * Fazer check-out para uma sessão ativa 
   * 
   * /
   
  static async checkOut(sessionId: string, workerId: string, checkOutData: any): Promise<IWorkSession> {
    const workSession = await WorkSession.findById(sessionId);
    
    if (!workSession) {
      throw new AppError('Sessão de trabalho não encontrada', 404);
    }
    
    // Verificar se worker é o dono da sessão
    if (workSession.worker.toString() !== workerId) {
      throw new AppError('Apenas o worker da sessão pode fazer check-out', 403);
    }
    
    // Verificar se sessão está ativa
    if (workSession.status !== 'active') {
      throw new AppError('Sessão não está ativa', 400);
    }
    
    // Verificar se já tem check-out
    if (workSession.checkOut) {
      throw new AppError('Check-out já realizado para esta sessão', 400);
    }
    
    // ✅ CORREÇÃO: Converter fotos de string[] para WorkPhoto[]
    const workPhotos = this.convertToWorkPhotos(checkOutData.photos || [], 'check-out');
    
    // Atualizar com check-out
    workSession.checkOut = {
      timestamp: new Date(),
      location: checkOutData.location,
      coordinates: checkOutData.coordinates,
      photos: workPhotos, // ✅ AGORA é WorkPhoto[] convertido
      hoursWorked: checkOutData.hoursWorked,
      completionNotes: checkOutData.completionNotes,
      ipAddress: checkOutData.ipAddress
    };
    
    workSession.status = 'completed';
    
    // Calcular valor
    const contract = await Contract.findById(workSession.contract);
    if (contract) {
      workSession.calculatedAmount = this.calculateAmount(
        checkOutData.hoursWorked,
        contract.terms.compensation
      );
    }
    
    return await workSession.save();
  }
  /**
   * Calcular valor baseado nas horas e tipo de compensação
   */
  private static calculateAmount(hoursWorked: number, compensation: any): number {
    switch (compensation.type) {
      case 'hourly':
        return hoursWorked * compensation.amount;
      case 'daily':
        return (hoursWorked / 8) * compensation.amount; // Assume 8h/dia
      case 'fixed':
        return compensation.amount; // Valor fixo independente das horas
      default:
        return hoursWorked * compensation.amount;
    }
  }
  
  /**
   * Buscar sessões de trabalho do worker
   */
  static async getWorkerSessions(workerId: string, filters: any = {}) {
    const query: any = { worker: workerId };
    
    if (filters.contractId) query.contract = filters.contractId;
    if (filters.status) query.status = filters.status;
    if (filters.startDate) query.workDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      query.workDate = query.workDate || {};
      query.workDate.$lte = new Date(filters.endDate);
    }
    
    return await WorkSession.find(query)
      .populate('contract', 'terms.title terms.compensation')
      .populate('job', 'title location')
      .populate('company', 'name profile.companyName')
      .sort({ workDate: -1, 'checkIn.timestamp': -1 });
  }
  
  /**
   * Buscar sessões de trabalho da company
   */
  static async getCompanySessions(companyId: string, filters: any = {}) {
    const query: any = { company: companyId };
    
    if (filters.contractId) query.contract = filters.contractId;
    if (filters.workerId) query.worker = filters.workerId;
    if (filters.status) query.status = filters.status;
    if (filters.startDate) query.workDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      query.workDate = query.workDate || {};
      query.workDate.$lte = new Date(filters.endDate);
    }
    
    return await WorkSession.find(query)
      .populate('contract', 'terms.title terms.compensation')
      .populate('job', 'title location')
      .populate('worker', 'name profile.skills profile.rating')
      .sort({ workDate: -1, 'checkIn.timestamp': -1 });
  }
  
  /**
   * Confirmar sessão (empresa)
   */
  static async confirmSession(sessionId: string, companyId: string): Promise<IWorkSession> {
    const workSession = await WorkSession.findById(sessionId);
    
    if (!workSession) {
      throw new AppError('Sessão de trabalho não encontrada', 404);
    }
    
    // Verificar se company é a dona da sessão
    if (workSession.company.toString() !== companyId) {
      throw new AppError('Apenas a empresa da sessão pode confirmar', 403);
    }
    
    // Verificar se sessão está completada
    if (workSession.status !== 'completed') {
      throw new AppError('Sessão precisa estar completada para confirmação', 400);
    }
    
    workSession.paymentStatus = 'confirmed';
    
    return await workSession.save();
  }
}