import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guardAdminRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { cloudinary, uploadFolder } from "@/lib/cloudinary";
import { createMediaSchema, resourceTypeFor } from "@/lib/validation";
import Media from "@/models/Media";

export async function POST(req: Request) {
  const denied = await guardAdminRequest(req);
  if (denied) return denied;

  const parsed = createMediaSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 }
    );
  }
  const { category, caption, assets } = parsed.data;
  const folder = uploadFolder(category);
  const resourceType = resourceTypeFor(category);

  // Don't trust the browser: confirm each file really exists in our
  // Cloudinary folder and read its true details from Cloudinary.
  const verified = [];
  try {
    for (const asset of assets) {
      if (!asset.publicId.startsWith(`${folder}/`)) {
        return NextResponse.json({ error: "Invalid asset." }, { status: 400 });
      }
      const r = await cloudinary.api.resource(asset.publicId, {
        resource_type: resourceType,
      });
      verified.push({
        publicId: r.public_id as string,
        url: r.secure_url as string,
        resourceType,
        width: r.width as number | undefined,
        height: r.height as number | undefined,
        duration: r.duration as number | undefined,
        format: r.format as string | undefined,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Could not verify the uploaded file." },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const doc = await Media.create({
    category,
    caption: caption || undefined,
    assets: verified,
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
}
