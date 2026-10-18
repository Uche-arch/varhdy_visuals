import { connectToDatabase } from "@/lib/mongodb";
import Media from "@/models/Media";
import type { MediaItem } from "@/lib/media-types";

/** All uploads, newest first, as plain objects safe to pass to client components. */
export async function getAllMedia(): Promise<MediaItem[]> {
  await connectToDatabase();
  const docs = await Media.find().sort({ createdAt: -1 }).lean();

  return docs.map((d) => ({
    id: String(d._id),
    category: d.category,
    caption: d.caption ?? undefined,
    createdAt: new Date(d.createdAt as unknown as string).toISOString(),
    assets: d.assets.map((a) => ({
      publicId: a.publicId,
      url: a.url,
      resourceType: a.resourceType,
      width: a.width ?? undefined,
      height: a.height ?? undefined,
      duration: a.duration ?? undefined,
    })),
  }));
}
