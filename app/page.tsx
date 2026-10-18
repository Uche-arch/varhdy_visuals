import { Suspense } from "react";
import { SITE } from "@/lib/site";
import Hero from "@/components/site/Hero";
import ProjectsLoader from "@/components/site/ProjectsLoader";

export default function Home() {
  return (
    <>
      <header className="mx-auto max-w-7xl fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-paper/85 px-4 py-4 backdrop-blur sm:px-8">
        <a href="#" className="text-sm font-semibold">
          {SITE.name}
        </a>
        <nav className="flex gap-6 text-sm">
          <a href="#work" className="hover:underline">
            Projects
          </a>
          <a href="#contact" className="hover:underline">
            Contact
          </a>
        </nav>
      </header>

      <main>
        <Hero />
        <Suspense
          fallback={
            <section id="work" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
              <h2 className="display text-[clamp(2.5rem,7vw,5rem)]">Projects</h2>
              <p className="mt-10 text-slate">Loading projects...</p>
            </section>
          }
        >
          <ProjectsLoader />
        </Suspense>
      </main>

      <footer id="contact" className="mx-auto max-w-7xl border-t border-line px-4 py-20 sm:px-8">
        <div className="">
          <h2 className="display text-[clamp(2.5rem,7vw,5rem)]">Let&apos;s make something.</h2>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-6 inline-block text-xl underline underline-offset-4"
          >
            {SITE.email}
          </a>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-slate">
            {SITE.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}
