// Pure string helpers (safe in client and server components).
// They add Cloudinary transformations to a stored delivery URL.

function withTransform(url: string, transformation: string) {
  return url.replace("/upload/", `/upload/${transformation}/`);
}

function swapExtension(url: string, ext: string) {
  return url.replace(/\.[a-zA-Z0-9]+(\?.*)?$/, `.${ext}`);
}

export function imageUrl(url: string, width = 1400) {
  return withTransform(url, `f_auto,q_auto,w_${width},c_limit`);
}

export function videoSrc(url: string) {
  return swapExtension(withTransform(url, "q_auto"), "mp4");
}

/** A still frame from the video, used as the poster/thumbnail. */
export function videoPoster(url: string, width = 900) {
  return swapExtension(
    withTransform(url, `so_0,f_jpg,q_auto,w_${width},c_limit`),
    "jpg"
  );
}
