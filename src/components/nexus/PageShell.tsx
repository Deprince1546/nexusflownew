import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteBackground } from "./SiteBackground";
import { SiteNav } from "./SiteNav";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground">
      <SiteBackground />
      <div className="relative z-10">
        <SiteNav />
        <main>{children}</main>
        <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-border px-5 py-8 text-[10px] font-bold uppercase text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <span className="text-primary">NexusFlow — one agent, five apps</span>
          <span className="flex flex-wrap gap-5">
            <Link to="/features" className="hover:text-foreground">Features</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}

export function PageHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 text-center md:px-10 md:pt-16">
      <p className="flex items-center justify-center text-[10px] font-bold uppercase tracking-wide text-primary md:text-xs"><span>●</span> <span className="px-2">{eyebrow}</span> <span>●</span></p>
      <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.92] text-primary">{title}</h1>
      <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">{subtitle}</p>
    </div>
  );
}
