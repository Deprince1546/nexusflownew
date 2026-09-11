import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 mx-auto max-w-7xl px-5 md:px-10">
      <div className="flex h-20 items-center justify-between">
        <Link to="/" className="font-display text-3xl text-primary md:text-4xl">
          NexusFlow
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-9 text-[11px] font-semibold uppercase text-muted-foreground md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/app" className="transition-colors hover:text-foreground">
            Agent
          </Link>
        </nav>

        <Button asChild className="hidden md:inline-flex">
          <Link to="/app">
            Get started <ArrowRight size={16} />
          </Link>
        </Button>

        <Button
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          variant="outline"
          className="size-10 px-0 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={21} />}
        </Button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile navigation"
          className="mb-4 flex flex-col gap-1 rounded-xl border border-border bg-background/95 p-3 text-sm uppercase text-muted-foreground backdrop-blur md:hidden"
        >
          {[...NAV_ITEMS, { label: "Agent", to: "/app" } as const].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "text-primary" }}
              className="rounded-md px-3 py-2 font-semibold transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="mt-2 w-full">
            <Link to="/app" onClick={() => setOpen(false)}>
              Get started <ArrowRight size={16} />
            </Link>
          </Button>
        </nav>
      ) : null}
    </header>
  );
}
