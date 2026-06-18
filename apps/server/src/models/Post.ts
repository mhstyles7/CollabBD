import mongoose, { Document, Schema } from 'mongoose';

export type PostCategory =
  | 'design'
  | 'development'
  | 'writing'
  | 'research'
  | 'tutoring'
  | 'photography'
  | 'marketing'
  | 'startup'
  | 'language'
  | 'music'
  | 'other';

export interface IPost extends Document {
  title: string;
  titlebn?: string;
  description: string;
  descriptionbn?: string;
  category: PostCategory;
  budget: {
    min: number;
    max: number;
    currency: 'BDT' | 'USD';
    isNegotiable: boolean;
  };
  deadline?: Date;
  isEmergency: boolean;
  isRemote: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city: string;
    district: string;
  };
  postedBy: mongoose.Types.ObjectId;
  skills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicationsCount: number;
  views: number;
  rooms: mongoose.Types.ObjectId[];
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    titlebn: { type: String, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    descriptionbn: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['design', 'development', 'writing', 'research', 'tutoring', 'photography', 'marketing', 'startup', 'language', 'music', 'other'],
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, enum: ['BDT', 'USD'], default: 'BDT' },
      isNegotiable: { type: Boolean, default: true },
    },
    deadline: { type: Date },
    isEmergency: { type: Boolean, default: false },
    isRemote: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [90.4125, 23.8103] },
      address: { type: String, default: '' },
      city: { type: String, default: 'Dhaka' },
      district: { type: String, default: 'Dhaka' },
    },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skills: [{ type: String }],
    status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
    tags: [{ type: String }],
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

PostSchema.index({ location: '2dsphere' });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ isEmergency: 1, createdAt: -1 });
PostSchema.index({ postedBy: 1 });

export default mongoose.model<IPost>('Post', PostSchema);
