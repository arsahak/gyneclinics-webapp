import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/component/landing/legal-doc";
import { APP_NAME, COMPANY_NAME, SUPPORT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {APP_NAME} is a women&apos;s health app provided by {COMPANY_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). We
          are the data controller for the personal information you share with us through the {APP_NAME} website and
          mobile apps.
        </p>
        <p>
          This policy explains what we collect, why we collect it, and the choices and rights you have. If anything is
          unclear, contact us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>We only collect what we need to provide the service:</p>
        <ul>
          <li>
            <strong>Account details</strong> — your mobile number, name, date of birth and account type (patient or
            doctor).
          </li>
          <li>
            <strong>Health information you enter</strong> — period dates, symptoms, cycle and pregnancy status, weight
            and baby growth measurements. We never collect this automatically.
          </li>
          <li>
            <strong>Consultation information</strong> — your bookings, the concern you describe and messages with
            specialists.
          </li>
          <li>
            <strong>Payment information</strong> — handled by our payment providers. We receive a payment reference and
            the last four digits of a card, never your full card details.
          </li>
          <li>
            <strong>Doctor verification</strong> — for specialists, registration numbers, qualifications and supporting
            documents.
          </li>
          <li>
            <strong>Device and approximate location</strong> — your country or region, worked out from your IP address
            or device time zone, which we use to show fair regional pricing. Precise location is only used if you
            choose to share it.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To run your account and show your cycle calendar, predictions and insights.</li>
        <li>To connect you with specialists, manage bookings, process payments and refunds.</li>
        <li>To send reminders and service messages you have switched on.</li>
        <li>To keep the platform safe — for example blocking contact details in chat and verifying doctors.</li>
        <li>To improve the app using aggregated, de-identified information.</li>
        <li>To meet our legal and regulatory obligations.</li>
      </ul>
    ),
  },
  {
    id: "legal-basis",
    title: "Legal basis and health data",
    body: (
      <>
        <p>
          Health information is &quot;special category&quot; data under UK GDPR. We process it only with your{" "}
          <strong>explicit consent</strong>, which you give when you create an account and can withdraw at any time in
          Settings.
        </p>
        <p>
          Other information is processed to perform our contract with you, for our legitimate interests in running a
          safe and reliable service, or where the law requires it.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We never sell your personal information. We only share it with:</p>
        <ul>
          <li>
            <strong>The specialists you choose to consult</strong> — they see your concern, the messages you send and
            any information you choose to share.
          </li>
          <li>
            <strong>Service providers</strong> who host our systems, send messages or process payments, under strict
            data protection agreements.
          </li>
          <li>
            <strong>Authorities</strong> when the law requires it, or to protect someone&apos;s safety.
          </li>
        </ul>
        <p>Advertising on {APP_NAME} is never targeted using your health information.</p>
      </>
    ),
  },
  {
    id: "retention-security",
    title: "Storage, retention and security",
    body: (
      <>
        <p>
          Your information is encrypted in transit and at rest. Access is limited to staff who need it, and admin
          activity is logged. Chat content is private — our team can see message metadata for safety monitoring, but
          not what you write.
        </p>
        <p>
          We keep your information for as long as your account is active. If you delete your account, we delete or
          anonymise your data within 30 days, except where we must keep records by law (for example payment records).
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>You can:</p>
        <ul>
          <li>Access the information we hold about you and get a copy.</li>
          <li>Correct anything that is wrong or incomplete.</li>
          <li>Delete your account and data.</li>
          <li>Withdraw consent for health data processing at any time.</li>
          <li>Object to or restrict some processing, and move your data to another service.</li>
        </ul>
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to use these rights. You can also complain to the
          Information Commissioner&apos;s Office (ICO) or your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>{APP_NAME} is intended for people aged 16 and over. We do not knowingly collect information from younger children.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the app changes. If we make significant changes, we&apos;ll tell you in the app
        before they take effect. See also our <Link href="/cookies">Cookie Policy</Link> and{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      current="/privacy"
      updated="20 October 2026"
      intro={`Your health information is personal. This policy explains how ${APP_NAME} collects, uses and protects it — in plain language.`}
      sections={sections}
    />
  );
}
