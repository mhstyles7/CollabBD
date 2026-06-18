import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  room: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  isEdited: boolean;
  replyTo?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileUrl: { type: String },
    isEdited: { type: Boolean, default: false },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

MessageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
