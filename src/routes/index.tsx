import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageShell } from "@/components/nexus/PageShell";
import { FEATURES } from "@/lib/site-content";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusFlow | Your Digital Work, Connected" },
      {
        name: "description",
        content:
          "An intelligent AI agent that plans, executes and connects your work across Gmail, Notion, Calendar, Slack and the web.",
      },
      { property: "og:title", content: "NexusFlow | Your Digital Work, Connected" },
      { property: "og:description", content: "One intelligent agent for all your digital work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <section className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-10 pt-10 text-center md:px-10 md:pt-4">
        <p className="mb-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wide text-primary md:text-xs">
          <span>●</span><span>AI agent</span><span>●</span><span>Multi-app</span><span>●</span>
          <span>Real actions</span><span>●</span>
        </p>
        <h1 className="max-w-4xl font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.86] text-primary">
          Your digital work,
          <br />
          connected.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          NexusFlow is an intelligent AI agent that plans,
          <br className="hidden sm:block" /> executes and connects your work across all your apps.
        </p>

        <div className="mt-7 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Button asChild>
            <Link to="/app">
              Open the agent <ArrowRight size={17} />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/features">
              See the features <ArrowRight size={17} />
            </Link>
          </Button>
        </div>

        <p className="mt-4 flex flex-wrap justify-center gap-x-3 text-[9px] font-bold uppercase tracking-wide text-primary">
          <span>One agent.</span><span>Five apps.</span><span>Endless possibilities.</span>
        </p>

        <div className="h-56 w-full sm:h-72 md:h-96" />

        <div className="flex w-full items-center gap-4 pt-4 text-[9px] font-bold uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span className="text-primary">Built for modern professionals</span>
          <span className="h-px flex-1 bg-border" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 pb-16 md:px-10">
        <div className="max-w-2xl">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-tight text-primary">
            Everything it can actually do
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
            Not another chat window. NexusFlow plans the steps, asks for your go-ahead, then does the work in your real
            accounts.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(0, 6).map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-border bg-card/85 p-6 backdrop-blur transition-colors hover:border-ring"
            >
              <feature.icon size={22} className="text-primary" />
              <h3 className="mt-4 font-display text-2xl text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/features">
              All features <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
