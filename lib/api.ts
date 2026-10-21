import "server-only";
import { API_URL, getAccessToken } from "@/auth";

// Server-side client for the Gyneclinics backend. Every call runs on the
// server, so the backend token never reaches the browser.

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  message: string;
  errors: string[];
  data: T | null;
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Defaults to the signed-in user's token. Pass `null` for public endpoints. */
  token?: string | null;
}

export async function api<T = unknown>(path: string, { method = "GET", body, token }: ApiOptions = {}): Promise<ApiResult<T>> {
  const bearer = token === undefined ? await getAccessToken() : token;
  try {
    const response = await fetch(`${API_URL}/api/v1${path}`, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(bearer && { Authorization: `Bearer ${bearer}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const json = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      message: json?.message ?? (response.ok ? "OK" : "Something went wrong. Please try again."),
      errors: Array.isArray(json?.errors) ? json.errors : [],
      data: (json?.data ?? null) as T | null,
    };
  } catch (error) {
    console.error(`Backend request failed: ${method} ${path}`, error);
    return { ok: false, status: 503, message: "Can't reach the server. Please check your connection and try again.", errors: [], data: null };
  }
}

/** First validation error if there is one, otherwise the message. */
export const errorText = (result: ApiResult<unknown>) => result.errors[0] ?? result.message;
