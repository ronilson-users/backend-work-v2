import { z } from 'zod';

// ==================================
// Schema para cancelamento
// export const cancelJobSchema = z.object({
//   initiatedBy: z.enum(['company', 'worker'], {
//     errorMap: () => ({ message: 'initiatedBy must be "company" or "worker"' })
//   }),
//   reason: z.string()
//     .min(5, 'Reason must be at least 5 characters long')
//     .max(500, 'Reason cannot exceed 500 characters')
//     .trim()
// });

export const cancelJobSchema = z.object({
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters long')
    .max(500, 'Reason cannot exceed 500 characters')
    .trim()
});


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
    max: z.number().min(0, 'Budget cannot be negative'),
    type: z.enum(['hourly', 'daily', 'fixed']).default('hourly'),
    currency: z.string().default('BRL')
  }),
  
  duration: z.string()
    .min(1, 'Duration is required')
    .max(50, 'Duration cannot exceed 50 characters')
    .trim(),
  
  dates: z.object({
    start: z.string().datetime('Start date must be a valid date'),
    end: z.string().datetime('End date must be a valid date')
  }),
  
  // 🆕 CAMPOS DE ROTA (OPCIONAIS)
  workType: z.enum(['single_location', 'multi_location_route']).default('single_location').optional(),
  locations: z.array(z.object({
    sequence: z.number().min(1),
    name: z.string().min(2).max(100),
    address: z.string().min(5).max(200),
    type: z.enum(['store', 'supermarket', 'office', 'residence']),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional(),
    scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    estimatedDuration: z.number().min(0).max(480).optional()
  })).optional().default([]),
  
  routeConfig: z.object({
    maxLocationsPerDay: z.number().min(1).max(20).default(5),
    allowLocationReplacement: z.boolean().default(true),
    requirePhotoEachLocation: z.boolean().default(true),
    travelTimeBetweenLocations: z.number().min(0).max(240).default(30)
  }).optional().default({})
  
}).refine((data) => {
  // Validação: se workType é multi_location, locations é obrigatório
  if (data.workType === 'multi_location_route' && (!data.locations || data.locations.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Locations are required for multi-location routes"
});

// ==================================
// Schema para seleção de worker
export const selectWorkerSchema = z.object({
  workerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid worker ID format')
});