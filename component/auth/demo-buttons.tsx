"use client";

import { Stethoscope, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/component/ui/button";
import { useSession } from "@/lib/store/session";
import type { Role } from "@/lib/types";

/** Skips signup with a sample account so the UI can be reviewed quickly. */
export function DemoButtons({ className }: { className?: string }) {
  const router = useRouter();
  const startDemo = useSession((s) => s.startDemo);

  const open = (role: Role) => {
    startDemo(role);
    router.push(role === "patient" ? "/patient" : "/doctor");
  };

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Preview the app
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => open("patient")}>
          <UserRound /> Patient demo
        </Button>
        <Button variant="outline" size="sm" onClick={() => open("doctor")}>
          <Stethoscope /> Doctor demo
        </Button>
      </div>
    </div>
  );
}
