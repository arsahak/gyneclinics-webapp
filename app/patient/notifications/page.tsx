import type { Metadata } from "next";
import { NotificationInbox } from "@/component/shared/notification-inbox";
import { PageHeader } from "@/component/shared/page-header";
import { getMyNotifications } from "@/lib/services/notifications";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Notifications",
  description: "Updates about your consultations, your account and news from GyneX.",
  path: "/patient/notifications",
});

// The layout checks the session on the server, so this page is rendered per request.
export const instant = false;

export default async function PatientNotificationsPage() {
  const inbox = await getMyNotifications();
  return (
    <>
      <PageHeader title="Notifications" description="Updates about your account and news from GyneX." />
      {inbox ? (
        <NotificationInbox initialItems={inbox.items} initialUnread={inbox.unread} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">We couldn&apos;t load your notifications. Please try again in a moment.</p>
      )}
    </>
  );
}
