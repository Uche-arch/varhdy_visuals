"use client";

import { useRef, useState } from "react";
import type { MediaItem } from "@/lib/media-types";
import { imageUrl } from "@/lib/cloudinary-url";

export default function PictureCard({ item }: { item: MediaItem }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = item.assets.length;

  function onScroll() {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(dir: -1 | 1) {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  return (
    <figure>
      <div className="relative overflow-hidden rounded-lg bg-ink/10">
        <div
          ref={track}
          onScroll={onScroll}
          role={count > 1 ? "group" : undefined}
          aria-roledescription={count > 1 ? "carousel" : undefined}
          aria-label={count > 1 ? (item.caption ?? "Photo set") : undefined}
          tabIndex={count > 1 ? 0 : undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {item.assets.map((a, i) => (
            <div key={a.publicId} className="aspect-[4/5] w-full shrink-0 snap-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(a.url, 1000)}
                alt={item.caption ? `${item.caption} (${i + 1} of ${count})` : `Photo ${i + 1} of ${count}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            {index > 0 && (
              <button
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m15 5-7 7 7 7" />
                </svg>
              </button>
            )}
            {index < count - 1 && (
              <button
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            )}
            <span className="absolute bottom-3 right-3 rounded bg-ink/80 px-2 py-0.5 text-xs tabular-nums text-paper">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
      {item.caption && (
        <figcaption className="mt-3 text-base leading-snug">{item.caption}</figcaption>
      )}
    </figure>
  );
}
