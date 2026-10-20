import { SiteFooter } from "@/component/landing/site-footer";
import { LandingNav, TopBar } from "@/component/layout/landing-nav";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <LandingNav />
      <main className="flex-1 bg-surface">{children}</main>
      <SiteFooter />
    </div>
  );
}
