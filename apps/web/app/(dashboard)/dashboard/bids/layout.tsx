import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bids",
};

export default function BidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
