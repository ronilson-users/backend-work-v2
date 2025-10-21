// Criar arquivo: src/scripts/debug-auth.ts
import mongoose from 'mongoose';
import bcryptPass from 'bcryptjs';
import { User } from '../contexts/users/users.model';
import { env } from '../shared/config/env';

const debugAuth = async () => {
  await mongoose.connect(env.MONGODB_URI);
  
  console.log('🔍 DEBUG AUTH - Verificando usuários...');
  
  // Buscar todos os usuários
  const users = await User.find().select('+password');
  
  console.log(`📊 Total de usuários: ${users.length}`);
  
  for (const user of users) {
    console.log('\n---');
    console.log(`👤 Nome: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔐 Hash: ${user.password}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`📅 Criado: ${user.createdAt}`);
    
    // Testar senha "123456"
    const testPassword = '123456';
    const isValid = await bcryptPass.compare(testPassword, user.password);
    console.log(`✅ Senha "123456" válida: ${isValid}`);
  }
  
  await mongoose.disconnect();
  console.log('\n🎯 DEBUG COMPLETO');
};

debugAuth().catch(console.error);