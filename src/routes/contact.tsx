import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail, MessagesSquare } from "lucide-react";
import { useState } from "react";

import { PageHeading, PageShell } from "@/components/nexus/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | NexusFlow AI Agent" },
      {
        name: "description",
        content: "Talk to the NexusFlow team about team rollouts, custom workflows or connecting an app you rely on.",
      },
      { property: "og:title", content: "Contact | NexusFlow AI Agent" },
      { property: "og:description", content: "Questions about NexusFlow? Send us a note." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <PageHeading
        eyebrow="Contact"
        title="Let's talk about your workflow"
        subtitle="Tell us which apps you live in and what you keep doing by hand. We'll show you the agent doing it instead."
      />

      <section className="mx-auto grid max-w-5xl gap-5 px-5 py-12 md:grid-cols-[1.2fr_1fr] md:px-10">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
          className="rounded-xl border border-border bg-card/85 p-6 backdrop-blur md:p-8"
        >
          {sent ? (
            <div className="py-10 text-center">
              <h2 className="font-display text-3xl text-primary">Thanks — message noted.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Nothing was emailed yet: hook this form up to your inbox and we'll send it for real.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl text-primary">Send a note</h2>
              <div className="mt-6 space-y-4">
                <Field label="Your name" name="name" placeholder="Ada Obi" />
                <Field label="Work email" name="email" type="email" placeholder="ada@company.com" />
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">What do you need?</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="We spend an hour a day moving email into Notion…"
                    className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
                  />
                </label>
              </div>
              <Button type="submit" className="mt-6 w-full sm:w-auto">
                Send message <ArrowRight size={16} />
              </Button>
            </>
          )}
        </form>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card/85 p-6 backdrop-blur">
            <Mail size={20} className="text-primary" />
            <h3 className="mt-3 font-display text-2xl text-foreground">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your real support address here and we'll show it.</p>
          </div>
          <div className="rounded-xl border border-border bg-card/85 p-6 backdrop-blur">
            <MessagesSquare size={20} className="text-primary" />
            <h3 className="mt-3 font-display text-2xl text-foreground">Team rollouts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Shared Slack and Notion workspaces, audit trails and an onboarding call.
            </p>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
      />
    </label>
  );
}
