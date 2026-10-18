// Browser-only helpers for uploading a file directly to Cloudinary
// using a signature issued by /api/admin/sign-upload.

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: "image" | "video";
};

export type UploadedAsset = {
  publicId: string;
  resourceType: "image" | "video";
};

const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB (Cloudinary minimum is 5MB)

export async function getSignature(category: string): Promise<UploadSignature> {
  const res = await fetch("/api/admin/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Could not start the upload.");
  }
  return res.json();
}

function sendChunk(
  url: string,
  form: FormData,
  headers: Record<string, string>,
  onProgress: (loaded: number) => void
): Promise<{ public_id?: string; error?: { message: string } }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };
    xhr.onload = () => {
      let body: { public_id?: string; error?: { message: string } } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // fall through to the status check below
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body.error?.message ?? "Upload failed."));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(form);
  });
}

/**
 * Uploads one file. Files larger than one chunk are sent in pieces,
 * so big videos work and the progress bar stays accurate.
 */
export async function uploadFile(
  file: File,
  sig: UploadSignature,
  onProgress: (fraction: number) => void
): Promise<UploadedAsset> {
  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const total = file.size;
  const chunked = total > CHUNK_SIZE;

  let start = 0;
  let last: { public_id?: string; error?: { message: string } } = {};

  while (start < total) {
    const end = chunked ? Math.min(start + CHUNK_SIZE, total) : total;
    const blob = chunked ? file.slice(start, end) : file;

    const form = new FormData();
    form.append("file", blob, file.name);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const headers: Record<string, string> = {};
    if (chunked) {
      headers["X-Unique-Upload-Id"] = uploadId;
      headers["Content-Range"] = `bytes ${start}-${end - 1}/${total}`;
    }

    const base = start;
    last = await sendChunk(url, form, headers, (loaded) =>
      onProgress(Math.min(1, (base + loaded) / total))
    );
    start = end;
  }

  if (!last.public_id) throw new Error("Upload did not finish.");
  onProgress(1);
  return { publicId: last.public_id, resourceType: sig.resourceType };
}
