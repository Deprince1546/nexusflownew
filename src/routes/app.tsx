import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowUp,
  CalendarDays,
  Check,
  Globe,
  Loader2,
  Mail,
  MonitorSmartphone,
  Notebook,
  Settings,
  Slack,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Orb } from "@/components/nexus/Orb";
import { Button } from "@/components/ui/button";
import { useVoice } from "@/hooks/useVoice";
import { useWakeWord } from "@/hooks/useWakeWord";

type Status = {
  ai: boolean;
  voice: boolean;
  research: boolean;
  computerUse: boolean;
  notion: boolean;
  slack: boolean;
  googleKeys: boolean;
  googleConnected: boolean;
  googleRedirectUri: string;
};

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "NexusFlow Agent | Talk to your apps" },
      {
        name: "description",
        content:
          "Voice-first AI agent that plans and executes work across Gmail, Notion, Google Calendar, Slack and the web.",
      },
      { property: "og:title", content: "NexusFlow Agent | Talk to your apps" },
      { property: "og:description", content: "Say 'NexusFlow' and let the agent do the work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgentPage,
});

function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function AgentPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [voiceReply, setVoiceReply] = useState(true);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const spokenRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { speak, speaking, voiceError } = useVoice();

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status: chatStatus } = useChat({
    transport,
    onError: (err) => setError(err.message || "Something went wrong. Please try again."),
  });

  const busy = chatStatus === "submitted" || chatStatus === "streaming";

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setError(null);
      setInput("");
      void sendMessage({ text: trimmed });
    },
    [busy, sendMessage],
  );

  const { supported, awake, heard } = useWakeWord({
    enabled: wakeEnabled,
    onWake: () => {
      if (voiceReply) void speak("Yes?");
    },
    onCommand: submit,
  });

  // Read the finished assistant reply aloud when Voice Reply is on.
  const last = messages[messages.length - 1];
  useEffect(() => {
    if (!voiceReply || busy || !last || last.role !== "assistant") return;
    const text = messageText(last);
    if (!text || spokenRef.current === last.id) return;
    spokenRef.current = last.id;
    void speak(text);
  }, [busy, last, speak, voiceReply]);

  const orbCaption = awake ? heard || "Listening…" : voiceReply && busy ? "Thinking…" : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <Sidebar
        status={status}
        voiceReply={voiceReply}
        setVoiceReply={setVoiceReply}
        wakeEnabled={wakeEnabled}
        setWakeEnabled={setWakeEnabled}
        wakeSupported={supported}
        openSettings={() => setShowSettings(true)}
      />

      <main className="flex min-h-screen flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-56 pt-6 md:px-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.length === 0 ? <EmptyState onPick={submit} /> : null}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {busy ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Working through the plan…
              </p>
            ) : null}
            {error || voiceError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                {error ?? voiceError}
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
          className="sticky bottom-0 z-50 border-t border-border bg-background/95 px-4 py-4 backdrop-blur md:px-10"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={wakeEnabled ? 'Say "NexusFlow" or type here…' : "Ask NexusFlow to do something…"}
              className="h-12 flex-1 rounded-full border border-input bg-muted px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send message">
              <ArrowUp size={18} />
            </Button>
          </div>
        </form>
      </main>

      <Orb active={awake || speaking || (voiceReply && busy)} caption={orbCaption} />
      {showSettings ? <SettingsPanel status={status} onClose={() => setShowSettings(false)} /> : null}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const prompts = [
    "Summarise the unread emails from this week and read them to me.",
    "Find my next free hour tomorrow and book a 30 minute call with the team.",
    "Research Acme Corp and create a Notion page with the key facts.",
    "Post a short standup update in the general Slack channel.",
  ];
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl text-primary md:text-5xl">Hello. What should we get done?</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Turn on wake word listening and just say “NexusFlow”, or pick a starting point.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-lg border border-border bg-muted px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = messageText(message);
  const steps = message.parts.filter((part) => part.type.startsWith("tool-"));

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground"
        }`}
      >
        {steps.length > 0 ? (
          <ul className="mb-2 space-y-1 text-xs text-muted-foreground">
            {steps.map((part, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check size={12} className="text-primary" />
                {part.type.replace("tool-", "").replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

function Sidebar(props: {
  status: Status | null;
  voiceReply: boolean;
  setVoiceReply: (value: boolean) => void;
  wakeEnabled: boolean;
  setWakeEnabled: (value: boolean) => void;
  wakeSupported: boolean;
  openSettings: () => void;
}) {
  const { status, voiceReply, setVoiceReply, wakeEnabled, setWakeEnabled, wakeSupported, openSettings } = props;

  const apps = [
    { label: "Gmail", icon: Mail, ok: status?.googleConnected },
    { label: "Calendar", icon: CalendarDays, ok: status?.googleConnected },
    { label: "Notion", icon: Notebook, ok: status?.notion },
    { label: "Slack", icon: Slack, ok: status?.slack },
    { label: "Web research", icon: Globe, ok: status?.research },
    { label: "Computer use", icon: MonitorSmartphone, ok: status?.computerUse },
  ];

  return (
    <aside className="border-b border-border bg-muted/40 px-5 py-5 md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <a href="/" className="font-display text-2xl text-primary">
        NexusFlow
      </a>

      <ul className="mt-6 space-y-2">
        {apps.map((app) => (
          <li key={app.label} className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <app.icon size={16} className="text-primary" />
              {app.label}
            </span>
            <span className={`size-2 rounded-full ${app.ok ? "bg-primary" : "bg-border"}`} />
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2">
        <Toggle
          label="Voice reply"
          on={voiceReply}
          onChange={() => setVoiceReply(!voiceReply)}
          icon={voiceReply ? Volume2 : VolumeX}
        />
        <Toggle
          label={wakeSupported ? "Wake word" : "Wake word (unsupported)"}
          on={wakeEnabled}
          onChange={() => setWakeEnabled(!wakeEnabled)}
          icon={Volume2}
          disabled={!wakeSupported}
        />
      </div>

      <Button variant="outline" className="mt-6 w-full" onClick={openSettings}>
        <Settings size={16} /> Settings
      </Button>
    </aside>
  );
}

function Toggle(props: {
  label: string;
  on: boolean;
  onChange: () => void;
  icon: typeof Volume2;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onChange}
      className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
    >
      <span className="flex items-center gap-2">
        <props.icon size={16} className="text-primary" />
        {props.label}
      </span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${props.on ? "bg-primary" : "bg-border"}`}>
        <span className={`block size-4 rounded-full bg-background transition-transform ${props.on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function SettingsPanel({ status, onClose }: { status: Status | null; onClose: () => void }) {
  const rows = [
    { label: "AI brain (OpenRouter)", ok: status?.ai },
    { label: "Voice (ElevenLabs)", ok: status?.voice },
    { label: "Research (Firecrawl)", ok: status?.research },
    { label: "Computer use (Coasty AI)", ok: status?.computerUse },
    { label: "Notion token", ok: status?.notion },
    { label: "Slack bot token", ok: status?.slack },
    { label: "Google credentials", ok: status?.googleKeys },
    { label: "Google account connected", ok: status?.googleConnected },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-primary">Settings</h2>
          <button type="button" aria-label="Close settings" onClick={onClose} className="text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          All keys are stored securely on the backend. Nothing is kept in the browser.
        </p>

        <ul className="mt-4 space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between text-muted-foreground">
              {row.label}
              <span className={row.ok ? "text-primary" : "text-muted-foreground/60"}>
                {row.ok ? "Connected" : "Missing"}
              </span>
            </li>
          ))}
        </ul>

        {status?.googleKeys ? (
          <a
            href="/api/google/start"
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
          >
            {status.googleConnected ? "Reconnect Google" : "Connect Gmail & Calendar"}
          </a>
        ) : (
          <p className="mt-5 rounded-md border border-border p-3 text-xs text-muted-foreground">
            Add your Google client ID and secret to connect Gmail and Calendar. Use this redirect URL in Google Cloud:
            <br />
            <span className="break-all text-foreground">{status?.googleRedirectUri ?? "—"}</span>
          </p>
        )}
      </div>
    </div>
  );
}
