import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  namebn?: string; // Bangla name
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  bio?: string;
  biobn?: string;
  role: 'user' | 'admin';
  accountType: 'client' | 'worker';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  studentIdUrl?: string;
  badges: Array<'student' | 'freelancer' | 'expert' | 'verified'>;
  skills: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address: string;
    city: string;
    district: string;
  };
  university?: string;
  universityEmail?: string;
  isUniversityVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  completedJobs: number;
  rating: number;
  ratingCount: number;
  rooms: mongoose.Types.ObjectId[];
  isAvailableNow: boolean;
  portfolioLinks: string[];
  language: 'en' | 'bn';
  title?: string;
  hourlyRate?: number;
  qualifications: Array<{ _id?: string; title: string; organization: string; year: string }>;
  portfolio: Array<{ _id?: string; title: string; link: string }>;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    namebn: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, sparse: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    biobn: { type: String, maxlength: 500, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    accountType: { type: String, enum: ['client', 'worker'], default: 'client' },
    verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
    studentIdUrl: { type: String },
    badges: [{ type: String, enum: ['student', 'freelancer', 'expert', 'verified'] }],
    skills: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [90.4125, 23.8103] }, // Dhaka default
      address: { type: String, default: '' },
      city: { type: String, default: 'Dhaka' },
      district: { type: String, default: 'Dhaka' },
    },
    university: { type: String },
    universityEmail: { type: String },
    isUniversityVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
    isAvailableNow: { type: Boolean, default: false },
    portfolioLinks: [{ type: String }],
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    title: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    qualifications: [{
      title: { type: String, required: true },
      organization: { type: String, required: true },
      year: { type: String, required: true },
    }],
    portfolio: [{
      title: { type: String, required: true },
      link: { type: String, required: true },
    }],
  },
  { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || '');
};

export default mongoose.model<IUser>('User', UserSchema);
