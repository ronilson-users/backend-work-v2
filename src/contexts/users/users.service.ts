import { User, IUser } from './users.model';
import { AppError } from '@/shared/utils/error';
import { logger } from '@/shared/utils/logger';

//
export const createUser = async (data: { name: string; email: string; password: string; role: string }) => {
 
  const start = Date.now();
  const user = new User(data);
  const savedUser = await user.save();
  
  logger.info(`👤 Novo usuário criado: ${savedUser.email}`);
  
  logger.info(`Criação de usuário levou ${Date.now() - start}ms`);
  
  return savedUser;
};

//
export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

//
export const getAllUsers = async () => {
  return await User.find().select('-password');
};

//
export const getUserProfile = async (userId: string) => {
  return await User.findById(userId).select('-password');
};

//
export const updateUserProfile = async (userId: string, updateData: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Usuário não encontrado', 404);

  if (updateData.email && updateData.email !== user.email) {
    const existing = await User.findOne({ email: updateData.email });
    if (existing) throw new AppError('E-mail já está em uso', 409);
  }

  Object.assign(user, {
    ...updateData,
    profile: { ...user.profile, ...updateData.profile },
  });

  const updated = await user.save();
  logger.info(`✏️ Perfil atualizado: ${user.email}`);
  return updated;
};

//
export const updateUserAvailability = async (userId: string, availability: any) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Usuário não encontrado', 404);
  if (user.role !== 'worker') throw new AppError('Apenas workers podem atualizar disponibilidade', 403);

  user.profile.availability = availability;
  return await user.save();
};

//
export const addUserSkills = async (userId: string, skills: string[]) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Usuário não encontrado', 404);
  
  // Permite user e worker
  if (!['user', 'worker'].includes(user.role)) {
    throw new AppError('Apenas users e workers podem adicionar skills', 403);
  }

  const newSkills = skills.filter(skill => !user.profile.skills?.includes(skill));
  user.profile.skills = [...(user.profile.skills || []), ...newSkills];
  return await user.save();
};

//
export const findWorkersByCriteria = async (criteria: {
  skills?: string[];
  location?: string;
  minRating?: number;
}) => {
  const query: any = {
    role: 'worker',
    isActive: true,
    ...(criteria.skills?.length && { 'profile.skills': { $in: criteria.skills } }),
    
    ...(criteria.location && { 'profile.location': new RegExp(criteria.location, 'i') }),
    
    ...(criteria.minRating && { 'profile.rating': { $gte: criteria.minRating } }),
  };

  return await User.find(query).select('-password').sort({ 'profile.rating': -1 });
};