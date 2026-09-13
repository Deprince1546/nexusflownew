import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { PageHeading, PageShell } from "@/components/nexus/PageShell";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/lib/site-content";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features | NexusFlow AI Agent" },
      {
        name: "description",
        content:
          "See what the NexusFlow agent does: reads your inbox, writes Notion pages, books meetings, posts to Slack and researches anyone.",
      },
      { property: "og:title", content: "Features | NexusFlow AI Agent" },
      { property: "og:description", content: "Nine ways NexusFlow takes real action across your apps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeaturesPage,
});

const STEPS = [
  "You ask, by voice or text.",
  "NexusFlow shows a short numbered plan.",
  "You approve anything that sends, books or posts.",
  "It runs each step and retries hiccups automatically.",
];

function FeaturesPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Features"
        title="An agent that does the work"
        subtitle="Every feature below is a real action in a real account — not a suggestion you have to copy and paste."
      />

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-border bg-card/85 p-6 backdrop-blur transition-colors hover:border-ring"
            >
              <feature.icon size={22} className="text-primary" />
              <h2 className="mt-4 font-display text-2xl text-foreground">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-card/85 p-6 backdrop-blur md:p-10">
          <h2 className="font-display text-3xl text-primary md:text-4xl">How a request runs</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {STEPS.map((step) => (
              <li key={step} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <Check size={16} className="mt-1 shrink-0 text-primary" />
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/app">
                Try it now <ArrowRight size={17} />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">
                See pricing <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
