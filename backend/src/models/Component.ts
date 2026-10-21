import mongoose, { Document, Schema } from 'mongoose';
import { ComponentStatus, ComponentFile, ComponentProp } from '@vac/shared';

export interface IValidationResult {
  valid: boolean;
  errors: string[];
  checkedAt: Date;
}

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
  draftFiles: ComponentFile[];
  draftDependencies: Map<string, string>;
  draftPeerDependencies: Map<string, string>;
  draftProps: ComponentProp[];
  draftChangelog?: string;
  lastValidationResult?: IValidationResult;
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
      enum: ['draft', 'validating', 'in_review', 'published', 'deprecated'],
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
    draftFiles: [
      {
        path: { type: String, required: true },
        name: { type: String, required: true },
        content: { type: String, required: true },
        language: { type: String, enum: ['typescript', 'javascript', 'css', 'json'] },
        isEntry: { type: Boolean, default: false },
      },
    ],
    draftDependencies: { type: Map, of: String, default: {} },
    draftPeerDependencies: { type: Map, of: String, default: {} },
    draftProps: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        defaultValue: { type: String },
        description: { type: String, default: '' },
      },
    ],
    draftChangelog: { type: String, default: '' },
    lastValidationResult: {
      valid: { type: Boolean },
      errors: [{ type: String }],
      checkedAt: { type: Date },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

ComponentSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const ComponentModel = mongoose.model<IComponent>('Component', ComponentSchema);
