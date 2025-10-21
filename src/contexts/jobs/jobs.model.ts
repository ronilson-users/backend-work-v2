// src/contexts/jobs/jobs.model.ts 
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
 title: string;
 description: string;
 company: mongoose.Types.ObjectId;
 location: string;
 requiredSkills: string[];
 budget: {
  min: number;
  max: number;
  type: 'hourly' | 'daily' | 'fixed';
  currency: string;
 };
 duration: string;
 
 
 status: 'open' | 'in_progress' | 'completed' | 'cancelled';
 dates: {
  start: Date;
  end: Date;
 };
 applicants: mongoose.Types.ObjectId[];
 selectedWorker?: mongoose.Types.ObjectId;
 createdAt: Date;
 updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
 {
  title: {
   type: String,
   required: [true, 'Job title is required'],
   trim: true,
   minlength: [5, 'Title must be at least 5 characters long'],
   maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
   type: String,
   required: [true, 'Job description is required'],
   trim: true,
   minlength: [10, 'Description must be at least 10 characters long'],
   maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  company: {
   type: Schema.Types.ObjectId,
   ref: 'User',
   required: [true, 'Company is required'],
  },
  location: {
   type: String,
   required: [true, 'Location is required'],
   trim: true,
   maxlength: [200, 'Location cannot exceed 200 characters'],
  },
  requiredSkills: {
   type: [String],
   required: [true, 'At least one skill is required'],
   validate: {
    validator: (skills: string[]) => skills.length > 0 && skills.length <= 20,
    message: 'Must have between 1 and 20 skills'
   }
  },
  budget: {
   min: {
    type: Number,
    required: [true, 'Minimum budget is required'],
    min: [0, 'Budget cannot be negative']
   },
   max: {
    type: Number,
    required: [true, 'Maximum budget is required'],
    validate: {
     validator: function (this: any, value: number) {
      return value >= this.budget.min;
     },
     message: 'Maximum budget must be greater than or equal to minimum budget'
    }
   },
   type: {
    type: String,
    enum: ['hourly', 'daily', 'fixed'],
    default: 'hourly'
   },
   currency: {
    type: String,
    default: 'BRL'
   }
  },
  duration: {
   type: String,
   required: [true, 'Duration is required'],
   trim: true,
   maxlength: [50, 'Duration cannot exceed 50 characters'],
  },
  status: {
   type: String,
   enum: ['open', 'in_progress', 'completed', 'cancelled'],
   default: 'open'
  },
  dates: {
   start: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
     validator: (value: Date) => value > new Date(),
     message: 'Start date must be in the future'
    }
   },
   end: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
     validator: function (this: any, value: Date) {
      return value > this.dates.start;
     },
     message: 'End date must be after start date'
    }
   }
  },
  applicants: [{
   type: Schema.Types.ObjectId,
   ref: 'User'
  }],
  selectedWorker: {
   type: Schema.Types.ObjectId,
   ref: 'User'
  }
 },
 {
  timestamps: true,
  toJSON: {
   transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    // ✅ CORREÇÃO: Remover __v corretamente
    const { __v, ...jobWithoutVersion } = ret;
    return jobWithoutVersion;
   }
  }
 }
);

//==========================
//Indexes para performance
//==========================
jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ 'budget.min': 1, 'budget.max': 1 });
jobSchema.index({ 'dates.start': 1, 'dates.end': 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ createdAt: -1 });


export const Job: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);
