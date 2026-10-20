import { ChevronDown } from "lucide-react";
import { CONSULTATION_POLICY } from "@/lib/consultation";
import { APP_NAME } from "@/lib/brand";

const { sessionHours, followUpDays, replyGuaranteeHours } = CONSULTATION_POLICY;

const FAQS = [
  {
    q: `Is ${APP_NAME} free to use?`,
    a: "Yes. The period tracker, health insights and Learn articles are free. You only pay when you book a consultation with a specialist, and some consultations are free.",
  },
  {
    q: `Does ${APP_NAME} replace seeing a doctor?`,
    a: `No. ${APP_NAME} gives information and guidance, not a medical diagnosis. Specialists may recommend an in-person visit when needed. In an emergency, call your local emergency number.`,
  },
  {
    q: "How does the app predict my period and fertile window?",
    a: "Only from the dates you log. We use your average cycle length to estimate your next period, and count back about 14 days to estimate ovulation. Predictions are estimates and must not be used as contraception.",
  },
  {
    q: "How do consultations work?",
    a: `Choose a verified specialist, then chat now or book a time. Once paid, your booking is confirmed instantly. The chat stays open for ${sessionHours} hours, followed by ${followUpDays} days of free follow-up on the same concern.`,
  },
  {
    q: "Why are consultation fees different in my country?",
    a: "Fees are set by region so care stays fair and affordable. The app detects the region you open it from and shows the price for that region automatically.",
  },
  {
    q: "What if the doctor doesn't reply?",
    a: `If your doctor hasn't replied within ${replyGuaranteeHours} hours of your consultation starting, you get a full refund.`,
  },
  {
    q: "Is my health data private?",
    a: "Your data is encrypted and only used with your consent to provide the service. It is never sold. Phone numbers, emails and links are automatically blocked in chat to protect your privacy.",
  },
  {
    q: "Are the doctors real and verified?",
    a: "Every specialist's medical registration and qualifications are checked by our team before their profile goes live.",
  },
];

/** Accessible accordion built on <details>, so it works without JavaScript. */
export function Faq() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
      {FAQS.map(({ q, a }, i) => (
        <details key={q} className="group" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-medium text-foreground transition-colors hover:bg-surface-2/60 [&::-webkit-details-marker]:hidden">
            {q}
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform group-open:rotate-180">
              <ChevronDown className="size-4" />
            </span>
          </summary>
          <p className="-mt-1 px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  );
}
