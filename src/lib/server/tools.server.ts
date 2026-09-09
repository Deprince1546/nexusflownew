import { tool } from "ai";
import { z } from "zod";

import { googleAccessToken } from "./google.server";
import { ToolError, apiFetch, requireEnv } from "./retry.server";

type ToolResult = Record<string, unknown> | { error: string; service: string; kind: string };

async function guard<T extends Record<string, unknown>>(fn: () => Promise<T>): Promise<ToolResult> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ToolError) {
      return { error: error.message, service: error.service, kind: error.kind };
    }
    return {
      error: error instanceof Error ? error.message : "Unexpected failure",
      service: "unknown",
      kind: "unknown",
    };
  }
}

function decodeBody(payload: unknown): string {
  const part = payload as {
    body?: { data?: string };
    parts?: unknown[];
  };
  if (part?.body?.data) {
    try {
      return atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/")).slice(0, 4000);
    } catch {
      return "";
    }
  }
  for (const child of part?.parts ?? []) {
    const text = decodeBody(child);
    if (text) return text;
  }
  return "";
}

export function buildTools(request: Request) {
  const google = () => googleAccessToken(request);

  return {
    gmail_search: tool({
      description: "Search the user's Gmail. Returns matching message ids, senders and subjects.",
      inputSchema: z.object({
        query: z.string().describe("Gmail search query, e.g. from:joe@x.com newer_than:7d"),
        limit: z.number().nullable().describe("Max messages, default 5"),
      }),
      execute: ({ query, limit }) =>
        guard(async () => {
          const token = await google();
          const list = await apiFetch<{ messages?: { id: string }[] }>(
            "Gmail",
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit ?? 5}&q=${encodeURIComponent(query)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const messages = await Promise.all(
            (list.messages ?? []).map(async (m) => {
              const full = await apiFetch<{ payload?: { headers?: { name: string; value: string }[] }; snippet?: string }>(
                "Gmail",
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              const headers = Object.fromEntries((full.payload?.headers ?? []).map((h) => [h.name, h.value]));
              return { id: m.id, from: headers["From"], subject: headers["Subject"], date: headers["Date"], snippet: full.snippet };
            }),
          );
          return { messages };
        }),
    }),

    gmail_read: tool({
      description: "Read the full text of one Gmail message by id.",
      inputSchema: z.object({ messageId: z.string() }),
      execute: ({ messageId }) =>
        guard(async () => {
          const token = await google();
          const full = await apiFetch<{ payload?: unknown; snippet?: string }>(
            "Gmail",
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          return { body: decodeBody(full.payload) || full.snippet || "" };
        }),
    }),

    gmail_send: tool({
      description:
        "Send an email from the user's Gmail. Only call after the user explicitly confirms; pass confirmed=true.",
      inputSchema: z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        confirmed: z.boolean().describe("Must be true — the user confirmed sending"),
      }),
      execute: ({ to, subject, body, confirmed }) =>
        guard(async () => {
          if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm before sending." };
          const token = await google();
          const raw = btoa(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${body}`)
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
          await apiFetch("Gmail", "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ raw }),
          });
          return { sent: true };
        }),
    }),

    calendar_list_events: tool({
      description: "List upcoming Google Calendar events to check availability.",
      inputSchema: z.object({
        timeMin: z.string().nullable().describe("ISO start time, defaults to now"),
        timeMax: z.string().nullable().describe("ISO end time"),
      }),
      execute: ({ timeMin, timeMax }) =>
        guard(async () => {
          const token = await google();
          const params = new URLSearchParams({
            singleEvents: "true",
            orderBy: "startTime",
            maxResults: "20",
            timeMin: timeMin ?? new Date().toISOString(),
          });
          if (timeMax) params.set("timeMax", timeMax);
          const data = await apiFetch<{ items?: unknown[] }>(
            "Calendar",
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const items = (data.items ?? []) as { summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string } }[];
          return { events: items.map((e) => ({ summary: e.summary, start: e.start?.dateTime ?? e.start?.date, end: e.end?.dateTime })) };
        }),
    }),

    calendar_create_event: tool({
      description: "Create a Google Calendar event and optionally invite attendees. Requires confirmed=true.",
      inputSchema: z.object({
        summary: z.string(),
        startIso: z.string(),
        endIso: z.string(),
        description: z.string().nullable(),
        attendees: z.array(z.string()).nullable(),
        confirmed: z.boolean(),
      }),
      execute: ({ summary, startIso, endIso, description, attendees, confirmed }) =>
        guard(async () => {
          if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm this event." };
          const token = await google();
          const event = await apiFetch<{ htmlLink?: string }>(
            "Calendar",
            "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                summary,
                description: description ?? undefined,
                start: { dateTime: startIso },
                end: { dateTime: endIso },
                attendees: (attendees ?? []).map((email) => ({ email })),
              }),
            },
          );
          return { created: true, link: event.htmlLink };
        }),
    }),

    notion_search: tool({
      description: "Search the user's Notion workspace for pages or databases.",
      inputSchema: z.object({ query: z.string() }),
      execute: ({ query }) =>
        guard(async () => {
          const token = requireEnv("NOTION_TOKEN", "Notion");
          const data = await apiFetch<{ results?: { id: string; url?: string; object?: string }[] }>(
            "Notion",
            "https://api.notion.com/v1/search",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query, page_size: 5 }),
            },
          );
          return { results: (data.results ?? []).map((r) => ({ id: r.id, url: r.url, type: r.object })) };
        }),
    }),

    notion_create_page: tool({
      description:
        "Create a Notion page under a parent page id (find one with notion_search first). Requires confirmed=true.",
      inputSchema: z.object({
        parentPageId: z.string(),
        title: z.string(),
        content: z.string().describe("Plain text body, newlines become paragraphs"),
        confirmed: z.boolean(),
      }),
      execute: ({ parentPageId, title, content, confirmed }) =>
        guard(async () => {
          if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm this page." };
          const token = requireEnv("NOTION_TOKEN", "Notion");
          const page = await apiFetch<{ url?: string }>("Notion", "https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parent: { page_id: parentPageId },
              properties: { title: { title: [{ text: { content: title } }] } },
              children: content
                .split("\n")
                .filter(Boolean)
                .slice(0, 90)
                .map((line) => ({
                  object: "block",
                  type: "paragraph",
                  paragraph: { rich_text: [{ type: "text", text: { content: line.slice(0, 1900) } }] },
                })),
            }),
          });
          return { created: true, url: page.url };
        }),
    }),

    slack_list_channels: tool({
      description: "List Slack channels the bot can see.",
      inputSchema: z.object({}),
      execute: () =>
        guard(async () => {
          const token = requireEnv("SLACK_BOT_TOKEN", "Slack");
          const data = await apiFetch<{ ok: boolean; error?: string; channels?: { id: string; name: string }[] }>(
            "Slack",
            "https://slack.com/api/conversations.list?limit=100&exclude_archived=true",
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!data.ok) throw new ToolError(`Slack error: ${data.error}`, "Slack", "invalid");
          return { channels: (data.channels ?? []).map((c) => ({ id: c.id, name: c.name })) };
        }),
    }),

    slack_read_channel: tool({
      description: "Read the latest messages in a Slack channel by channel id.",
      inputSchema: z.object({ channelId: z.string(), limit: z.number().nullable() }),
      execute: ({ channelId, limit }) =>
        guard(async () => {
          const token = requireEnv("SLACK_BOT_TOKEN", "Slack");
          const data = await apiFetch<{ ok: boolean; error?: string; messages?: { user?: string; text?: string; ts?: string }[] }>(
            "Slack",
            `https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit ?? 20}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!data.ok) throw new ToolError(`Slack error: ${data.error}`, "Slack", "invalid");
          return { messages: data.messages ?? [] };
        }),
    }),

    slack_post_message: tool({
      description: "Post a message to a Slack channel. Requires confirmed=true.",
      inputSchema: z.object({ channelId: z.string(), text: z.string(), confirmed: z.boolean() }),
      execute: ({ channelId, text, confirmed }) =>
        guard(async () => {
          if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm this Slack post." };
          const token = requireEnv("SLACK_BOT_TOKEN", "Slack");
          const data = await apiFetch<{ ok: boolean; error?: string }>("Slack", "https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ channel: channelId, text }),
          });
          if (!data.ok) throw new ToolError(`Slack error: ${data.error}`, "Slack", "invalid");
          return { posted: true };
        }),
    }),

    web_research: tool({
      description:
        "Research a person, company or topic on the web (used for LinkedIn profiles too). Uses Firecrawl search.",
      inputSchema: z.object({ query: z.string(), limit: z.number().nullable() }),
      execute: ({ query, limit }) =>
        guard(async () => {
          const key = requireEnv("FIRECRAWL_API_KEY", "Firecrawl");
          const data = await apiFetch<{ data?: { url?: string; title?: string; description?: string }[] }>(
            "Firecrawl",
            "https://api.firecrawl.dev/v2/search",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({ query, limit: limit ?? 5 }),
            },
          );
          return { results: data.data ?? [] };
        }),
    }),

    web_scrape: tool({
      description: "Scrape a specific URL and return readable markdown.",
      inputSchema: z.object({ url: z.string() }),
      execute: ({ url }) =>
        guard(async () => {
          const key = requireEnv("FIRECRAWL_API_KEY", "Firecrawl");
          const data = await apiFetch<{ markdown?: string; data?: { markdown?: string } }>(
            "Firecrawl",
            "https://api.firecrawl.dev/v2/scrape",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
            },
          );
          return { markdown: (data.markdown ?? data.data?.markdown ?? "").slice(0, 8000) };
        }),
    }),

    computer_use_fallback: tool({
      description:
        "Last-resort fallback: ask the Coasty AI computer-use agent to perform a browser task when no official API can do it. Requires confirmed=true.",
      inputSchema: z.object({ task: z.string(), confirmed: z.boolean() }),
      execute: ({ task, confirmed }) =>
        guard(async () => {
          if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm this automated task." };
          const key = requireEnv("COASTYAI_API_KEY", "Coasty AI");
          const data = await apiFetch<Record<string, unknown>>("Coasty AI", "https://api.coasty.ai/v1/tasks", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ task }),
          });
          return { result: data };
        }),
    }),
  };
}
