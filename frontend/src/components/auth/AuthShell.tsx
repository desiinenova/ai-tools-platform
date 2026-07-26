import { Search, Sparkles, Share2 } from "lucide-react";

const valueProps = [
  { icon: Search, text: "Search the org's AI tool catalog in seconds" },
  { icon: Sparkles, text: "Recommendations tailored to your role" },
  { icon: Share2, text: "Organize and share what your team relies on" },
];

/**
 * Login shell: one continuous dark, glowing scene — the product's first
 * impression, so both the scene and the card commit to this look regardless
 * of the light/dark toggle (the `dark` class wrapper below forces every
 * themed component inside the card, e.g. Input/Button, into its dark-mode
 * styling, so the card reads as part of the scene instead of a light
 * rectangle dropped onto a dark one). The rest of the app still fully
 * respects the toggle — this is a deliberate exception for one hero moment.
 * Colocated here rather than in the shared UI kit since nothing else uses
 * this layout yet.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#0B0E16] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent opacity-30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-accent-glow opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-6rem] left-1/4 h-80 w-80 rounded-full bg-accent opacity-20 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
        <div className="text-sm font-semibold uppercase tracking-[0.15em] text-white">
          AI Tools Platform
        </div>

        <div className="flex flex-col items-center justify-center gap-14 py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex max-w-xl flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Every AI tool your team actually uses. In one place.
            </h1>
            <p className="max-w-md text-base text-white/70">
              Discover, organize, and share AI tools — with recommendations tailored to your
              role.
            </p>

            <ul className="hidden flex-col gap-4 pt-4 lg:flex">
              {valueProps.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full max-w-md shrink-0 flex-col items-center gap-4">
            <div className="dark w-full">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#1A1E2B]/90 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
                />
                {children}
              </div>
            </div>
            <p className="text-center text-xs text-white/40">
              Internal tool — sign in with your organization account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
