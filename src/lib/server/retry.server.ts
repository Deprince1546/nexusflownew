export class ToolError extends Error {
  constructor(
    message: string,
    readonly service: string,
    readonly kind: "auth" | "rate_limit" | "network" | "invalid" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "ToolError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs fn with up to 3 attempts and exponential backoff (1s -> 2s -> 4s). */
export async function withRetry<T>(service: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable =
        !(error instanceof ToolError) || error.kind === "rate_limit" || error.kind === "network";
      if (!retryable || attempt === attempts - 1) break;
      await sleep(1000 * 2 ** attempt);
    }
  }
  if (lastError instanceof ToolError) throw lastError;
  throw new ToolError(
    lastError instanceof Error ? lastError.message : `Unknown ${service} failure`,
    service,
    "network",
  );
}

/** fetch + retry + normalized errors. Returns parsed JSON. */
export async function apiFetch<T = unknown>(
  service: string,
  input: string,
  init?: RequestInit,
): Promise<T> {
  return withRetry(service, async () => {
    let response: Response;
    try {
      response = await fetch(input, init);
    } catch (error) {
      throw new ToolError(
        `${service} network error: ${error instanceof Error ? error.message : "unreachable"}`,
        service,
        "network",
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const detail = body.slice(0, 400);
      if (response.status === 401 || response.status === 403) {
        throw new ToolError(
          `${service} authentication failed — the token may be invalid or missing scopes. ${detail}`,
          service,
          "auth",
        );
      }
      if (response.status === 429) {
        throw new ToolError(`${service} rate limited — retrying.`, service, "rate_limit");
      }
      if (response.status >= 500) {
        throw new ToolError(`${service} server error (${response.status}).`, service, "network");
      }
      throw new ToolError(`${service} rejected the request (${response.status}). ${detail}`, service, "invalid");
    }

    const text = await response.text();
    if (!text) return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  });
}

export function requireEnv(name: string, service: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ToolError(
      `${service} is not configured — add the ${name} key in settings.`,
      service,
      "auth",
    );
  }
  return value;
}
