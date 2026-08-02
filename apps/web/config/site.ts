export const siteConfig = {
  name: "ProcureAI",
  description:
    "Enterprise AI procurement platform for requests, approvals, RFQs, contracts, and analytics.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.svg",
  locale: "en_US",
  keywords: [
    "procurement",
    "enterprise",
    "approvals",
    "RFQ",
    "purchase orders",
    "vendor management",
    "AI",
  ],
  links: {
    support: "mailto:support@procureai.app",
    docs: "/docs",
  },
  creator: "ProcureAI",
} as const;

export const publicRoutes = [
  "/",
  "/pricing",
  "/features",
  "/blog",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/accept-invitation",
  "/vendor/login",
] as const;
