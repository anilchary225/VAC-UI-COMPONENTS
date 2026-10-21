import mongoose, { Document, Schema } from 'mongoose';

export interface ICollectionItem {
  componentSlug: string;
  addedAt: Date;
  order: number;
}

export interface ICollection extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  items: ICollectionItem[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionItemSchema = new Schema<ICollectionItem>(
  {
    componentSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const CollectionSchema = new Schema<ICollection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    items: {
      type: [CollectionItemSchema],
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate collection names per user
CollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const CollectionModel = mongoose.model<ICollection>('Collection', CollectionSchema);
