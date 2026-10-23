"use client";

import { format } from "date-fns";
import { Download, ReceiptText } from "lucide-react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Dialog } from "@/component/ui/dialog";
import { REGIONS, formatMoney, type RegionId } from "@/lib/locale/regions";
import type { Consultation, Doctor } from "@/lib/types";

const METHOD_LABEL = { card: "Card", local: "Other method", wallet: "Apple / Google Pay", free: "Free" } as const;

export function ReceiptDialog({
  consultation,
  doctor,
  open,
  onClose,
}: {
  consultation: Consultation;
  doctor: Pick<Doctor, "name">;
  open: boolean;
  onClose: () => void;
}) {
  const { payment } = consultation;
  const free = payment.method === "free";
  const rows: Array<[string, React.ReactNode]> = [
    ["Booking ID", <span key="id" className="font-mono">{consultation.id}</span>],
    ["Specialist", doctor.name],
    ["Consultation", `${consultation.mode === "instant" ? "Instant chat" : "Scheduled chat"} · ${format(new Date(consultation.startsAt), "d MMM yyyy, HH:mm")}`],
    ["Booked on", format(new Date(consultation.bookedAt), "d MMM yyyy, HH:mm")],
    ["Pricing region", REGIONS[payment.regionId as RegionId]?.name ?? payment.regionId],
    ["Payment method", free ? "Free consultation" : `${METHOD_LABEL[payment.method]}${payment.details ? ` · ${payment.details}` : ""}`],
  ];
  if (!free) rows.push(["Payment reference", <span key="ref" className="font-mono">{payment.reference}</span>]);
  if (payment.paidAt) rows.push(["Paid on", format(new Date(payment.paidAt), "d MMM yyyy, HH:mm")]);

  return (
    <Dialog open={open} onClose={onClose} title="Receipt" description="GyneX consultation receipt">
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ReceiptText className="size-4 text-primary" /> Total
          </span>
          <span className="flex items-center gap-2">
            <Badge tone={consultation.refundedAt ? "danger" : "success"}>{consultation.refundedAt ? "Refunded" : free ? "Free" : "Paid"}</Badge>
            <span className="text-2xl font-semibold text-foreground">{payment.amount ? formatMoney(payment.amount, payment.currency) : "Free"}</span>
          </span>
        </div>
        <dl className="divide-y divide-border rounded-2xl border border-border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <Button variant="outline" className="w-full" disabled title="Available once the backend is connected">
          <Download /> Download PDF
        </Button>
      </div>
    </Dialog>
  );
}
