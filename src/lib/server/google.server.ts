import { ToolError, apiFetch } from "./retry.server";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/calendar",
  "openid",
  "email",
].join(" ");

export const GOOGLE_COOKIE = "nf_google_rt";

export function googleRedirectUri(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}/api/public/google/callback`;
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

/** Exchanges the stored refresh token for a fresh access token. */
export async function googleAccessToken(request: Request): Promise<string> {
  const refreshToken = readCookie(request, GOOGLE_COOKIE);
  if (!refreshToken) {
    throw new ToolError(
      "Google is not connected — open Settings and connect your Google account.",
      "Google",
      "auth",
    );
  }
  const clientId = process.env["GOOGLE_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw new ToolError("Google credentials are missing on the server.", "Google", "auth");
  }

  const data = await apiFetch<{ access_token?: string }>("Google", "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!data.access_token) {
    throw new ToolError("Google refused to refresh the session — reconnect your account.", "Google", "auth");
  }
  return data.access_token;
}
