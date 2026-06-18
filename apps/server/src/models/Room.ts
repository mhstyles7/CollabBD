import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  namebn?: string;
  slug: string;
  description: string;
  descriptionbn?: string;
  icon: string; // Lucide icon name
  category: string;
  members: mongoose.Types.ObjectId[];
  memberCount: number;
  isOfficial: boolean;
  coverColor: string; // Tailwind color or hex
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true },
    namebn: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    descriptionbn: { type: String },
    icon: { type: String, default: 'Users' },
    category: { type: String, default: 'general' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 0 },
    isOfficial: { type: Boolean, default: false },
    coverColor: { type: String, default: '#3B82F6' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>('Room', RoomSchema);
