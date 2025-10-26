import { WorkSession, IWorkSession } from './work.model';
import { Job } from '../jobs/jobs.model';
import { AppError } from '@/shared/utils/error';

export class RouteService {

 /**
  * Criar work session para job com rota
  */
 static async createRouteSession(contractId: string, workerId: string, jobId: string) {
  try {
   const job = await Job.findById(jobId);
   if (!job) throw new AppError('Job não encontrado', 404);

   if (job.workType !== 'multi_location_route') {
    throw new AppError('Este job não é uma rota com múltiplos locais', 400);
   }

   // Criar sessão com estrutura de rota
   const workSession = new WorkSession({
    contract: contractId,
    worker: workerId,
    company: job.company,
    job: jobId,
    workType: 'multi_location_route',
    routeProgress: {
     totalLocations: job.locations?.length || 0,
     routeStatus: 'not_started'
    },
    locationSessions: job.locations?.map((location: any, index: number) => ({
     locationIndex: index,
     locationName: location.name,
     locationAddress: location.address,
     status: 'pending'
    })) || [],
    checkIn: {
     timestamp: new Date(),
     location: 'Início de rota',
     photos: [],
     notes: `Rota com ${job.locations?.length} locais`
    }
   });

   return await workSession.save();
  } catch (error) {
   throw error;
  }
 }

 /**
  * Check-in em local específico da rota
  */
 static async checkInLocation(sessionId: string, locationIndex: number, checkInData: any) {
  try {
   const workSession = await WorkSession.findById(sessionId);
   if (!workSession) throw new AppError('Sessão não encontrada', 404);

   const locationSession = workSession.locationSessions[locationIndex];
   if (!locationSession) throw new AppError('Local não encontrado na rota', 404);

   if (locationSession.status !== 'pending') {
    throw new AppError('Check-in já realizado ou local não disponível', 400);
   }

   // Atualizar sessão do local
   locationSession.checkIn = {
    timestamp: new Date(),
    photos: checkInData.photos || [],
    notes: checkInData.notes,
    coordinates: checkInData.coordinates
   };
   locationSession.status = 'in_progress';

   // Atualizar progresso da rota
   workSession.routeProgress.currentLocationIndex = locationIndex;
   workSession.routeProgress.routeStatus = 'in_progress';

   return await workSession.save();
  } catch (error) {
   throw error;
  }
 }

 /**
  * Check-out de local + próximo destino
  */
 static async checkOutLocation(sessionId: string, locationIndex: number, checkOutData: any) {
  try {
   const workSession = await WorkSession.findById(sessionId);
   if (!workSession) throw new AppError('Sessão não encontrada', 404);

   const locationSession = workSession.locationSessions[locationIndex];
   if (!locationSession) throw new AppError('Local não encontrado na rota', 404);

   if (locationSession.status !== 'in_progress') {
    throw new AppError('Local não está em progresso para check-out', 400);
   }

   // Registrar check-out
   locationSession.checkOut = {
    timestamp: new Date(),
    photos: checkOutData.photos || [],
    notes: checkOutData.notes,
    coordinates: checkOutData.coordinates
   };
   locationSession.status = 'completed';

   // Atualizar progresso
   workSession.routeProgress.completedLocations += 1;

   // Verificar próximo local
   const nextLocationIndex = locationIndex + 1;
   let nextLocation = null;
   let isRouteComplete = false;

   if (nextLocationIndex < workSession.locationSessions.length) {
    workSession.routeProgress.nextScheduledLocation = nextLocationIndex;
    nextLocation = workSession.locationSessions[nextLocationIndex];
   } else {
    // Rota completa
    workSession.routeProgress.routeStatus = 'completed';
    workSession.status = 'completed';
    workSession.checkOut = {
     timestamp: new Date(),
     location: 'Fim de rota',
     photos: [],
     hoursWorked: this.calculateRouteHours(workSession),
     completionNotes: `Rota completada: ${workSession.locationSessions.length} locais`
    };
    isRouteComplete = true;
   }

   await workSession.save();

   return {
    session: workSession,
    nextLocation: nextLocation ? {
     index: nextLocationIndex,
     name: nextLocation.locationName,
     address: nextLocation.locationAddress
    } : null,
    isRouteComplete
   };
  } catch (error) {
   throw error;
  }
 }

 /**
  * Calcular horas totais da rota
  */
 private static calculateRouteHours(workSession: IWorkSession): number {
  if (!workSession.locationSessions || workSession.locationSessions.length === 0) {
   return 0;
  }

  const firstCheckIn = workSession.locationSessions[0].checkIn.timestamp;
  const lastCheckOut = workSession.locationSessions[workSession.locationSessions.length - 1].checkOut?.timestamp;

  if (!firstCheckIn || !lastCheckOut) {
   return 0;
  }

  const diffMs = lastCheckOut.getTime() - firstCheckIn.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 casas decimais
 }
}