import { z } from 'zod';



// ==================================
//
export const cancelJobSchema = z.object({
  initiatedBy: z.enum(['company', 'worker'], {
    errorMap: () => ({ message: 'initiatedBy must be "company" or "worker"' })
  }),
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters long')
    .max(500, 'Reason cannot exceed 500 characters')
    .trim()
});

// ==================================
//
export const createJobSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  
  location: z.string()
    .min(2, 'Location is required')
    .max(200, 'Location cannot exceed 200 characters')
    .trim(),
  
  requiredSkills: z.array(z.string())
    .min(1, 'At least one skill is required')
    .max(20, 'Cannot have more than 20 skills'),
  
  budget: z.object({
    min: z.number().min(0, 'Budget cannot be negative'),
    max: z.number().min(0, 'Budget cannot be negative')
  }),
  
  duration: z.string()
    .min(1, 'Duration is required')
    .max(50, 'Duration cannot exceed 50 characters')
    .trim(),
  
  dates: z.object({
    start: z.string().datetime('Start date must be a valid date'),
    end: z.string().datetime('End date must be a valid date')
  })
});

// ==================================
//
export const selectWorkerSchema = z.object({
  workerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid worker ID format')
});