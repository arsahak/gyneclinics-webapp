"use client";

import { format, parseISO } from "date-fns";
import { Download, Loader2, LogOut, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { deleteAccountAction, signOutAction } from "@/app/actions/authAction";
import { useAccount } from "./account-provider";
import { ThemePicker } from "./theme-toggle";

export function AppearanceCard() {
  return (
    <Card>
      <CardHeader title="Appearance" description="Light mode is the default." />
      <CardBody>
        <ThemePicker />
      </CardBody>
    </Card>
  );
}

export function PrivacyCard({ onResetDemo }: { onResetDemo?: () => void }) {
  const { consentAt } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  const deleteAccount = () => {
    if (!window.confirm("Delete your account permanently? This can't be undone.")) return;
    setError(null);
    startDeleting(async () => {
      // Signs out and leaves the app on success.
      const result = await deleteAccountAction();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <Card>
      <CardHeader title="Privacy & account" />
      <CardBody className="space-y-4">
        {consentAt && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-success" />
            Disclaimer and data consent accepted on {format(parseISO(consentAt), "d MMM yyyy")}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled title="Available once the backend is connected">
            <Download /> Export my data
          </Button>
          {onResetDemo && (
            <Button variant="outline" size="sm" onClick={onResetDemo}>
              <RotateCcw /> Reset demo data
            </Button>
          )}
          <Button variant="danger" size="sm" disabled={deleting} onClick={deleteAccount}>
            {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete account
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start px-0 text-danger hover:bg-transparent">
            <LogOut /> Sign out
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
