import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { PageHeading, PageShell } from "@/components/nexus/PageShell";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/site-content";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | NexusFlow AI Agent" },
      {
        name: "description",
        content: "Simple NexusFlow pricing: start free, go professional for unlimited workflows, or roll it out to your team.",
      },
      { property: "og:title", content: "Pricing | NexusFlow AI Agent" },
      { property: "og:description", content: "Three plans. Start free, upgrade when the agent earns it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Pricing"
        title="Pay for the work, not the seats you forgot about"
        subtitle="Start free with your own keys. Move up when the agent is doing enough to notice."
      />

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-xl border bg-muted/60 p-7 backdrop-blur ${
                plan.featured ? "border-primary shadow-[0_0_50px_rgba(200,40,40,0.18)]" : "border-border"
              }`}
            >
              {plan.featured ? (
                <span className="mb-3 self-start rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase text-primary-foreground">
                  Most popular
                </span>
              ) : null}
              <h2 className="font-display text-3xl text-primary">{plan.name}</h2>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-5xl text-foreground">{plan.price}</span>
                <span className="text-xs uppercase text-muted-foreground">{plan.cadence}</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.blurb}</p>

              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <Check size={15} className="mt-1 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild variant={plan.featured ? "primary" : "outline"} className="mt-7 w-full">
                <Link to={plan.name === "Team" ? "/contact" : "/app"}>
                  {plan.cta} <ArrowRight size={16} />
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs uppercase text-muted-foreground">
          Prices in USD. Cancel any time — your connected accounts stay yours.
        </p>
      </section>
    </PageShell>
  );
}
