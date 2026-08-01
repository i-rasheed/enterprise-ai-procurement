import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendors",
};

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
