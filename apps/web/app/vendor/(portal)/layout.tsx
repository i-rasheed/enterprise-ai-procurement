import { VendorShell } from "@/features/vendor-portal/components/vendor-shell";

export default function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VendorShell>{children}</VendorShell>;
}
