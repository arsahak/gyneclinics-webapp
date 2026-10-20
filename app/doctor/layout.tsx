import { AppShell } from "@/component/layout/app-shell";

export default function DoctorLayout({ children }: LayoutProps<"/doctor">) {
  return <AppShell role="doctor">{children}</AppShell>;
}
