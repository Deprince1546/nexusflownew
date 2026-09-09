import { createFileRoute } from "@tanstack/react-router";

import { GOOGLE_COOKIE, googleRedirectUri, readCookie } from "@/lib/server/google.server";

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json({
          ai: Boolean(process.env["OPENROUTER_API_KEY"]),
          voice: Boolean(process.env["ELEVENLABS_API_KEY"]),
          research: Boolean(process.env["FIRECRAWL_API_KEY"]),
          computerUse: Boolean(process.env["COASTYAI_API_KEY"]),
          notion: Boolean(process.env["NOTION_TOKEN"]),
          slack: Boolean(process.env["SLACK_BOT_TOKEN"]),
          googleKeys: Boolean(process.env["GOOGLE_CLIENT_ID"] && process.env["GOOGLE_CLIENT_SECRET"]),
          googleConnected: Boolean(readCookie(request, GOOGLE_COOKIE)),
          googleRedirectUri: googleRedirectUri(request),
        });
      },
    },
  },
});
