// src/contexts/contracts/contracts.service.ts
import { Contract, IContract } from './contracts.model';
import { Job } from '../jobs/jobs.model';
import { User } from '../users/users.model';
import { AppError } from '../../shared/utils/error';

export class ContractsService {
  /**
   * Criar contrato automaticamente quando worker é selecionado
   */
  static async createContractFromJob(jobId: string): Promise<IContract> {
    const job = await Job.findById(jobId)
      .populate('company', 'name profile.companyName')
      .populate('selectedWorker', 'name profile.skills profile.availability');
    
    if (!job) {
      throw new AppError('Vaga não encontrada', 404);
    }
    
    if (!job.selectedWorker) {
      throw new AppError('Nenhum worker selecionado para esta vaga', 400);
    }
    
    // Verificar se contrato já existe
    const existingContract = await Contract.findOne({ job: jobId });
    if (existingContract) {
      throw new AppError('Contrato já existe para esta vaga', 400);
    }
    
    // Criar contrato com base na vaga
    const contract = new Contract({
      job: jobId,
      worker: job.selectedWorker,
      company: job.company,
      
      terms: {
        title: job.title,
        description: job.description,
        compensation: {
          amount: job.budget.min, // Usar o mínimo como base
          currency: job.budget.currency,
          type: job.budget.type,
          paymentSchedule: 'monthly'
        },
        schedule: {
          startDate: job.dates.start,
          endDate: job.dates.end,
          workHours: '09:00-18:00', // Default, pode ser ajustado
          daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          totalHours: this.calculateTotalHours(job.dates.start, job.dates.end)
        },
        deliverables: ['Entregáveis conforme escopo da vaga'],
        responsibilities: ['Cumprir horários estabelecidos', 'Comunicar progresso regularmente']
      },
      
      clauses: {
        terminationNotice: 7,
        confidentiality: true,
        intellectualProperty: 'company',
        penalties: {
          lateCompletion: 0.1, // 10% do valor
          earlyTermination: 0.2 // 20% do valor
        }
      },
      
      status: 'pending' // Aguardando assinaturas
    });
    
    return await contract.save();
  }
  
  /**
   * Calcular horas totais baseado no período
   */
  private static calculateTotalHours(startDate: Date, endDate: Date): number {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const workDays = days * 5/7; // Aproximação de dias úteis
    return Math.round(workDays * 8); // 8 horas por dia
  }
  
  /**
   * Assinar contrato (worker ou company)
   */
  static async signContract(contractId: string, userId: string, userRole: string, ip: string = ''): Promise<IContract> {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new AppError('Contrato não encontrado', 404);
    }
    
    // Verificar permissão
    if (userRole === 'worker' && contract.worker.toString() !== userId) {
      throw new AppError('Apenas o worker pode assinar este contrato', 403);
    }
    
    if (userRole === 'company' && contract.company.toString() !== userId) {
      throw new AppError('Apenas a empresa pode assinar este contrato', 403);
    }
    
    // Atualizar assinatura
    const signatureField = userRole === 'worker' ? 'signatures.worker' : 'signatures.company';
    contract.set({
      [`${signatureField}.signed`]: true,
      [`${signatureField}.signedAt`]: new Date(),
      [`${signatureField}.ip`]: ip
    });
    
    // Verificar se ambas as partes assinaram
    if (contract.signatures.worker.signed && contract.signatures.company.signed) {
      contract.status = 'active';
      contract.activatedAt = new Date();
    }
    
    return await contract.save();
  }
  
  /**
   * Buscar contratos do worker
   */
  static async getWorkerContracts(workerId: string, status?: string) {
    const query: any = { worker: workerId };
    if (status) query.status = status;
    
    return await Contract.find(query)
      .populate('job', 'title description location')
      .populate('company', 'name profile.companyName')
      .sort({ createdAt: -1 });
  }
  
  /**
   * Buscar contratos da company
   */
  static async getCompanyContracts(companyId: string, status?: string) {
    const query: any = { company: companyId };
    if (status) query.status = status;
    
    return await Contract.find(query)
      .populate('job', 'title description location')
      .populate('worker', 'name profile.skills profile.rating')
      .sort({ createdAt: -1 });
  }
  
  /**
   * Buscar contrato por ID
   */
  // CORREÇÃO: src/contexts/contracts/contracts.service.ts
/**
 * Buscar contrato por ID
 */
static async getContractById(contractId: string, userId: string) {
  const contract = await Contract.findById(contractId)
    .populate('job', 'title description location requiredSkills')
    .populate('worker', 'name email profile')
    .populate('company', 'name email profile');
  
  if (!contract) {
    throw new AppError('Contrato não encontrado', 404);
  }
  
  // ✅ CORREÇÃO: Verificar se usuário tem acesso
  // Usar .toString() para comparar ObjectIds
  const workerId = contract.worker._id ? contract.worker._id.toString() : contract.worker.toString();
  const companyId = contract.company._id ? contract.company._id.toString() : contract.company.toString();
  
  if (workerId !== userId && companyId !== userId) {
    throw new AppError('Acesso não autorizado', 403);
  }
  
  return contract;
}
}