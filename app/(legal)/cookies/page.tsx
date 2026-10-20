import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/component/landing/legal-doc";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = { title: "Cookie Policy" };

const COOKIE_TYPES = [
  {
    name: "Strictly necessary",
    purpose: "Keep you signed in, remember your consent choices and protect your account.",
    optional: "Always on",
  },
  {
    name: "Preferences",
    purpose: "Remember settings such as light or dark mode and your pricing region.",
    optional: "Always on",
  },
  {
    name: "Analytics",
    purpose: "Help us understand which features are used so we can improve them. Never linked to your health data.",
    optional: "Only with consent",
  },
];

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What are cookies?",
    body: (
      <p>
        Cookies are small text files saved on your device when you visit a website. We also use similar technologies
        such as local storage, which keeps information in your browser. In this policy we call them all
        &quot;cookies&quot;.
      </p>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use cookies",
    body: (
      <>
        <p>{APP_NAME} uses as few cookies as possible:</p>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">What it does</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Can I turn it off?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COOKIE_TYPES.map((cookie) => (
                <tr key={cookie.name}>
                  <td className="px-4 py-3 font-medium whitespace-nowrap text-foreground">{cookie.name}</td>
                  <td className="px-4 py-3">{cookie.purpose}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{cookie.optional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "no-advertising",
    title: "No advertising cookies",
    body: (
      <p>
        We do not use cookies to track you across other websites, and we never use your health information to target
        advertising. Ads shown in {APP_NAME} are placed by us, not by third-party ad networks.
      </p>
    ),
  },
  {
    id: "managing",
    title: "Managing cookies",
    body: (
      <>
        <p>
          You can change your analytics choice at any time in the app&apos;s Settings. You can also block or delete
          cookies in your browser settings, but some parts of {APP_NAME}, such as staying signed in, may stop working.
        </p>
      </>
    ),
  },
  {
    id: "more",
    title: "More information",
    body: (
      <p>
        For how we handle personal information, see our <Link href="/privacy">Privacy Policy</Link>. Questions about
        cookies? Contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalDoc
      title="Cookie Policy"
      current="/cookies"
      updated="20 October 2026"
      intro={`What cookies ${APP_NAME} uses, why, and how you can control them.`}
      sections={sections}
    />
  );
}
