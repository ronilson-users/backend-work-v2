// src/contexts/contracts/contracts.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContract extends Document {
 // 🔗 Referências
 job: mongoose.Types.ObjectId;
 worker: mongoose.Types.ObjectId;
 company: mongoose.Types.ObjectId;

 // 📋 Termos do Contrato
 terms: {
  title: string;
  description: string;
  compensation: {
   amount: number;
   currency: string;
   type: 'hourly' | 'daily' | 'fixed';
   paymentSchedule: 'weekly' | 'biweekly' | 'monthly' | 'on_completion';
  };
  schedule: {
   startDate: Date;
   endDate: Date;
   workHours: string;
   daysOfWeek: string[];
   totalHours?: number;
  };
  deliverables: string[];
  responsibilities: string[];
 };

 // ⚖️ Cláusulas Legais
 clauses: {
  terminationNotice: number; // dias de aviso prévio
  confidentiality: boolean;
  intellectualProperty: 'company' | 'worker' | 'shared';
  penalties: {
   lateCompletion?: number;
   earlyTermination?: number;
  };
 };

 // 📄 Status e Assinaturas
 status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
 signatures: {
  worker: {
   signed: boolean;
   signedAt?: Date;
   ip?: string;
  };
  company: {
   signed: boolean;
   signedAt?: Date;
   ip?: string;
  };
 };

 // 📊 Metadata
 createdAt: Date;
 updatedAt: Date;
 activatedAt?: Date;
 completedAt?: Date;
}

const contractSchema = new Schema<IContract>(
 {
  job: {
   type: Schema.Types.ObjectId,
   ref: 'Job',
   required: [true, 'Job é obrigatório'],
   unique: true // Um contrato por job
  },
  worker: {
   type: Schema.Types.ObjectId,
   ref: 'User',
   required: [true, 'Worker é obrigatório']
  },
  company: {
   type: Schema.Types.ObjectId,
   ref: 'User',
   required: [true, 'Company é obrigatória']
  },
  terms: {
   title: {
    type: String,
    required: [true, 'Título do contrato é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode exceder 200 caracteres']
   },
   description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [2000, 'Descrição não pode exceder 2000 caracteres']
   },
   compensation: {
    amount: {
     type: Number,
     required: [true, 'Valor da compensação é obrigatório'],
     min: [0, 'Valor não pode ser negativo']
    },
    currency: {
     type: String,
     default: 'BRL'
    },
    type: {
     type: String,
     enum: ['hourly', 'daily', 'fixed'],
     required: true
    },
    paymentSchedule: {
     type: String,
     enum: ['weekly', 'biweekly', 'monthly', 'on_completion'],
     default: 'monthly'
    }
   },
   schedule: {
    startDate: {
     type: Date,
     required: [true, 'Data de início é obrigatória']
    },
    endDate: {
     type: Date,
     required: [true, 'Data de término é obrigatória']
    },
    workHours: {
     type: String,
     required: [true, 'Horário de trabalho é obrigatório']
    },
    daysOfWeek: [{
     type: String,
     enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    totalHours: {
     type: Number,
     min: 0
    }
   },
   deliverables: [{
    type: String,
    trim: true
   }],
   responsibilities: [{
    type: String,
    trim: true
   }]
  },
  clauses: {
   terminationNotice: {
    type: Number,
    default: 7, // 7 dias de aviso prévio
    min: 0
   },
   confidentiality: {
    type: Boolean,
    default: true
   },
   intellectualProperty: {
    type: String,
    enum: ['company', 'worker', 'shared'],
    default: 'company'
   },
   penalties: {
    lateCompletion: {
     type: Number,
     min: 0
    },
    earlyTermination: {
     type: Number,
     min: 0
    }
   }
  },
  status: {
   type: String,
   enum: ['draft', 'pending', 'active', 'completed', 'cancelled', 'disputed'],
   default: 'draft'
  },
  signatures: {
   worker: {
    signed: {
     type: Boolean,
     default: false
    },
    signedAt: Date,
    ip: String
   },
   company: {
    signed: {
     type: Boolean,
     default: false
    },
    signedAt: Date,
    ip: String
   }
  },
  activatedAt: Date,
  completedAt: Date
 },
 {
  timestamps: true,
  toJSON: {
   transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
   }
  }
 }
);

//==========================
//Indexes para performance
//==========================
contractSchema.index({ job: 1 });
contractSchema.index({ worker: 1 });
contractSchema.index({ company: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ 'terms.schedule.startDate': 1 });
contractSchema.index({ 'terms.schedule.endDate': 1 });
contractSchema.index({ createdAt: -1 });

//=================================
// Middleware para atualizar datas automáticas
//=================================
contractSchema.pre('save', function (next) {
 if (this.status === 'active' && !this.activatedAt) {
  this.activatedAt = new Date();
 }
 if (this.status === 'completed' && !this.completedAt) {
  this.completedAt = new Date();
 }
 next();
});

export const Contract: Model<IContract> = mongoose.model<IContract>('Contract', contractSchema);