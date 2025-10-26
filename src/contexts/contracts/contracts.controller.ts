// src/contexts/contracts/contracts.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ContractsService } from './contracts.service';
import { asyncHandler } from '@/shared/utils/asyncHandler';

export const contractsController = {
 /**
  *  Criar contrato manualmente
  * (Para casos onde não há job ou é contrato direto)
  */
 createContract: asyncHandler(async (req: Request, res: Response) => {
  const { companyId, workerId, jobId, terms, clauses } = req.body;
  const createdBy = (req as any).user.id; // Quem está criando o contrato

  // TODO: Implementar criação manual
  // Por enquanto vamos focar na criação automática via jobs

  res.status(201).json({
   success: true,
   message: 'Contrato criado com sucesso',
   data: { companyId, workerId, jobId }
  });
 }),

 /**
  * Criar contrato automaticamente a partir de um job
  * (QUANDO EMPRESA SELECIONA WORKER)
  */
 createFromJob: asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const companyId = (req as any).user.id;

  // Verificar se empresa é dona do job
  // Criar contrato automaticamente
  const contract = await ContractsService.createContractFromJob(jobId);

  res.status(201).json({
   success: true,
   message: 'Contrato criado automaticamente com sucesso',
   data: contract
  });
 }),

 /**
  *  Assinar contrato (worker ou company)
  */
 signContract: asyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;
  const ip = req.ip; // IP para auditoria

  const contract = await ContractsService.signContract(contractId, userId, userRole, ip);

  res.json({
   success: true,
   message: 'Contrato assinado com sucesso',
   data: contract
  });
 }),

 /**
  *  Buscar contratos do worker autenticado
  */
 getMyContracts: asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;
  const { status } = req.query;

  let contracts;
  if (userRole === 'worker') {
   contracts = await ContractsService.getWorkerContracts(userId, status as string);
  } else if (userRole === 'company') {
   contracts = await ContractsService.getCompanyContracts(userId, status as string);
  } else {
   return res.status(403).json({
    success: false,
    error: 'Apenas workers e companies podem acessar contratos'
   });
  }

  res.json({
   success: true,
   data: contracts
  });
 }),

 /**
  *  Buscar contrato específico
  */
 getContract: asyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params;
  const userId = (req as any).user.id;

  const contract = await ContractsService.getContractById(contractId, userId);

  res.json({
   success: true,
   data: contract
  });
 }),

 /**
  *  Atualizar status do contrato
  */
 updateStatus: asyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params;
  const { status } = req.body;
  const userId = (req as any).user.id;

  // TODO: Implementar atualização de status com validações
  // Por enquanto retornar mock

  res.json({
   success: true,
   message: 'Status do contrato atualizado',
   data: { contractId, status, updatedBy: userId }
  });
 })
};