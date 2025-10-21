import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../contexts/users/users.model';
import { env } from '../shared/config/env';

async function testPassword() {
  await mongoose.connect(env.MONGODB_URI);
  const user = await User.findOne({ email: 'debug2@test.com' }).select('+password');
  if (!user) {
    console.log('Usuário não encontrado');
    return;
  }
  console.log('Hash da senha no banco:', user.password);
  const isMatch = await bcrypt.compare('Senha123', user.password);
  console.log(`Senha válida: ${isMatch}`);
  await mongoose.connection.close();
}

testPassword().catch(console.error);

