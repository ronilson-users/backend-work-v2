// src/contexts/work/work.controller.ts
import { Request, Response, NextFunction } from 'express';
import { WorkService } from './work.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { AppError } from '../../shared/utils/error';

export const workController = {
  /**
   * ✅ Fazer check-in para um contrato
   */
  checkIn: asyncHandler(async (req: Request, res: Response) => {
    const { contractId } = req.params;
    const workerId = (req as any).user.id;
    
    const { location, coordinates, photos, notes } = req.body;
    
    const workSession = await WorkService.checkIn(contractId, workerId, {
      location,
      coordinates,
      photos: photos || [],
      notes,
      ipAddress: req.ip
    });
    
    res.status(201).json({
      success: true,
      message: 'Check-in realizado com sucesso',
      data: workSession
    });
  }),

  /**
   * ✅ Fazer check-out para uma sessão
   */
  checkOut: asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const workerId = (req as any).user.id;
    
    const { location, coordinates, photos, hoursWorked, completionNotes } = req.body;
    
    // Validar horas trabalhadas
    if (!hoursWorked || hoursWorked <= 0) {
      throw new AppError('Horas trabalhadas devem ser informadas', 400);
    }
    
    const workSession = await WorkService.checkOut(sessionId, workerId, {
      location,
      coordinates,
      photos: photos || [],
      hoursWorked,
      completionNotes,
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      message: 'Check-out realizado com sucesso',
      data: workSession
    });
  }),

  /**
   * ✅ Upload de foto (separado para flexibilidade)
   */
  uploadPhoto: asyncHandler(async (req: Request, res: Response) => {
    // Por enquanto, vamos aceitar URLs/base64 diretamente
    // Na implementação completa, aqui faríamos o upload para cloud storage
    
    const { photoData, type, contractId } = req.body;
    const userId = (req as any).user.id;
    
    // Simular processamento de foto
    const photoUrl = `https://example.com/photos/${userId}/${contractId}/${type}/${Date.now()}.jpg`;
    
    res.json({
      success: true,
      message: 'Foto processada com sucesso',
      data: {
        url: photoUrl,
        thumbnailUrl: photoUrl, // Em produção, gerar thumbnail
        metadata: {
          uploadedAt: new Date(),
          type: type || 'work'
        }
      }
    });
  }),

  /**
   * ✅ Buscar sessões do worker autenticado
   */
  getMySessions: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const { contractId, status, startDate, endDate } = req.query;
    
    let sessions;
    if (userRole === 'worker') {
      sessions = await WorkService.getWorkerSessions(userId, {
        contractId: contractId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
    } else if (userRole === 'company') {
      sessions = await WorkService.getCompanySessions(userId, {
        contractId: contractId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
    } else {
      throw new AppError('Apenas workers e companies podem acessar sessões de trabalho', 403);
    }
    
    res.json({
      success: true,
      data: sessions
    });
  }),

  /**
   * ✅ Buscar sessão específica
   */
  getSession: asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    // Por enquanto, buscar através das sessões do usuário
    // Na implementação completa, criar método específico
    const sessions = userRole === 'worker' 
      ? await WorkService.getWorkerSessions(userId, {})
      : await WorkService.getCompanySessions(userId, {});
    
    const session = sessions.find((s: any) => s.id === sessionId);
    
    if (!session) {
      throw new AppError('Sessão de trabalho não encontrada', 404);
    }
    
    res.json({
      success: true,
      data: session
    });
  }),

  /**
   * ✅ Empresa confirmar sessão (para pagamento)
   */
  confirmSession: asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const companyId = (req as any).user.id;
    
    const workSession = await WorkService.confirmSession(sessionId, companyId);
    
    res.json({
      success: true,
      message: 'Sessão confirmada com sucesso',
      data: workSession
    });
  }),

  /**
   * ✅ Buscar sessões de um contrato específico
   */
  getContractSessions: asyncHandler(async (req: Request, res: Response) => {
    const { contractId } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const sessions = userRole === 'worker'
      ? await WorkService.getWorkerSessions(userId, { contractId })
      : await WorkService.getCompanySessions(userId, { contractId });
    
    res.json({
      success: true,
      data: sessions
    });
  }),

  /**
   * ✅ Estatísticas de trabalho (dashboard)
   */
  getWorkStats: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { contractId, startDate, endDate } = req.query;
    
    // Por enquanto, retornar estatísticas básicas
    // Na implementação completa, calcular métricas reais
    const sessions = userRole === 'worker'
      ? await WorkService.getWorkerSessions(userId, { contractId: contractId as string, startDate: startDate as string, endDate: endDate as string })
      : await WorkService.getCompanySessions(userId, { contractId: contractId as string, startDate: startDate as string, endDate: endDate as string });
    
    const stats = {
      totalSessions: sessions.length,
      totalHours: sessions.reduce((sum: number, session: any) => sum + (session.totalHours || 0), 0),
      completedSessions: sessions.filter((s: any) => s.status === 'completed').length,
      pendingConfirmation: sessions.filter((s: any) => s.status === 'completed' && s.paymentStatus === 'pending').length,
      totalAmount: sessions.reduce((sum: number, session: any) => sum + (session.calculatedAmount || 0), 0),
      averageHours: sessions.length > 0 ? (sessions.reduce((sum: number, session: any) => sum + (session.totalHours || 0), 0) / sessions.length) : 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  })
};