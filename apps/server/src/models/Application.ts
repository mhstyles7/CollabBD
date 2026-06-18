import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  post: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  message: string;
  proposedBudget: number;
  currency: 'BDT' | 'USD';
  estimatedDays: number;
  portfolioLinks: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  isRead: boolean;
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, maxlength: 1000 },
    proposedBudget: { type: Number, required: true },
    currency: { type: String, enum: ['BDT', 'USD'], default: 'BDT' },
    estimatedDays: { type: Number, required: true },
    portfolioLinks: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ApplicationSchema.index({ post: 1, applicant: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
