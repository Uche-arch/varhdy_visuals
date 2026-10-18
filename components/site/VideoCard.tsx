"use client";

import type { MediaItem } from "@/lib/media-types";
import { videoPoster, videoSrc } from "@/lib/cloudinary-url";

export default function VideoCard({
  item,
  playing,
  onPlay,
}: {
  item: MediaItem;
  playing: boolean;
  onPlay: () => void;
}) {
  const asset = item.assets[0];
  const isReel = item.category === "reel";
  const label = item.caption ?? (isReel ? "Reel" : "Project video");

  return (
    <figure>
      <div
        className={`relative overflow-hidden rounded-lg bg-ink ${
          isReel ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        {playing ? (
          <video
            src={videoSrc(asset.url)}
            poster={videoPoster(asset.url)}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            onClick={onPlay}
            aria-label={`Play: ${label}`}
            className="group absolute inset-0 block h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={videoPoster(asset.url, isReel ? 600 : 1000)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/10 transition group-hover:bg-ink/30">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-ink shadow-lg">
                <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {item.caption && (
        <figcaption className="mt-3 max-w-prose text-base leading-snug">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}
