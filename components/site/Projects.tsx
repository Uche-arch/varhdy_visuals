"use client";

import { useState } from "react";
import type { Category, MediaItem } from "@/lib/media-types";
import VideoCard from "@/components/site/VideoCard";
import PictureCard from "@/components/site/PictureCard";

const TABS: { value: Category; label: string; empty: string }[] = [
  { value: "video", label: "Videos", empty: "No videos yet. Check back soon." },
  { value: "reel", label: "Reels", empty: "No reels yet. Check back soon." },
  { value: "picture", label: "Pictures", empty: "No pictures yet. Check back soon." },
];

export default function Projects({ items }: { items: MediaItem[] }) {
  const [tab, setTab] = useState<Category>("video");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const visible = items.filter((i) => i.category === tab);
  const current = TABS.find((t) => t.value === tab)!;

  return (
    <section id="work" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-24 sm:px-8">
      <h2 className="display text-[clamp(2.5rem,7vw,5rem)]">Projects</h2>

      <div role="tablist" aria-label="Project type" className="mt-10 flex gap-2 border-b border-line">
        {TABS.map((t) => {
          const count = items.filter((i) => i.category === t.value).length;
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              id={`tab-${t.value}`}
              aria-selected={active}
              aria-controls="projects-panel"
              onClick={() => {
                setTab(t.value);
                setPlayingId(null);
              }}
              className={`-mb-px border-b-2 px-4 py-3 text-base transition ${
                active
                  ? "border-ink font-semibold text-ink"
                  : "border-transparent text-slate hover:text-ink"
              }`}
            >
              {t.label} <span className="text-sm text-slate">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        id="projects-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mt-10"
      >
        {visible.length === 0 ? (
          <p className="py-16 text-center text-slate">{current.empty}</p>
        ) : tab === "video" ? (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {visible.map((item) => (
              <VideoCard
                key={item.id}
                item={item}
                playing={playingId === item.id}
                onPlay={() => setPlayingId(item.id)}
              />
            ))}
          </div>
        ) : tab === "reel" ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((item) => (
              <VideoCard
                key={item.id}
                item={item}
                playing={playingId === item.id}
                onPlay={() => setPlayingId(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <PictureCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
