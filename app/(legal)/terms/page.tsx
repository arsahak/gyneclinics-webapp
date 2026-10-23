import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/component/landing/legal-doc";
import { APP_NAME, COMPANY_NAME, SUPPORT_EMAIL } from "@/lib/brand";
import { CONSULTATION_POLICY } from "@/lib/consultation";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms for using GyneX, including consultations, payments, refunds and your responsibilities.",
  path: "/terms",
});

const { sessionHours, followUpDays, replyGuaranteeHours } = CONSULTATION_POLICY;

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        These terms apply when you use the {APP_NAME} website and apps, provided by {COMPANY_NAME}. By creating an
        account you agree to them, together with our <Link href="/privacy">Privacy Policy</Link>. Please read them
        carefully.
      </p>
    ),
  },
  {
    id: "not-medical-advice",
    title: "Information, not diagnosis",
    body: (
      <>
        <p>
          {APP_NAME} provides general health information and guidance. It is <strong>not a medical diagnosis</strong> and
          does not replace an in-person examination by a qualified clinician.
        </p>
        <ul>
          <li>Cycle predictions, fertile windows and insights are estimates based only on the information you enter.</li>
          <li>Predictions must not be used as a method of contraception.</li>
          <li>
            {APP_NAME} is <strong>not an emergency service</strong>. If you need urgent help, call your local emergency
            number.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul>
        <li>You must be 16 or over to create an account.</li>
        <li>Each mobile number can be linked to one account. Keep your device and verification codes secure.</li>
        <li>The information you give us must be accurate — especially details your insights depend on.</li>
      </ul>
    ),
  },
  {
    id: "consultations",
    title: "Consultations and payments",
    body: (
      <>
        <p>
          Specialists on {APP_NAME} are independent, registered healthcare professionals whose credentials we verify
          before they can consult.
        </p>
        <ul>
          <li>Bookings are confirmed automatically once payment is complete.</li>
          <li>
            A consultation includes {sessionHours} hours of chat from its start time, followed by {followUpDays} days of
            free follow-up messages on the same concern.
          </li>
          <li>
            Fees are shown before you pay and are set by region, based on where you use the app. Free consultations
            may be offered from time to time.
          </li>
          <li>
            If your specialist hasn&apos;t replied within {replyGuaranteeHours} hours of the consultation starting, you
            will receive a full refund.
          </li>
          <li>Payments are processed securely by our payment providers.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Using the app safely",
    body: (
      <>
        <p>To keep everyone safe, you agree not to:</p>
        <ul>
          <li>Share or ask for phone numbers, email addresses, links or social media handles in chat or reviews.</li>
          <li>Post content that is abusive, misleading, or that identifies another person without their consent.</li>
          <li>Misuse, copy or try to disrupt the service.</li>
        </ul>
        <p>We may remove content or suspend accounts that break these rules.</p>
      </>
    ),
  },
  {
    id: "content",
    title: "Articles, stories and reviews",
    body: (
      <p>
        Articles are reviewed by our editorial team. Stories you submit are checked before publishing and may be edited
        or declined. By submitting a story or review, you give us permission to display it in the app. Sponsored
        content is always clearly labelled.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <p>
        We work hard to keep {APP_NAME} accurate and available, but we can&apos;t guarantee it will always be
        uninterrupted or error-free. Nothing in these terms limits our liability where it would be unlawful to do so,
        including for death or personal injury caused by our negligence.
      </p>
    ),
  },
  {
    id: "ending",
    title: "Ending your account",
    body: (
      <p>
        You can delete your account at any time from Settings. We may suspend or close an account that breaks these
        terms, and will tell you why unless the law prevents us.
      </p>
    ),
  },
  {
    id: "changes-law",
    title: "Changes and governing law",
    body: (
      <>
        <p>
          We may update these terms. We&apos;ll let you know in the app before significant changes take effect.
        </p>
        <p>
          These terms are governed by the laws of England and Wales. Questions? Contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms & Conditions"
      current="/terms"
      updated="20 October 2026"
      intro={`The rules for using ${APP_NAME} — what we provide, what we ask of you, and how consultations and payments work.`}
      sections={sections}
    />
  );
}
