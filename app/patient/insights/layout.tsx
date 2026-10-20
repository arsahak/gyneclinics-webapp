import { InsightsNav } from "@/component/insights/insights-nav";
import { Disclaimer } from "@/component/shared/disclaimer";
import { PageHeader } from "@/component/shared/page-header";

export default function InsightsLayout({ children }: LayoutProps<"/patient/insights">) {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Your health insights"
        description="Charts built only from the measurements you enter."
      />
      <InsightsNav />
      {/* BRD D5: the disclaimer is visible on every insight screen. */}
      <Disclaimer className="mb-6" />
      {children}
    </>
  );
}
