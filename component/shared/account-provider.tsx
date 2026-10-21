"use client";

import { createContext, use, type ReactNode } from "react";
import type { Account } from "@/lib/account";

// The signed-in account for client components. The server layout loads it
// (after its session checks) and passes it down; after a save, the server
// action calls refresh() and the layout passes the updated account.

const AccountContext = createContext<Account | null>(null);

export function AccountProvider({ account, children }: { account: Account; children: ReactNode }) {
  return <AccountContext value={account}>{children}</AccountContext>;
}

export function useAccount(): Account {
  const account = use(AccountContext);
  if (!account) throw new Error("useAccount must be used inside an AccountProvider (a signed-in layout).");
  return account;
}
