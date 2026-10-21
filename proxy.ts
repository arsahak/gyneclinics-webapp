import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { HOME } from "@/lib/account";

// Fast checks from the session cookie alone, before any page renders:
// signed-out users go to /login, and each role stays in its own area.
// The full checks (onboarding, consent, doctor verification) run in the
// server layouts against fresh backend data — see lib/session.ts.

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const pendingSignup = req.auth?.pendingSignup ?? false;
  const go = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl));

  const area = pathname.startsWith("/patient") ? "patient" : pathname.startsWith("/doctor") ? "doctor" : null;
  const needsAccount = area !== null || pathname.startsWith("/onboarding") || pathname === "/consent";

  if (needsAccount && !role) return go(pendingSignup ? "/register" : "/login");
  if (role && area && area !== role) return go(HOME[role]);
  if (pathname === "/register" && !pendingSignup) return go(role ? HOME[role] : "/login");
  if (pathname === "/login" && role) return go(HOME[role]);

  // Server layouts don't receive the path; the doctor layout needs it to
  // tell the "verification pending" page apart from the rest.
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/onboarding/:path*", "/consent", "/register", "/login"],
};
