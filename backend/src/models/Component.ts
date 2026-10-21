import mongoose, { Document, Schema } from 'mongoose';
import { ComponentStatus } from '@vac/shared';

export interface IComponent extends Document {
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: ComponentStatus;
  currentVersion: string;
  previewComponent?: string;
  isOfficial: boolean;
  downloadsCount: number;
  favoritesCount: number;
  documentation: string;
  license: string;
  author: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema<IComponent>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    status: {
      type: String,
      enum: ['draft', 'in_review', 'published', 'deprecated'],
      default: 'draft',
      index: true,
    },
    currentVersion: { type: String, default: '1.0.0' },
    previewComponent: { type: String },
    isOfficial: { type: Boolean, default: true },
    downloadsCount: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    documentation: { type: String, default: '' },
    license: { type: String, default: 'MIT' },
    author: { type: String, default: 'VAC Team' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

ComponentSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const ComponentModel = mongoose.model<IComponent>('Component', ComponentSchema);
