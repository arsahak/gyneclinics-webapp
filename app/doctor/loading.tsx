import { PortalPageSkeleton } from "@/component/layout/portal-skeletons";

/** Shown inside the doctor shell while a page loads its data. */
export default function Loading() {
  return <PortalPageSkeleton role="doctor" />;
}
