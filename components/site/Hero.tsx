import { SITE } from "@/lib/site";
import Timecode from "@/components/site/Timecode";

// The viewfinder: corner brackets, a recording light and a running timecode
// frame the name the way a camera frames a shot.
function Bracket({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-8 w-8 border-ink sm:h-12 sm:w-12 ${className}`}
    />
  );
}

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl min-h-dvh px-4 pb-4 pt-20 sm:px-8 sm:pb-8 sm:pt-24">
      <div className="relative flex h-[calc(100dvh-6rem)] min-h-[32rem] flex-col justify-between p-6 sm:h-[calc(100dvh-8rem)] sm:p-10">
        <Bracket className="left-0 top-0 border-l-2 border-t-2" />
        <Bracket className="right-0 top-0 border-r-2 border-t-2" />
        <Bracket className="bottom-0 left-0 border-b-2 border-l-2" />
        <Bracket className="bottom-0 right-0 border-b-2 border-r-2" />

        <div className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="rec-dot h-3 w-3 rounded-full bg-tally" aria-hidden="true" />
            Rec
          </span>
          <Timecode />
        </div>

        <div>
          {/* Scaled down the max clamp size and tracking so it doesn't overflow the desktop brackets */}
          <h1 className="display text-[clamp(2.5rem,8vw,7.5rem)] tracking-tight">
            {SITE.name}
          </h1>
          {/* Adjusted spacing and font sizes for desktop breathing room */}
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate sm:mt-6 sm:text-lg">
            {SITE.headline} {SITE.intro}
          </p>
          <a
            href="#work"
            className="mt-6 inline-block rounded-md bg-ink px-5 py-3 font-medium text-paper transition hover:opacity-90 sm:mt-8 sm:px-6 sm:py-3.5"
          >
            See my work
          </a>
        </div>

        <div className="flex items-end justify-between text-sm text-slate">
          <span>{SITE.location}</span>
          <a href={`mailto:${SITE.email}`} className="hover:text-ink">
            {SITE.email}
          </a>
        </div>
      </div>
    </section>
  );
}