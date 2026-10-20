"use client";

import { format, parseISO } from "date-fns";
import { Download, LogOut, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/component/ui/button";
import { Card, CardBody, CardHeader } from "@/component/ui/card";
import { useSession } from "@/lib/store/session";
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
  const router = useRouter();
  const consentAt = useSession((s) => s.consentAt);
  const signOut = useSession((s) => s.signOut);
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
          <Button variant="danger" size="sm" disabled title="Available once the backend is connected">
            <Trash2 /> Delete account
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start px-0 text-danger hover:bg-transparent"
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          <LogOut /> Sign out
        </Button>
      </CardBody>
    </Card>
  );
}
