import bcrypt from 'bcryptjs';
import { User } from '@/contexts/users/users.model';
import { generateToken } from '@/shared/lib/jwt';
import  { } from '.@/shared/middleware/errorHandler.ts';
import { RoleEnum } from '../users/users.schema';


// Example login/issue token flow — validate role before issuing token
export function issueTokenForUser(user: { _id: string; role?: string }) {
  // Validate/normalize role so the token can't get an invalid role string
  const parsed = RoleEnum.safeParse(user.role ?? 'user');
  const role = parsed.success ? parsed.data : 'user'; // fallback to 'user' if invalid/missing

  const token = generateToken({ id: user._id, role });
  return token;
}

export async function registerUser(data: any) {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw createError('Email already in use', 400);

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashed });

  const token = generateToken({ id: user._id, role: user.role });
  return { user: sanitizeUser(user), token };
}

export async function loginUser(data: any) {
  const user = await User.findOne({ email: data.email });
  if (!user) throw createError('Invalid email or password', 401);

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw createError('Invalid email or password', 401);

  const token = generateToken({ id: user._id, role: user.role });
  return { user: sanitizeUser(user), token };
}

// Remove campos sensíveis
function sanitizeUser(user: any) {
  const { password, ...safe } = user.toObject();
  return safe;
}

