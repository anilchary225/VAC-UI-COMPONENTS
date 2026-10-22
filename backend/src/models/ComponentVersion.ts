import mongoose, { Document, Schema } from 'mongoose';
import { ComponentFile, ComponentProp } from '@vac/shared';

export interface IComponentVersion extends Document {
  componentSlug: string;
  version: string;
  changelog: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  files: ComponentFile[];
  props: ComponentProp[];
  integrityHash?: string;
  publishedAt: Date;
  publishedBy?: mongoose.Types.ObjectId;
  deprecated?: boolean;
  deprecationReason?: string;
}

const ComponentVersionSchema = new Schema<IComponentVersion>(
  {
    componentSlug: { type: String, required: true, index: true },
    version: { type: String, required: true },
    changelog: { type: String, default: '' },
    dependencies: { type: Map, of: String, default: {} },
    peerDependencies: { type: Map, of: String, default: {} },
    files: [
      {
        path: { type: String, required: true },
        name: { type: String, required: true },
        content: { type: String, required: true },
        language: { type: String, enum: ['typescript', 'javascript', 'css', 'json'] },
        isEntry: { type: Boolean, default: false },
      },
    ],
    props: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        defaultValue: { type: String },
        description: { type: String, default: '' },
      },
    ],
    integrityHash: { type: String },
    publishedAt: { type: Date, default: Date.now },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deprecated: { type: Boolean, default: false },
    deprecationReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Immutable version constraint per component
ComponentVersionSchema.index({ componentSlug: 1, version: 1 }, { unique: true });

export const ComponentVersionModel = mongoose.model<IComponentVersion>(
  'ComponentVersion',
  ComponentVersionSchema
);
