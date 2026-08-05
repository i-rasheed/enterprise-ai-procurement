import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RFQs",
};

export default function RfqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
