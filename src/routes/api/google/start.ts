import { createFileRoute } from "@tanstack/react-router";

import { GOOGLE_SCOPES, googleRedirectUri } from "@/lib/server/google.server";

export const Route = createFileRoute("/api/google/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env["GOOGLE_CLIENT_ID"];
        if (!clientId) {
          return new Response("Google credentials are not configured yet.", { status: 400 });
        }
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.set("client_id", clientId);
        authUrl.searchParams.set("redirect_uri", googleRedirectUri(request));
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", GOOGLE_SCOPES);
        authUrl.searchParams.set("access_type", "offline");
        authUrl.searchParams.set("prompt", "consent");
        return Response.redirect(authUrl.toString(), 302);
      },
    },
  },
});
