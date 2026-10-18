import { connectToDatabase } from "@/lib/mongodb";
import LoginAttempt from "@/models/LoginAttempt";

export async function hitRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  await connectToDatabase();
  const now = new Date();

  // Clear an expired window before counting (the TTL monitor runs only
  // about once a minute, so we don't rely on it alone).
  await LoginAttempt.deleteOne({ key, expiresAt: { $lte: now } });

  const doc = await LoginAttempt.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(now.getTime() + windowSeconds * 1000) },
    },
    { upsert: true, new: true }
  );

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000)
  );
  return { allowed: doc.count <= max, retryAfterSeconds };
}

export async function clearRateLimit(key: string) {
  await connectToDatabase();
  await LoginAttempt.deleteOne({ key });
}
