import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';

/**
 * @Cria um novo usuário com hash de senha
 */
export const createUser = async (userData: any) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = new User({
    ...userData,
    password: hashedPassword,
  });
  return await newUser.save();
};

/**
 * Busca usuário pelo email
 */
export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

/**
 * Compara senha informada com hash armazenado
 */
export const comparePassword = async (plainPassword: string, hashedPassword: string) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Retorna todos os usuários (somente para administração)
 */
export const getAllUsers = async () => {
  return await User.find().select('-password');
};