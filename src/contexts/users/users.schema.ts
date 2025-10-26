import { z } from 'zod';

export const RoleEnum = z.enum(['user', 'worker', 'company', 'admin']);
export type Role = z.infer<typeof RoleEnum>;

export const DayOfWeekEnum = z.enum([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]);

export const AvailabilityTypeEnum = z.enum([
  'full-time', 'part-time', 'flexible'
]);

/**
 * Schema para Registro
 */
export const UserRegisterSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
  role: RoleEnum.default('user'),
});


/**
 * Schema para Login
 */
export const UserLoginSchema = z.object({
  email: z.string({
    required_error: "O email é obrigatório",
    invalid_type_error: "O email deve ser um texto",
  }).email('Formato de email inválido'),
  
  password: z.string({
    required_error: "A senha é obrigatória",
    invalid_type_error: "A senha deve ser um texto",
  }).min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

/**
 * Schema para Disponibilidade
 */
export const UserAvailabilitySchema = z.object({
 availability: z.object({
  days: z.array(DayOfWeekEnum).min(1, 'Selecione pelo menos um dia'),
  hours: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Formato deve ser HH:MM-HH:MM'),
  type: AvailabilityTypeEnum
 })
});

/**
 * Schema para Skills
 */
export const UserSkillsSchema = z.object({
 skills: z.array(z.string().min(1, 'Skill não pode ser vazia')).min(1, 'Adicione pelo menos uma skill')
});

/**
 * Schema para Atualizar Perfil
 */
export const UserUpdateProfileSchema = z.object({
 name: z
  .string({
    required_error: "O nome é obrigatório",
   invalid_type_error: "O nome deve ser um texto",
  })
  .min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),

 profile: z
  .object({
   bio: z
    .string({
    required_error: " ",
   invalid_type_error: " ",
    })
    .max(500, 'Bio não pode exceder 500 caracteres').optional(),

   phone: z
    .string({
      required_error: "",
   invalid_type_error: " ",
    })
    .optional(),

   location: z
    .string({
      required_error: "",
   invalid_type_error: " ",
    })
    .max(200, 'Localização não pode exceder 200 caracteres')
    .optional(),

   hourlyRate: z
    .object({
     min: z
      .number()
      .min(0, 'Valor mínimo deve ser positivo')
      .optional(),

     max: z
      .number()
      .min(0, 'Valor máximo deve ser positivo')
      .optional(),

     currency: z
      .string()
      .default('BRL')
      .optional()

    }).optional()
  }).optional()
});

/**
 * Tipos para usar no código
 */
export type UserRegisterData = z.infer<typeof UserRegisterSchema>;
export type UserLoginData = z.infer<typeof UserLoginSchema>;
export type UserAvailabilityData = z.infer<typeof UserAvailabilitySchema>;
export type UserSkillsData = z.infer<typeof UserSkillsSchema>;
export type UserUpdateProfileData = z.infer<typeof UserUpdateProfileSchema>;