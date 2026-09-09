import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Linkedin, Menu, Slack } from "lucide-react";
import { Button } from "@/components/ui/button";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusFlow | Your Digital Work, Connected" },
      { name: "description", content: "An intelligent AI agent that plans, executes and connects your work across all your apps." },
      { property: "og:title", content: "NexusFlow | Your Digital Work, Connected" },
      { property: "og:description", content: "One intelligent agent for all your digital work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-10">
        <a href="#" className="font-display text-3xl text-primary md:text-4xl">NexusFlow</a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-9 text-[11px] font-semibold uppercase text-muted-foreground md:flex">
          {['Product', 'Solutions', 'Integrations', 'Resources', 'Our story'].map((item) => <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="transition-colors hover:text-foreground">{item}</a>)}
        </nav>
        <Button asChild className="hidden md:inline-flex"><a href="#get-started">Get started <ArrowRight size={16} /></a></Button>
        <Button aria-label="Open navigation" variant="outline" className="size-10 px-0 md:hidden"><Menu size={21} /></Button>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center px-5 pb-8 pt-12 text-center md:pt-5">
        <p className="mb-5 text-[10px] font-bold uppercase text-primary md:text-xs">● &nbsp; AI agent &nbsp; ● &nbsp; Multi-app &nbsp; ● &nbsp; Real actions &nbsp; ●</p>
        <h1 className="max-w-4xl font-display text-[clamp(3.3rem,9vw,7.5rem)] leading-[0.86] text-primary">Your digital work,<br />connected.</h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">NexusFlow is an intelligent AI agent that plans,<br className="hidden sm:block" /> executes and connects your work across all your apps.</p>
        <div id="get-started" className="mt-7 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Button>Get started <ArrowRight size={17} /></Button>
          <Button variant="outline">See how it works <ArrowRight size={17} /></Button>
        </div>
        <p className="mt-4 text-[9px] font-bold uppercase text-primary">One agent. &nbsp; Five apps. &nbsp; Endless possibilities.</p>

        <div aria-hidden="true" className="flow-drift relative mt-10 h-64 w-[115%] max-w-5xl md:mt-2 md:h-80">
          <svg viewBox="0 0 1000 300" className="absolute inset-0 size-full opacity-90" fill="none">
            {[-36,-18,0,18,36].map((offset) => <path key={offset} d={`M0 ${155+offset} C180 ${15+offset}, 270 ${265+offset}, 485 ${145+offset} S790 ${245+offset}, 1000 ${85+offset}`} stroke="currentColor" className="text-primary" strokeWidth="1" strokeDasharray={offset % 36 === 0 ? "2 7" : "1 4"} opacity={offset === 0 ? ".9" : ".45"} />)}
          </svg>
          <AppIcon className="left-[7%] top-[18%]" label="Gmail"><span className="text-xl font-bold text-primary">M</span></AppIcon>
          <AppIcon className="left-[19%] bottom-[4%]" label="Notion"><span className="border border-foreground px-1 font-display text-xl">N</span></AppIcon>
          <AppIcon className="right-[15%] top-[8%]" label="Calendar"><CalendarDays size={24} /></AppIcon>
          <AppIcon className="right-[3%] top-[44%]" label="Slack"><Slack size={25} /></AppIcon>
          <AppIcon className="right-[18%] bottom-[0%]" label="LinkedIn"><Linkedin size={25} /></AppIcon>
        </div>
        <div className="mt-auto flex w-full items-center gap-4 pt-4 text-[9px] font-bold uppercase text-muted-foreground"><span className="h-px flex-1 bg-border" /><span className="text-primary">Built for modern professionals</span><span className="h-px flex-1 bg-border" /></div>
      </section>
    </main>
  );
}

function AppIcon({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  return <div className={`absolute flex size-16 flex-col items-center justify-center rounded-md border border-border bg-muted text-foreground shadow-xl md:size-20 ${className}`}>{children}<span className="mt-1 text-[7px] font-bold uppercase text-primary">{label}</span></div>;
}
