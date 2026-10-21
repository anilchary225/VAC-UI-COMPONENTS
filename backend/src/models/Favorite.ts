import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  componentSlug: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    componentSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent duplicate favorites for the same user and component
FavoriteSchema.index({ userId: 1, componentSlug: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
