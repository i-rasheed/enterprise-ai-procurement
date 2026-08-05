export const siteConfig = {
  name: "SpendWise",
  description:
    "Enterprise procurement platform for smart spend control — requests, approvals, RFQs, contracts, and AI-powered analytics.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.svg",
  locale: "en_US",
  keywords: [
    "procurement",
    "spend management",
    "enterprise",
    "approvals",
    "RFQ",
    "purchase orders",
    "vendor management",
    "AI",
  ],
  links: {
    support: "mailto:support@spendwise.app",
    docs: "/docs",
    userGuide: "/download/user-guide",
    userGuideMarkdown: "docs/SpendWise-User-Guide.md",
  },
  creator: "SpendWise",
} as const;

export const publicRoutes = [
  "/",
  "/pricing",
  "/features",
  "/blog",
  "/contact",
  "/login",
  "/register",
  "/register/pending",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/accept-invitation",
  "/vendor/login",
  "/download/user-guide",
] as const;
