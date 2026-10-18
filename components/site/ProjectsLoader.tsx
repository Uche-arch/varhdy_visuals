import { connection } from "next/server";
import { getAllMedia } from "@/lib/media";
import type { MediaItem } from "@/lib/media-types";
import Projects from "@/components/site/Projects";

// Reads uploads at request time so new items appear right after he uploads
// them. The rest of the page (hero, footer) is static and loads instantly.
export default async function ProjectsLoader() {
  await connection();

  let items: MediaItem[] = [];
  try {
    items = await getAllMedia();
  } catch (err) {
    // Keep the public page up even if the database is unreachable.
    console.error("Could not load portfolio items:", err);
  }

  return <Projects items={items} />;
}
