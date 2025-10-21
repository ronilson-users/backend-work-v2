// src/contexts/jobs/jobs.controller.ts
import { Request, Response } from 'express';
import { Job } from './jobs.model';
import { CancellationService } from './jobs.service';
import { asyncHandler } from '@/shared/utils/asyncHandler';


// Create job
export const createJob = asyncHandler(async (req: Request, res: Response) => {
 
  const companyId = (req as any).user.id;
  const jobData = { ...req.body, company: companyId };
  const job = await Job.create(jobData);
  
  res.status(201).json({ message: 'Job created successfully', job });
});

// Update job
export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) throw new Error('Job not found');
  if (job.company.toString() !== (req as any).user.id) throw new Error('Only job owner can update this job');

  Object.assign(job, req.body);
  await job.save();
  res.status(200).json({ message: 'Job updated successfully', job });
});

// Get all jobs with filters
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await CancellationService.findJobsWithFilters(req.query, page, limit);
  res.status(200).json(result);
});

// Get job by ID
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await Job.findById(id)
    .populate('company', 'name profile.companyName profile.industry profile.rating')
    .populate('applicants', 'name profile.photo profile.skills');
  if (!job) throw new Error('Job not found');
  res.status(200).json({ job });
});

// Apply to job (worker)
export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const workerId = (req as any).user.id;
  const job = await CancellationService.applyToJob(id, workerId);
  res.status(200).json({ message: 'Application successful', job });
});

// Select worker (company)
export const selectWorker = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { workerId } = req.body;
  const companyId = (req as any).user.id;
  const job = await CancellationService.selectWorker(id, workerId, companyId);
  res.status(200).json({ message: 'Worker selected successfully', job });
});

// Cancel job (company or worker)
export const cancelJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const { reason } = req.body;
  const initiatedBy: 'company' | 'worker' = (req as any).user.role === 'company' ? 'company' : 'worker';
  const decision = await CancellationService.processCancellation({ jobId: id, initiatedBy, reason, userId });
  res.status(200).json({ message: 'Job cancellation processed', decision });
});

// Get jobs of authenticated company
export const getMyCompanyJobs = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).user.id;
  const jobs = await Job.find({ company: companyId }).sort({ createdAt: -1 });
  res.status(200).json({ jobs });
});