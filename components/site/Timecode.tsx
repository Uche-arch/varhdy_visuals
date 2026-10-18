"use client";

import { useEffect, useState } from "react";

const FPS = 25;
const pad = (n: number) => String(n).padStart(2, "0");

/** A running SMPTE-style timecode (HH:MM:SS:FF), like a camera's display. */
export default function Timecode() {
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const id = window.setInterval(
      () => setFrames(Math.floor(((performance.now() - start) / 1000) * FPS)),
      reduce ? 1000 : 1000 / FPS
    );
    return () => window.clearInterval(id);
  }, []);

  const ff = frames % FPS;
  const totalSeconds = Math.floor(frames / FPS);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);

  return (
    <span className="tabular-nums" aria-hidden="true">
      {pad(hh)}:{pad(mm)}:{pad(ss)}:{pad(ff)}
    </span>
  );
}
