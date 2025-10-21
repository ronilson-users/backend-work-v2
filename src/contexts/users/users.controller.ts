// src/contexts/users/users.controller.ts
import { Request, Response, NextFunction } from "express";
import {
 createUser,
 findUserByEmail,
 getAllUsers,
 getUserProfile,
 updateUserProfile,
 updateUserAvailability,
 addUserSkills
} from "./users.service";

import { logger } from "@/shared/utils/logger";
import { AppError } from "@/shared/utils/error";

export const userController = {
 
 async register(req: Request, res: Response, next: NextFunction) {
  try {
   const user = await createUser(req.body);
   logger.info(`✅ Novo usuário registrado: ${user.email}`);

   return res.status(201).json({
    success: true,
    message: "Usuário criado com sucesso",
    data: {
     id: user._id,
     name: user.name,
     email: user.email,
     role: user.role
    }
   });
  } catch (error) {
   logger.error(`❌ Erro ao registrar usuário: ${error}`);
   next(error);
  }
 },

 /**
 * Buscar usuário por email
 */

 async findByEmail(req: Request, res: Response, next: NextFunction) {
  try {
   const { email } = req.params;
   const user = await findUserByEmail(email);

   if (!user) {
    throw new AppError("Usuário não encontrado", 404);
   }

   return res.json({
    success: true,
    data: {
     id: user._id,
     name: user.name,
     email: user.email,
     role: user.role
    }
   });
  } catch (error) {
   next(error);
  }
 },

 /**
 * Listar todos os usuários
 */
 async getAll(req: Request, res: Response, next: NextFunction) {
  try {
   const users = await getAllUsers();

   return res.json({
    success: true,
    count: users.length,
    data: users
   });
  } catch (error) {
   next(error);
  }
 },

 /**
 * Buscar perfil do usuário autenticado
 */
 async getProfile(req: Request, res: Response, next: NextFunction) {
  try {
   const userId = (req as any).user?.id;
   if (!userId) {
    throw new AppError("Usuário não autenticado", 401);
   }

   const user = await getUserProfile(userId);
   if (!user) {
    throw new AppError("Usuário não encontrado", 404);
   }

   return res.json({
    success: true,
    data: {
     id: user._id,
     name: user.name,
     email: user.email,
     role: user.role,
     profile: user.profile,
     isActive: user.isActive
    }
   });
  } catch (error) {
   next(error);
  }
 },

 /**
 * Atualizar perfil do usuário autenticado
 */
 async updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
   const userId = (req as any).user?.id;
   if (!userId) {
    throw new AppError("Usuário não autenticado", 401);
   }

   const updateData = req.body;
   const user = await updateUserProfile(userId, updateData);

   logger.info(`✏️ Perfil atualizado: ${user.email}`);

   return res.json({
    success: true,
    message: "Perfil atualizado com sucesso",
    data: {
     id: user._id,
     name: user.name,
     email: user.email,
     role: user.role,
     profile: user.profile
    }
   });
  } catch (error) {
   next(error);
  }
 },

 /**
 * Atualizar disponibilidade (somente workers)
 */
 async updateAvailability(req: Request, res: Response, next: NextFunction) {
  try {
   const userId = (req as any).user?.id;
   if (!userId) {
    throw new AppError("Usuário não autenticado", 401);
   }

   const { availability } = req.body;
   const user = await updateUserAvailability(userId, availability);

   logger.info(`🕒 Disponibilidade atualizada: ${user.email}`);

   return res.json({
    success: true,
    message: "Disponibilidade atualizada com sucesso",
    data: { availability: user.profile.availability }
   });
  } catch (error) {
   next(error);
  }
 },

 /**
 * Adicionar skills (somente workers)
 */
 async addSkills(req: Request, res: Response, next: NextFunction) {
  try {
   const userId = (req as any).user?.id;
   if (!userId) {
    throw new AppError("Usuário não autenticado", 401);
   }

   const { skills } = req.body;
   const user = await addUserSkills(userId, skills);

   logger.info(`🧠 Skills atualizadas: ${user.email}`);

   return res.json({
    success: true,
    message: "Skills atualizadas com sucesso",
    data: { skills: user.profile.skills }
   });
  } catch (error) {
   next(error);
  }
 }
};
