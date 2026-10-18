import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// One document per rate-limit key (e.g. an IP). MongoDB removes it
// automatically once `expiresAt` passes (TTL index), which keeps the
// limiter working on serverless hosts where memory isn't shared.
const LoginAttemptSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

LoginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type LoginAttemptDoc = InferSchemaType<typeof LoginAttemptSchema>;

const LoginAttempt: Model<LoginAttemptDoc> =
  (mongoose.models.LoginAttempt as Model<LoginAttemptDoc>) ||
  mongoose.model<LoginAttemptDoc>("LoginAttempt", LoginAttemptSchema);

export default LoginAttempt;
