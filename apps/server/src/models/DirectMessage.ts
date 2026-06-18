import mongoose, { Document, Schema } from 'mongoose';

export interface IDirectMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const DirectMessageSchema = new Schema<IDirectMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DirectMessageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
