"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Category } from "@/lib/media-types";
import {
  MAX_CAPTION,
  MAX_IMAGE_MB,
  MAX_PICTURES,
  MAX_VIDEO_MB,
} from "@/lib/constants";
import { getSignature, uploadFile, type UploadedAsset } from "@/lib/upload-client";

const OPTIONS: { value: Category; label: string; hint: string }[] = [
  { value: "video", label: "Video", hint: "One horizontal video. Caption required." },
  { value: "reel", label: "Reel", hint: "One vertical video. Caption optional." },
  { value: "picture", label: "Pictures", hint: `1 to ${MAX_PICTURES} photos. Caption optional.` },
];

export default function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<Category>("video");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const previews = useMemo(
    () =>
      files.map((f) => ({
        name: f.name,
        isVideo: f.type.startsWith("video/"),
        url: URL.createObjectURL(f),
      })),
    [files]
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  function pickFiles(list: FileList | null) {
    setError(null);
    const picked = Array.from(list ?? []);
    if (picked.length === 0) return;

    const allImages = picked.every((f) => f.type.startsWith("image/"));
    const anyVideo = picked.some((f) => f.type.startsWith("video/"));
    // Pick the matching category for the files chosen.
    if (allImages) setCategory("picture");
    else if (anyVideo && category === "picture") setCategory("video");

    setFiles(picked);
  }

  function validate(): string | null {
    if (files.length === 0) return "Choose a file to upload.";

    if (category === "picture") {
      if (files.length > MAX_PICTURES) return `Pick at most ${MAX_PICTURES} pictures.`;
      if (files.some((f) => !f.type.startsWith("image/")))
        return "Pictures must be image files. Remove any videos.";
      if (files.some((f) => f.size > MAX_IMAGE_MB * 1024 * 1024))
        return `Each picture must be under ${MAX_IMAGE_MB}MB.`;
      return null;
    }

    if (files.length !== 1) return "Upload one video or reel at a time.";
    if (!files[0].type.startsWith("video/")) return "Choose a video file.";
    if (files[0].size > MAX_VIDEO_MB * 1024 * 1024)
      return `Videos must be under ${MAX_VIDEO_MB}MB.`;
    if (category === "video" && !caption.trim()) return "Add a caption for the project video.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const sig = await getSignature(category);
      const uploaded: UploadedAsset[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(
          await uploadFile(files[i], sig, (fraction) =>
            setProgress((i + fraction) / files.length)
          )
        );
      }

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          caption: caption.trim() || undefined,
          assets: uploaded,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Upload finished but saving failed. Try again.");
      }
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
      setBusy(false);
    }
  }

  const hint = OPTIONS.find((o) => o.value === category)?.hint;
  const captionRequired = category === "video";

  return (
    <dialog
      ref={dialogRef}
      onClose={() => !busy && onClose()}
      onCancel={(e) => busy && e.preventDefault()}
      className="m-auto w-[min(92vw,34rem)] rounded-xl border border-line bg-panel p-0 text-ink backdrop:bg-ink/50"
    >
      <form onSubmit={onSubmit} className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="display text-3xl">Upload</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={busy}
            className="text-sm text-slate hover:text-ink disabled:opacity-40"
          >
            Close
          </button>
        </div>

        {/* 1. File upload */}
        <div>
          <label
            htmlFor="asset-input"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-paper px-4 py-6 text-center transition hover:border-ink"
          >
            <span className="font-medium">
              {files.length ? "Choose different files" : "Choose files"}
            </span>
            <span className="mt-1 text-sm text-slate">
              Video up to {MAX_VIDEO_MB}MB, or up to {MAX_PICTURES} pictures
            </span>
          </label>
          <input
            id="asset-input"
            type="file"
            accept="video/*,image/*"
            multiple
            disabled={busy}
            onChange={(e) => pickFiles(e.target.files)}
            className="sr-only"
          />

          {previews.length > 0 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((p) => (
                <li key={p.url} className="aspect-square overflow-hidden rounded-md bg-ink/10">
                  {p.isVideo ? (
                    <video src={p.url} muted className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 2. Category */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Category</legend>
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`cursor-pointer rounded-md border px-3 py-2.5 text-center text-sm transition ${
                  category === o.value
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper hover:border-ink"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={o.value}
                  checked={category === o.value}
                  disabled={busy}
                  onChange={() => {
                    setCategory(o.value);
                    setError(null);
                  }}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate">{hint}</p>
        </fieldset>

        {/* 3. Caption */}
        <label className="block">
          <span className="mb-1.5 flex justify-between text-sm font-medium">
            <span>Caption{captionRequired ? "" : " (optional)"}</span>
            <span className="font-normal text-slate">
              {caption.length}/{MAX_CAPTION}
            </span>
          </span>
          <textarea
            value={caption}
            maxLength={MAX_CAPTION}
            rows={3}
            disabled={busy}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full resize-none rounded-md border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-tally">
            {error}
          </p>
        )}

        {busy && (
          <div aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-ink transition-[width]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-sm text-slate">
              Uploading {Math.round(progress * 100)}%. Keep this window open.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-ink px-4 py-3 font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </form>
    </dialog>
  );
}
