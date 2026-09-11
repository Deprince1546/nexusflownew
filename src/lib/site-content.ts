import {
  BellRing,
  CalendarDays,
  Globe,
  Mail,
  MessagesSquare,
  MonitorSmartphone,
  Notebook,
  ShieldCheck,
  Waves,
} from "lucide-react";

export const FEATURES = [
  {
    icon: Mail,
    title: "Inbox that reads itself",
    body: "Watch for specific senders or subjects in Gmail, pull out the key points, and hear the summary read aloud in seconds.",
  },
  {
    icon: Notebook,
    title: "Notion pages on command",
    body: "Turn a call, an email thread or a research session into a tidy Notion page or database row without opening a tab.",
  },
  {
    icon: CalendarDays,
    title: "Calendar that finds the gap",
    body: "Check your real availability, book the meeting, invite the attendees and send the updates for you.",
  },
  {
    icon: MessagesSquare,
    title: "Slack updates in your voice",
    body: "Read a channel, catch up on what you missed, and post the standup note or client update after you approve it.",
  },
  {
    icon: Globe,
    title: "Research on any person or company",
    body: "Look someone up, scrape the pages that matter, and get a short brief before the meeting starts.",
  },
  {
    icon: Waves,
    title: "Chained multi-step workflows",
    body: "\"When Joe's email lands, summarise it, make a Notion page, book the follow-up, tell the team.\" One sentence, four apps.",
  },
  {
    icon: BellRing,
    title: "Wake word, no buttons",
    body: "Say \"NexusFlow\" and the glowing orb appears. It answers by voice, or silently in text — your choice.",
  },
  {
    icon: ShieldCheck,
    title: "Confirm before anything ships",
    body: "You always see the plan first. Nothing is emailed, booked or posted until you say yes.",
  },
  {
    icon: MonitorSmartphone,
    title: "Fallback that still gets it done",
    body: "When an app has no usable API, the computer-use agent steps in and finishes the task in a browser.",
  },
] as const;

export const PLANS = [
  {
    name: "Solo",
    price: "$0",
    cadence: "for the first 30 days",
    blurb: "Try the agent with your own keys and see it work end to end.",
    features: ["Voice + text chat", "Gmail and Calendar", "50 agent actions a month", "Community support"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Professional",
    price: "$29",
    cadence: "per month",
    blurb: "For people whose whole day lives across five different apps.",
    features: [
      "All five app integrations",
      "Unlimited chained workflows",
      "ElevenLabs voice replies",
      "Web research and scraping",
      "Priority email support",
    ],
    cta: "Go professional",
    featured: true,
  },
  {
    name: "Team",
    price: "$79",
    cadence: "per seat, per month",
    blurb: "Shared workflows, shared Slack and Notion workspaces, one agent.",
    features: [
      "Everything in Professional",
      "Shared team workflows",
      "Computer-use fallback",
      "Audit trail of every action",
      "Onboarding call",
    ],
    cta: "Talk to us",
    featured: false,
  },
] as const;
