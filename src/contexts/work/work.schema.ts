// src/contexts/work/work.schema.ts
import { z } from 'zod';

/**
 * Schema para check-in 
 */
export const CheckInSchema = z.object({
  body: z.object({
    location: z.string().min(2, 'Localização é obrigatória'),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    }).optional(),
    photos: z.array(z.string()).default([]), // ✅ URLs/base64 simples
    notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional()
  })
});

/**
 * Schema para check-out 
 */
export const CheckOutSchema = z.object({
  body: z.object({
    location: z.string().min(2, 'Localização é obrigatória'),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    }).optional(),
    photos: z.array(z.string()).default([]), // ✅ URLs/base64 simples
    hoursWorked: z.number().min(0.25, 'Mínimo 15 minutos').max(24, 'Máximo 24 horas'),
    completionNotes: z.string().max(2000, 'Notas não podem exceder 2000 caracteres').optional()
  })
});

/**
 * Schema para upload de foto (SIMPLIFICADO)
 */
export const UploadPhotoSchema = z.object({
  body: z.object({
    photoUrl: z.string().url('URL da foto deve ser válida').optional(), 
    photoData: z.string().optional(), // base64 alternativo
    type: z.enum(['check-in', 'check-out', 'work']),
    contractId: z.string().optional()
  })
});

// Tipos
export type CheckInData = z.infer<typeof CheckInSchema>['body'];
export type CheckOutData = z.infer<typeof CheckOutSchema>['body'];
export type UploadPhotoData = z.infer<typeof UploadPhotoSchema>['body'];