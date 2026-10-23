"use client";

import { format, parseISO } from "date-fns";
import { Download, Eraser, Loader2, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { deleteAccountAction, signOutAction } from "@/app/actions/authAction";
import { useConsultations } from "@/lib/store/consultations";
import { useLibrary } from "@/lib/store/library";
import { useTracker } from "@/lib/store/tracker";
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

/** "gyneclinics-data-2026-10-23.json" with everything the app has about you. */
function downloadMyData(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gyneclinics-data-${format(new Date(), "yyyy-MM-dd")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Consent, data export, account deletion and sign-out. Patients can also
 * delete their tracker logs (`onClearTracker`).
 */
export function PrivacyCard({ onClearTracker }: { onClearTracker?: () => Promise<string | null> }) {
  const account = useAccount();
  const { consentAt } = account;
  const consultations = useConsultations((s) => s.consultations);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();
  const [clearing, startClearing] = useTransition();

  const deleteAccount = () => {
    if (!window.confirm("Delete your account permanently? This can't be undone.")) return;
    setError(null);
    startDeleting(async () => {
      // Signs out and leaves the app on success.
      const result = await deleteAccountAction();
      if (result?.error) setError(result.error);
    });
  };

  const exportData = () => {
    const { periods, weights, babyGrowth, reminders } = useTracker.getState();
    downloadMyData({
      exportedAt: new Date().toISOString(),
      account: { fullName: account.fullName, phone: account.phone, role: account.role, consentAt: account.consentAt },
      profile: account.patient ?? account.doctor,
      consultations,
      ...(account.role === "patient" && { tracker: { periods, weights, babyGrowth, reminders }, savedArticles: useLibrary.getState().bookmarks }),
    });
  };

  const clearTracker = () => {
    if (!onClearTracker) return;
    if (!window.confirm("Delete all your logged periods, weights and scan results? This can't be undone.")) return;
    setError(null);
    setNotice(null);
    startClearing(async () => {
      const failed = await onClearTracker();
      if (failed) setError(failed);
      else setNotice("Your tracker data was deleted.");
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
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download /> Export my data
          </Button>
          {onClearTracker && (
            <Button variant="outline" size="sm" disabled={clearing} onClick={clearTracker}>
              {clearing ? <Loader2 className="animate-spin" /> : <Eraser />} Delete tracker data
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
        {notice && (
          <p role="status" className="text-sm text-success">
            {notice}
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
