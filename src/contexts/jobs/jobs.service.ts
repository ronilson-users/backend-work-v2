// src/contexts/jobs/jobs.service.ts
import { Job, IJob } from './jobs.model';
import { User } from '../users/users.model';

export interface CancellationData {
  jobId: string;
  initiatedBy: 'company' | 'worker';
  reason: string;
  userId: string;
}

export interface CancellationDecision {
  status: 'cancelled' | 'refund_required' | 'penalty_applied';
  message: string;
  refundAmount?: number;
  penaltyAmount?: number;
  details: string;
}

export class CancellationService {
  static async processCancellation(data: CancellationData): Promise<CancellationDecision> {
    const { jobId, initiatedBy, reason, userId } = data;
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    await this.validateCancellationPermission(job, user, initiatedBy);
    this.validateJobStatus(job);

    const decision = await this.applyCancellationRules(job, initiatedBy);
    job.status = 'cancelled';
    job.updatedAt = new Date();
    await job.save();
    return decision;
  }

  private static async validateCancellationPermission(job: IJob, user: any, initiatedBy: string) {
    if (initiatedBy === 'company' && job.company.toString() !== user._id.toString())
      throw new Error('Only the job owner can cancel this job');
    if (initiatedBy === 'worker' && (!job.selectedWorker || job.selectedWorker.toString() !== user._id.toString()))
      throw new Error('Only the selected worker can cancel this job');
  }

  private static validateJobStatus(job: IJob) {
    if (job.status === 'cancelled') throw new Error('Job is already cancelled');
    if (job.status === 'completed') throw new Error('Cannot cancel a completed job');
    if (!['open', 'in_progress'].includes(job.status)) throw new Error('Job cannot be cancelled in its current status');
  }

  private static async applyCancellationRules(job: IJob, initiatedBy: string): Promise<CancellationDecision> {
    const now = new Date();
    const hoursUntilStart = (job.dates.start.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (job.status === 'open') return { status: 'cancelled', message: 'Job cancelled successfully', details: 'No penalties applied' };

    if (job.status === 'in_progress') {
      if (initiatedBy === 'company') {
        if (hoursUntilStart > 24) return { status: 'cancelled', message: 'No penalty', details: 'Cancelled >24h before start' };
        if (hoursUntilStart > 2) return { status: 'penalty_applied', message: '10% penalty', penaltyAmount: this.calculatePenalty(job.budget.min, 0.1), details: 'Cancelled 2-24h before start' };
        return { status: 'penalty_applied', message: '25% penalty', penaltyAmount: this.calculatePenalty(job.budget.min, 0.25), details: 'Cancelled <2h before start' };
      }
      if (initiatedBy === 'worker') {
        if (hoursUntilStart > 24) return { status: 'cancelled', message: 'No penalty', details: 'Worker cancelled >24h' };
        if (hoursUntilStart > 2) return { status: 'penalty_applied', message: 'Rating impacted', details: 'Worker cancelled 2-24h before start' };
        return { status: 'penalty_applied', message: 'Significant rating impact', details: 'Worker cancelled <2h before start' };
      }
    }
    return { status: 'cancelled', message: 'Job cancelled', details: 'Processed' };
  }

  private static calculatePenalty(baseAmount: number, percentage: number): number {
    return Math.round(baseAmount * percentage * 100) / 100;
  }

  static async findJobsWithFilters(filters: any, page: number, limit: number) {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
    if (filters.skills) query.requiredSkills = { $in: filters.skills.split(',') };
    if (filters.minBudget || filters.maxBudget) {
      query.$and = [];
      if (filters.minBudget) query.$and.push({ 'budget.max': { $gte: Number(filters.minBudget) } });
      if (filters.maxBudget) query.$and.push({ 'budget.min': { $lte: Number(filters.maxBudget) } });
    }
    if (filters.startDate) query['dates.start'] = { $gte: new Date(filters.startDate) };
    if (filters.endDate) query['dates.end'] = { $lte: new Date(filters.endDate) };

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('company', 'name profile.companyName profile.industry profile.rating')
        .populate('applicants', 'name profile.photo profile.skills')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query)
    ]);

    return { jobs, total };
  }

  static async applyToJob(jobId: string, workerId: string): Promise<IJob> {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');
    if (job.status !== 'open') throw new Error('Job not accepting applications');
    if (job.applicants.includes(workerId as any)) throw new Error('Already applied');
    job.applicants.push(workerId as any);
    await job.save();
    return job;
  }

  static async selectWorker(jobId: string, workerId: string, companyId: string): Promise<IJob> {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');
    if (job.company.toString() !== companyId) throw new Error('Only owner can select');
    if (!job.applicants.includes(workerId as any)) throw new Error('Worker not applied');
    if (job.status !== 'open') throw new Error('Cannot select worker for job not open');
    job.selectedWorker = workerId as any;
    job.status = 'in_progress';
    await job.save();
    return job;
  }
}