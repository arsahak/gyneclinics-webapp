import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/types";

// Fields auth.ts adds to the Auth.js user, session and JWT.

declare module "next-auth" {
  interface User {
    phone?: string;
    role?: AppRole;
    /** Backend token. Stored in the JWT only, never on the session. */
    accessToken?: string;
    /** Proof of a verified phone with no account yet. JWT only. */
    signupToken?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      phone: string;
      /** Missing while signup is pending. */
      role?: AppRole;
    } & Omit<DefaultSession["user"], "name">;
    /** The phone is verified but the account isn't created yet. */
    pendingSignup: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    phone?: string;
    role?: AppRole;
    accessToken?: string;
    accessTokenExpires?: number;
    signupToken?: string;
  }
}
