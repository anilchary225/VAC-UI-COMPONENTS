import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '@vac/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatarUrl?: string;
  githubId?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ['guest', 'user', 'admin'],
      default: 'user',
      index: true,
    },
    avatarUrl: { type: String },
    githubId: { type: String, sparse: true, index: true },
    googleId: { type: String, sparse: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
