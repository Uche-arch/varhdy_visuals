import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { CATEGORIES } from "@/lib/constants";

const AssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video"], required: true },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    format: { type: String },
  },
  { _id: false }
);

const MediaSchema = new Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    caption: { type: String, trim: true, maxlength: 300 },
    assets: {
      type: [AssetSchema],
      validate: {
        validator: (v: unknown[]) => v.length >= 1 && v.length <= 4,
        message: "A post needs between 1 and 4 assets.",
      },
    },
  },
  { timestamps: true }
);

MediaSchema.index({ category: 1, createdAt: -1 });

export type MediaDoc = InferSchemaType<typeof MediaSchema>;

const Media: Model<MediaDoc> =
  (mongoose.models.Media as Model<MediaDoc>) ||
  mongoose.model<MediaDoc>("Media", MediaSchema);

export default Media;
