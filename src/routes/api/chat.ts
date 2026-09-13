import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";

import { buildTools } from "@/lib/server/tools.server";

const SYSTEM_PROMPT = `You are NexusFlow, a multi-step AI agent that takes real actions across Gmail, Notion, Google Calendar, Slack and the web (LinkedIn research via web search).

Rules:
- For any request needing more than one action, first reply with a short numbered plan and ask the user to confirm before executing.
- Tools that send email, create calendar events, create Notion pages, post to Slack or run computer-use require confirmed=true. Never set confirmed=true unless the user has clearly said yes in this conversation.
- If a tool result contains an "error" field, explain it plainly to the user (e.g. "Notion token invalid — please re-enter it in settings"), stop the chain, and offer to continue with the remaining steps or abort.
- Keep replies short and conversational: they may be read aloud. Use plain sentences, no markdown tables.
- Remember context from earlier in the conversation.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["OPENROUTER_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "The AI key is missing. Add it in settings." }, { status: 400 });
        }

        const { messages } = (await request.json()) as { messages: UIMessage[] };

        const openrouter = createOpenAICompatible({
          name: "openrouter",
          baseURL: "https://openrouter.ai/api/v1",
          headers: { Authorization: `Bearer ${apiKey}` },
        });

        const result = streamText({
          model: openrouter("anthropic/claude-sonnet-4.5"),
          system: `${SYSTEM_PROMPT}\nCurrent time: ${new Date().toISOString()}`,
          messages: await convertToModelMessages(messages),
          tools: buildTools(request),
          stopWhen: stepCountIs(50),
          maxOutputTokens: 1200,
          onError: ({ error }) => console.error("chat error", error),
        });

        return result.toUIMessageStreamResponse({
          onError: (error) =>
            error instanceof Error ? error.message : "The AI service could not be reached. Please try again.",
        });

      },
    },
  },
});
