// src/contexts/users/users.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IProfile {
 // Dados básicos
 photo?: string;
 bio?: string;
 phone?: string;

 // Endereço
 address?: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
 };

 // Para workers
 skills?: string[];
 experience?: string;
 rating?: number;
 totalJobs?: number;
 hourlyRate?: {
  min: number;
  max: number;
  currency: string;
 };

 // Para companies
 companyName?: string;
 industry?: string;
 companySize?: string;
 website?: string;
 description?: string;

 // Localização
 location?: string;

 // Verificações
 isEmailVerified?: boolean;
 isPhoneVerified?: boolean;

 // Social
 socialLinks?: {
  linkedin?: string;
  github?: string;
  portfolio?: string;
 };
 availability?: {
  days: string[]; // ['monday', 'tuesday', ...]
  hours: string; // '09:00-18:00'
  type: 'full-time' | 'part-time' | 'flexible';
 };
}

export interface IUser extends Document {
 name: string;
 email: string;
 password: string;
 role: 'user' | 'worker' | 'company' | 'admin'; 
 profile: IProfile;
 isActive: boolean;
 lastLogin?: Date;
 createdAt: Date;
 updatedAt: Date;
 comparePassword(candidatePassword: string): Promise<boolean>;
 updateLastLogin(): Promise<void>;
}

// Schema do profile
const profileSchema = new Schema<IProfile>({
 photo: {
  type: String,
  trim: true
 },
 bio: {
  type: String,
  trim: true,
  maxlength: [500, 'Bio não pode exceder 500 caracteres']
 },
 phone: {
  type: String,
  trim: true
 },
 address: {
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true, default: 'Brasil' }
 },
 skills: [{
  type: String,
  trim: true
 }],
 experience: {
  type: String,
  trim: true,
  maxlength: [1000, 'Experiência não pode exceder 1000 caracteres']
 },
 rating: {
  type: Number,
  min: [0, 'Avaliação não pode ser menor que 0'],
  max: [5, 'Avaliação não pode ser maior que 5'],
  default: 0
 },
 totalJobs: {
  type: Number,
  default: 0,
  min: 0
 },
 hourlyRate: {
  min: {
   type: Number,
   min: 0
  },
  max: {
   type: Number,
   min: 0
  },
  currency: {
   type: String,
   default: 'BRL'
  }
 },
 companyName: {
  type: String,
  trim: true,
  maxlength: [100, 'Nome da empresa não pode exceder 100 caracteres']
 },
 industry: {
  type: String,
  trim: true
 },
 companySize: {
  type: String,
  enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  trim: true
 },
 website: {
  type: String,
  trim: true
 },
 description: {
  type: String,
  trim: true,
  maxlength: [1000, 'Descrição não pode exceder 1000 caracteres']
 },
 location: {
  type: String,
  trim: true,
  maxlength: [200, 'Localização não pode exceder 200 caracteres']
 },
 isEmailVerified: {
  type: Boolean,
  default: false
 },
 isPhoneVerified: {
  type: Boolean,
  default: false
 },
 socialLinks: {
  linkedin: {
   type: String,
   trim: true
  },
  github: {
   type: String,
   trim: true
  },
  portfolio: {
   type: String,
   trim: true
  }
 }
}, { _id: false });

const userSchema = new Schema<IUser>(
 {
  name: {
   type: String,
   required: [true, 'Nome é obrigatório'],
   trim: true,
   minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
   maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },
  email: {
   type: String,
   required: [true, 'Email é obrigatório'],
   unique: true,
   trim: true,
   lowercase: true,
   match: [
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    'Por favor, insira um email válido'
   ]
  },
  password: {
   type: String,
   required: [true, 'Senha é obrigatória'],
   minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
   select: false
  },
  role: {
   type: String,
   enum: ['user', 'worker', 'company', 'admin'], 
   required: [true, 'Tipo de usuário é obrigatório'],
   default: 'user' 
  },
  profile: {
   type: profileSchema,
   default: () => ({})
  },
  isActive: {
   type: Boolean,
   default: true
  },
  lastLogin: {
   type: Date
  }
 },
 {
  timestamps: true,
  toJSON: {
   transform: (doc, ret: any) => { 
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
   }
  }
 }
);

// 🔐 MIDDLEWARE - Hash password antes de salvar ou atualizar
userSchema.pre('save', async function (next) {
 if (!this.isModified('password')) {
  return next();
 }

 try {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
 } catch (error: any) {
  next(error);
 }
});

// 🔒 Garante hash também em updates via findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function (next) {
 const update: any = this.getUpdate();
 if (update?.password) {
  const salt = await bcrypt.genSalt(12);
  update.password = await bcrypt.hash(update.password, salt);
  this.setUpdate(update);
 }
 next();
});

// 🔐 Comparar password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
 try {
  return await bcrypt.compare(candidatePassword, this.password);
 } catch (error) {
  throw new Error('Erro ao comparar senhas');
 }
};

// 🔐  - Atualizar lastLogin
userSchema.methods.updateLastLogin = async function (): Promise<void> {
 this.lastLogin = new Date();
 await this.save();
};

// 📊 INDEXES para performance 

userSchema.index({ role: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'profile.location': 1 });
userSchema.index({ 'profile.rating': -1 });
userSchema.index({ createdAt: -1 });
userSchema.pre('save', function (next) {
  if (this.role === 'company') {
    
    if (!this.profile) {
      this.profile = {};
    }
    
    // Usa o nome como fallback para companyName
    if (!this.profile.companyName && this.name) {
      this.profile.companyName = this.name;
    }
  }

  if (this.role === 'worker') {
    if (!this.profile.skills) {
      this.profile.skills = [];
    }
  }

  next();
});

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);