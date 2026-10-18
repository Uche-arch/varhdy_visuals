import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { guardAdminRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { cloudinary } from "@/lib/cloudinary";
import Media from "@/models/Media";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await guardAdminRequest(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await Media.findById(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Remove the files first so nothing is left orphaned in Cloudinary.
  await Promise.all(
    doc.assets.map((a) =>
      cloudinary.uploader.destroy(a.publicId, {
        resource_type: a.resourceType,
        invalidate: true,
      })
    )
  );
  await doc.deleteOne();

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
