export const vendorPortalNavigation = [
  { title: "Dashboard", href: "/vendor", icon: "LayoutDashboard" as const },
  { title: "RFQs", href: "/vendor/rfqs", icon: "FileSearch" as const },
  { title: "Bids", href: "/vendor/bids", icon: "Gavel" as const },
  { title: "Purchase Orders", href: "/vendor/purchase-orders", icon: "Package" as const },
  { title: "Invoices", href: "/vendor/invoices", icon: "FileText" as const },
  { title: "Contracts", href: "/vendor/contracts", icon: "FileSignature" as const },
  { title: "AI Assistant", href: "/vendor/assistant", icon: "Bot" as const },
  { title: "Profile", href: "/vendor/profile", icon: "UserCircle" as const },
];

export const VENDOR_SUGGESTED_PROMPTS = [
  "What RFQs am I invited to?",
  "Summarize my outstanding purchase orders.",
  "Which bids are still in draft?",
  "What contracts are active for my company?",
] as const;

export const VENDOR_FAQ: Record<string, string> = {
  "What RFQs am I invited to?":
    "Open the RFQs page to view published requests where your company is listed as an invited vendor.",
  "Summarize my outstanding purchase orders.":
    "Visit Purchase Orders to see issued and acknowledged orders awaiting delivery or confirmation.",
  "Which bids are still in draft?":
    "Check the Bids page and filter by draft status to finish and submit pending proposals.",
  "What contracts are active for my company?":
    "The Contracts page lists active agreements linked to your vendor profile.",
};
