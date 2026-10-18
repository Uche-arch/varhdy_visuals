import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/auth";
import { apiKey, cloudinary, cloudName, uploadFolder } from "@/lib/cloudinary";
import { resourceTypeFor, signSchema } from "@/lib/validation";

// Issues a short-lived Cloudinary upload signature, but only to a signed-in
// admin. The browser then uploads straight to Cloudinary, so large videos
// never pass through this server.
export async function POST(req: Request) {
  const denied = await guardAdminRequest(req);
  if (denied) return denied;

  const parsed = signSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  const { category } = parsed.data;

  const timestamp = Math.round(Date.now() / 1000);
  const folder = uploadFolder(category);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    resourceType: resourceTypeFor(category),
  });
}
