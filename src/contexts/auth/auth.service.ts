import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Changed from bcryptPass
import { User, IUser } from '../users/users.model';
import { env } from '../../shared/config/env';
import { AppError } from '../../shared/utils/error';
import { logger } from '../../shared/utils/logger';

export class AuthService {
 async login(email: string, password: string) {
  logger.info(`🔐 Tentativa de login para: ${email}`);
  const user = await User.findOne({ email }).select('+password');
  logger.info(`👤 Usuário encontrado: ${user ? 'SIM' : 'NÃO'}`);
  if (!user) {
   logger.warn(`❌ Usuário não encontrado: ${email}`);
   throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }
  logger.info(`🔑 Comparando senha para: ${user.name}`);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  logger.info(`✅ Senha válida: ${isPasswordValid}`);
  if (!isPasswordValid) {
   logger.warn(`❌ Senha inválida para: ${email}`);
   throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
   throw new AppError('Conta desativada', 401, 'ACCOUNT_DISABLED');
  }
  user.lastLogin = new Date();
  await user.save();
  const token = this.generateToken(user);
  logger.info(`🎉 Login bem-sucedido para: ${user.name}`);
  return {
   user: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
   },
   token,
  };
 }

 private generateToken(user: IUser): string {
  const payload = {
   id: user._id.toString(),
   email: user.email,
   role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
   expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
 }
 
 

 async getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
   throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }
  return {
   id: user._id.toString(),
   name: user.name,
   email: user.email,
   role: user.role,
   profile: user.profile,
   isActive: user.isActive,
   lastLogin: user.lastLogin,
  };
 }


 
 verifyToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
   
   throw new AppError('Token inválido ou expirado', 401, 'INVALID_TOKEN');
    return null; 
  }
}
 
 
 
 
 
}

export const authService = new AuthService();