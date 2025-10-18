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
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'worker' | 'company' | 'admin';
  profile: IProfile;
  
  // Status e controle
  isActive: boolean;
  lastLogin?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    maxlength: [500, 'Bio cannot exceed 500 characters']
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
    maxlength: [1000, 'Experience cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be greater than 5'],
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
    maxlength: [100, 'Company name cannot exceed 100 characters']
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
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
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

// Schema principal do usuário
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Não retornar password por padrão
    },
    role: {
      type: String,
      enum: ['worker', 'company', 'admin'],
      required: [true, 'Role is required'],
      default: 'worker'
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
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Garantir que password nunca seja retornado
        return ret;
      }
    }
  }
);

// 🔐 MIDDLEWARE - Hash password antes de salvar
userSchema.pre('save', async function (next) {
  // Só hash password se foi modificado (ou é novo)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 🔐 MÉTODO - Comparar password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// 🔐 MÉTODO - Atualizar lastLogin
userSchema.methods.updateLastLogin = async function (): Promise<void> {
  this.lastLogin = new Date();
  await this.save();
};

// 📊 INDEXES para performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'profile.location': 1 });
userSchema.index({ 'profile.rating': -1 });
userSchema.index({ createdAt: -1 });

// ✅ VALIDAÇÃO - Campos específicos por role
userSchema.pre('save', function (next) {
  if (this.role === 'company') {
    // Company deve ter companyName
    if (!this.profile.companyName) {
      next(new Error('Company name is required for company role'));
      return;
    }
  }
  
  if (this.role === 'worker') {
    // Worker pode ter skills vazias, mas não undefined
    if (!this.profile.skills) {
      this.profile.skills = [];
    }
  }
  
  next();
});

// ✅ EXPORT
export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);







