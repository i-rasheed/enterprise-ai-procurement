import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goods Receipts",
};

export default function GoodsReceiptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
