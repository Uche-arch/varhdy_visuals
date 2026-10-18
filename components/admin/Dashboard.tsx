"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, MediaItem } from "@/lib/media-types";
import { imageUrl, videoPoster } from "@/lib/cloudinary-url";
import UploadModal from "@/components/admin/UploadModal";
import PictureCard from "../site/PictureCard";

const FILTERS: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "video", label: "Videos" },
  { value: "reel", label: "Reels" },
  { value: "picture", label: "Pictures" },
];

const LABEL: Record<Category, string> = {
  video: "Video",
  reel: "Reel",
  picture: "Pictures",
};

export default function Dashboard({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not delete this item.");
      }
      setConfirmId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete this item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-4xl">Dashboard</h1>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-2 text-sm text-slate hover:text-ink"
          >
            View site
          </a>
          <button
            onClick={signOut}
            className="rounded-md px-3 py-2 text-sm text-slate hover:text-ink"
          >
            Sign out
          </button>
          <button
            onClick={() => setAdding(true)}
            className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:opacity-90"
          >
            Add
          </button>
        </div>
      </header>

      <div className="mt-8 flex gap-1 border-b border-line" role="tablist">
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? items.length
              : items.filter((i) => i.category === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition ${
                active
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-slate hover:text-ink"
              }`}
            >
              {f.label} <span className="text-slate">{count}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-tally">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium">Nothing here yet</p>
          <p className="mt-1 text-slate">
            Select Add to upload a video, a reel or pictures.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid items-start gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => {
            const first = item.assets[0];
            const thumb =
              first.resourceType === "video"
                ? videoPoster(first.url, 600)
                : imageUrl(first.url, 600);
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-lg border border-line bg-panel"
              >
                <div
                  className={`relative bg-ink/10 ${
                    item.category === "reel"
                      ? "aspect-[9/12]"
                      : item.category === "picture"
                        ? "aspect-[4/5]"
                        : "aspect-video"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={item.caption ?? LABEL[item.category]}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {item.assets.length > 1 && (
                    <span className="absolute right-2 top-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-paper">
                      {item.assets.length} photos
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">{LABEL[item.category]}</p>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate">
                    {item.caption || "No caption"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <time
                      className="text-xs text-slate"
                      dateTime={item.createdAt}
                    >
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    {confirmId === item.id ? (
                      <span className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => remove(item.id)}
                          disabled={deletingId === item.id}
                          className="font-medium text-tally disabled:opacity-50"
                        >
                          {deletingId === item.id
                            ? "Deleting..."
                            : "Delete for good"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-slate"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(item.id)}
                        className="text-sm text-slate hover:text-tally"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {adding && (
        <UploadModal
          onClose={() => setAdding(false)}
          onUploaded={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}
