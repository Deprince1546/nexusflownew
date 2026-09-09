import { createFileRoute } from "@tanstack/react-router";

import { GOOGLE_COOKIE, googleRedirectUri, setCookie } from "@/lib/server/google.server";

export const Route = createFileRoute("/api/public/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        if (error || !code) {
          return Response.redirect(`${url.origin}/app?google=error`, 302);
        }

        const clientId = process.env["GOOGLE_CLIENT_ID"];
        const clientSecret = process.env["GOOGLE_CLIENT_SECRET"];
        if (!clientId || !clientSecret) {
          return Response.redirect(`${url.origin}/app?google=missing_keys`, 302);
        }

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: googleRedirectUri(request),
            grant_type: "authorization_code",
          }),
        });

        const payload = (await tokenResponse.json().catch(() => ({}))) as {
          refresh_token?: string;
        };

        if (!tokenResponse.ok || !payload.refresh_token) {
          return Response.redirect(`${url.origin}/app?google=error`, 302);
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: `${url.origin}/app?google=connected`,
            "Set-Cookie": setCookie(GOOGLE_COOKIE, payload.refresh_token, 60 * 60 * 24 * 180),
          },
        });
      },
    },
  },
});
