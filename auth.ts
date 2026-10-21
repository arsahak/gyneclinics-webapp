import NextAuth, { type User } from "next-auth";
import { getToken } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { headers } from "next/headers";
import type { AppRole } from "@/lib/types";

// Session management for the patient and doctor web app.
//
// Sign-in is phone + OTP, handled by the backend (see app/actions/authAction.ts):
//   1. sendOtpAction    → backend sends the SMS
//   2. verifyOtpAction  → backend checks the code, then we call signIn():
//        known number → "backend-token" provider (full session)
//        new number   → "signup" provider (pending session until registration)
//   3. registerAction   → backend creates the account, then "backend-token" again
//
// The session is a JWT in an encrypted, httpOnly cookie. The backend token is
// kept in that JWT but never put on the session object, so it can't be read
// from the browser (including via /api/auth/session). Server code gets it with
// getAccessToken() below.

const isProduction = process.env.NODE_ENV === "production";

const secret = process.env.AUTH_SECRET;
if (!secret) {
  if (isProduction) throw new Error("AUTH_SECRET must be set in production.");
  console.warn("AUTH_SECRET is not set. Using a development-only secret.");
}
const authSecret = secret || "gyneclinics-dev-secret-not-for-production";

/** Backend base URL, e.g. http://localhost:8000. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const cookieName = (name: string, prefix: "__Secure-" | "__Host-" = "__Secure-") =>
  `${isProduction ? prefix : ""}gyneclinics.${name}`;
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: isProduction };
const SESSION_COOKIE = cookieName("session-token");

/** Session length. The backend token may expire sooner; then the session ends with it. */
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const APP_ROLES: AppRole[] = ["patient", "doctor"];

/** Reads `exp` from the backend JWT. It's only used to end our session in time, not to trust the token. */
function tokenExpiry(token: string): number | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

async function fetchCurrentUser(accessToken: string) {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not set.");
    return null;
  }
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body?.data?.user ?? null;
  } catch (error) {
    console.error("Could not reach the backend to load the user:", error);
    return null;
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  secret: authSecret,
  trustHost: true,
  cookies: {
    sessionToken: { name: SESSION_COOKIE, options: cookieOptions },
    callbackUrl: { name: cookieName("callback-url"), options: cookieOptions },
    csrfToken: { name: cookieName("csrf-token", "__Host-"), options: cookieOptions },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Signs in with a token the backend just issued (after OTP or registration).
    // The token is checked against the backend, so it can't be forged.
    CredentialsProvider({
      id: "backend-token",
      credentials: { accessToken: {} },
      async authorize(credentials) {
        const accessToken = typeof credentials?.accessToken === "string" ? credentials.accessToken : "";
        if (!accessToken) return null;

        const user = await fetchCurrentUser(accessToken);
        if (!user || !APP_ROLES.includes(user.role)) return null;

        return {
          id: user._id ?? user.id,
          name: user.fullName,
          phone: user.phone,
          role: user.role,
          accessToken,
        } satisfies User;
      },
    }),
    // A verified phone with no account yet. The backend checks the signup
    // token again at registration, so nothing here grants access by itself.
    CredentialsProvider({
      id: "signup",
      credentials: { phone: {}, signupToken: {} },
      async authorize(credentials) {
        const phone = typeof credentials?.phone === "string" ? credentials.phone : "";
        const signupToken = typeof credentials?.signupToken === "string" ? credentials.signupToken : "";
        if (!phone || !signupToken) return null;
        return { id: `signup:${phone}`, phone, signupToken } satisfies User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fresh sign-in: replace whatever was there before.
        return {
          sub: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          accessToken: user.accessToken,
          accessTokenExpires: user.accessToken ? tokenExpiry(user.accessToken) : undefined,
          signupToken: user.signupToken,
        };
      }
      // Returning null ends the session once the backend token has expired.
      if (token.accessTokenExpires && Date.now() >= token.accessTokenExpires) return null;
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub ?? "",
        name: token.name ?? "",
        phone: token.phone ?? "",
        role: token.role,
      };
      session.pendingSignup = !token.accessToken && !!token.signupToken;
      return session;
    },
  },
});

/** Reads the session JWT on the server. */
async function readToken() {
  return getToken({
    req: { headers: await headers() },
    secret: authSecret,
    cookieName: SESSION_COOKIE,
    secureCookie: isProduction,
  });
}

/** The backend token for the signed-in user, or null. Server only. */
export async function getAccessToken(): Promise<string | null> {
  const token = await readToken();
  return token?.accessToken ?? null;
}

/** Phone and signup token of a verified number with no account yet. Server only. */
export async function getPendingSignup(): Promise<{ phone: string; signupToken: string } | null> {
  const token = await readToken();
  if (!token?.signupToken || !token.phone || token.accessToken) return null;
  return { phone: token.phone, signupToken: token.signupToken };
}
