const PDFDocument = require("pdfkit");
const { createWriteStream, copyFileSync, mkdirSync } = require("node:fs");
const { resolve, dirname } = require("node:path");

const outputPaths = [
  resolve(__dirname, "../../../docs/SpendWise-User-Guide.pdf"),
  resolve(__dirname, "../../web/public/SpendWise-User-Guide.pdf"),
];
const primaryOutput = outputPaths[0];

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: "SpendWise User Guide",
    Author: "SpendWise",
    Subject: "How to use the Enterprise Procurement Platform",
  },
});

const primaryStream = createWriteStream(primaryOutput);

primaryStream.on("finish", () => {
  for (const outputPath of outputPaths.slice(1)) {
    mkdirSync(dirname(outputPath), { recursive: true });
    copyFileSync(primaryOutput, outputPath);
  }
  outputPaths.forEach((outputPath) => console.log(`Generated: ${outputPath}`));
});

primaryStream.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

doc.pipe(primaryStream);

const primary = "#1e3a5f";
const muted = "#4b5563";
const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function sanitize(text) {
  return String(text)
    .replace(/\u2192/g, "->")
    .replace(/\u2014/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\u2713/g, "[x]")
    .replace(/\u25cb/g, "[ ]");
}

function writeText(text, x, y, options) {
  const value = sanitize(text);
  if (typeof x === "object" && x !== null) {
    doc.text(value, x);
    return;
  }
  if (y === undefined) {
    doc.text(value);
    return;
  }
  doc.text(value, x, y, options);
}

function ensureSpace(height = 80) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function sectionTitle(text) {
  ensureSpace(60);
  doc.moveDown(0.8);
  doc.fillColor(primary).font("Helvetica-Bold").fontSize(16);
  writeText(text);
  doc.moveDown(0.3);
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown(0.5);
  doc.fillColor("#111827").font("Helvetica").fontSize(11);
}

function paragraph(text) {
  ensureSpace(40);
  doc.fillColor("#111827").font("Helvetica").fontSize(11);
  writeText(text, {
    width: pageWidth,
    align: "left",
    lineGap: 3,
  });
  doc.moveDown(0.4);
}

function bullet(items) {
  for (const item of items) {
    ensureSpace(24);
    writeText(`- ${item}`, {
      width: pageWidth,
      indent: 12,
      lineGap: 2,
    });
  }
  doc.moveDown(0.4);
}

function numbered(items) {
  items.forEach((item, index) => {
    ensureSpace(24);
    writeText(`${index + 1}. ${item}`, { width: pageWidth, lineGap: 2 });
  });
  doc.moveDown(0.4);
}

function table(headers, rows) {
  const colWidth = pageWidth / headers.length;
  ensureSpace(30 + rows.length * 18);
  let x = doc.page.margins.left;
  const y = doc.y;
  doc.font("Helvetica-Bold").fontSize(10);
  headers.forEach((header) => {
    writeText(header, x, y, { width: colWidth - 8 });
    x += colWidth;
  });
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(10);
  rows.forEach((row) => {
    x = doc.page.margins.left;
    const rowY = doc.y;
    row.forEach((cell) => {
      writeText(String(cell), x, rowY, { width: colWidth - 8 });
      x += colWidth;
    });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.5);
}

doc.fillColor(primary).font("Helvetica-Bold").fontSize(28).text("SpendWise", {
  align: "center",
});
doc.moveDown(0.3);
doc.fillColor(muted).font("Helvetica").fontSize(16).text("User Guide", {
  align: "center",
});
doc.moveDown(1);
doc
  .fillColor("#111827")
  .font("Helvetica")
  .fontSize(12)
  .text(
    "Enterprise procurement platform for requests, approvals, sourcing, purchase orders, invoices, contracts, and AI-assisted workflows.",
    { align: "center", width: pageWidth - 80, lineGap: 4 },
  );
doc.moveDown(2);
doc.fillColor(muted).font("Helvetica").fontSize(10).text("Version 1.0  •  August 2026", {
  align: "center",
});

doc.addPage();

sectionTitle("1. Getting Started");
paragraph(
  "SpendWise is a multi-tenant SaaS platform. Each organisation has its own workspace with isolated data, subscription plan, and team members.",
);
paragraph("Web app: http://localhost:3000 (or your deployed URL)");
paragraph("API docs: http://localhost:3001/docs");
numbered([
  "Visit the marketing site and click Start free trial, or go directly to /register.",
  "Create an account with your name, email, password, and organisation name.",
  "Verify your email if prompted, then sign in at /login.",
  "Complete the onboarding wizard at Dashboard → Onboarding (organisation admins).",
  "Invite team members from Dashboard → Organization → Invitations.",
]);

sectionTitle("2. User Roles");
paragraph("Navigation and permissions depend on your role within the organisation:");
table(
  ["Role", "Typical access"],
  [
    ["Admin", "Full access, billing, organisation settings, member management"],
    ["Procurement Manager", "Procurement, RFQs, bids, vendors, POs, analytics"],
    ["Finance", "Approvals, invoices, contracts, analytics, bids"],
    ["Department Head", "Submit requests, approve at department level, RFQs"],
    ["User", "Create procurement requests, goods receipts, contracts (read)"],
  ],
);

sectionTitle("3. Dashboard");
paragraph(
  "The dashboard shows KPIs, recent activity, quick actions, and notifications. Use the left sidebar to navigate. Your menu only shows modules your role can access.",
);
bullet([
  "Dashboard — overview and quick links",
  "Procurement — create and track purchase requests",
  "Approvals — review pending approval steps",
  "Analytics — spend and operational metrics (Professional plan+)",
  "AI Assistant — chat, spend analysis, contract summaries (Professional plan+)",
]);

sectionTitle("4. Procurement Workflow");
paragraph("End-to-end procure-to-pay flow:");
numbered([
  "Create a procurement request (Dashboard → Procurement → New). Add title, description, budget, items, and delivery date.",
  "Submit the request for approval. An approval workflow is created automatically.",
  "Approvers act in Dashboard → Approvals (approve or reject with comments).",
  "After approval, create RFQs and invite vendors (Starter plan+).",
  "Collect and evaluate bids, then award a vendor.",
  "Issue a purchase order and send it to the vendor.",
  "Record goods receipt when items arrive.",
  "Match and process vendor invoices.",
  "Manage contracts for ongoing supplier agreements.",
]);

sectionTitle("5. Key Modules");
bullet([
  "Vendors — maintain supplier records, contacts, and risk information.",
  "RFQs — publish requests for quotation and track vendor responses.",
  "Bids — compare vendor proposals and run evaluations.",
  "Purchase Orders — issue, edit, and track PO status.",
  "Goods Receipts — confirm delivery and reject damaged shipments.",
  "Invoices — three-way matching and payment tracking.",
  "Contracts — lifecycle management with versions and documents.",
]);

sectionTitle("6. Organization & Team");
paragraph("Organisation admins manage the tenant workspace:");
bullet([
  "Organization → Profile — update organisation name and details.",
  "Organization → Members — view team and update roles.",
  "Organization → Invitations — invite users by email with assigned roles.",
  "Organization → Roles — reference for role capabilities.",
  "Organization → Settings — organisation preferences.",
  "Settings — personal profile, security, notifications, audit logs.",
]);

sectionTitle("7. Billing & Subscription");
paragraph(
  "Organisation admins manage subscription at Dashboard → Billing. Every new organisation starts with a 14-day trial.",
);
table(
  ["Plan", "Highlights"],
  [
    ["Free", "3 users, 25 requests, core procurement"],
    ["Starter", "RFQs, bids, purchase orders - NGN 75,000/mo"],
    ["Professional", "Full P2P, AI, analytics, vendor portal - NGN 225,000/mo"],
    ["Enterprise", "Unlimited scale, SSO, API access — contact sales"],
  ],
);
bullet([
  "View current plan, trial end date, and usage meters on the Billing page.",
  "Upgrade via Paystack checkout (requires Paystack configuration).",
  "Cancel subscriptions from Dashboard -> Billing.",
]);

sectionTitle("8. Support & Help");
bullet([
  "Dashboard → Support — open support tickets for billing or product help.",
  "Marketing site → Contact — reach sales for Enterprise plans.",
  "Documentation site — http://localhost:3002 (SaaS, billing, deployment guides).",
  "In-app onboarding wizard — step-by-step setup for new tenants.",
]);

sectionTitle("9. Vendor Portal");
paragraph(
  "Vendors access a separate portal at /vendor/login using credentials linked to their vendor record.",
);
bullet([
  "View invited RFQs and submit bids.",
  "Acknowledge purchase orders.",
  "Submit and track invoices.",
  "View contracts and use the vendor AI assistant.",
]);

sectionTitle("10. Mobile App");
paragraph(
  "The Expo mobile app provides dashboard, approvals, purchase orders, invoices, contracts, vendor portal, and AI chat with offline sync.",
);
bullet([
  "Set EXPO_PUBLIC_API_URL to your API base URL.",
  "Run: pnpm --filter mobile start",
  "Sign in with the same credentials as the web app.",
]);

sectionTitle("11. Demo Accounts (after seed)");
table(
  ["Role", "Email", "Password"],
  [
    ["Admin", "admin@demo.com", "Password123!"],
    ["Finance", "finance@demo.com", "Password123!"],
    ["Procurement Manager", "procurement@demo.com", "Password123!"],
    ["Department Head", "depthead@demo.com", "Password123!"],
    ["User", "vendor@demo.com", "Password123!"],
  ],
);

sectionTitle("12. Tips & Best Practices");
bullet([
  "Use clear procurement titles and justifications to speed up approvals.",
  "Keep vendor records up to date before publishing RFQs.",
  "Check usage limits on the Billing page before inviting large teams.",
  "Enable email verification and strong passwords for production.",
  "Platform admins can access Dashboard → Admin for cross-tenant metrics.",
]);

doc.moveDown(1);
doc.fillColor(muted).font("Helvetica-Oblique").fontSize(9).text(
  "For technical deployment and API reference, see docs/SAAS_PRODUCTION.md and docs/AWS_DEPLOYMENT.md in the repository.",
  { width: pageWidth, align: "center" },
);

doc.end();
