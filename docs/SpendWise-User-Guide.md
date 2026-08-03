# SpendWise User Guide

**Version 1.0 · August 2026**

Enterprise procurement platform for requests, approvals, sourcing, purchase orders, invoices, contracts, and AI-assisted workflows.

> **PDF download (for sharing or printing):** [http://localhost:3000/download/user-guide](http://localhost:3000/download/user-guide)  
> Open this `.md` file in Cursor for a readable in-editor guide (Markdown preview: `Cmd+Shift+V`).

---

## 1. Getting Started

SpendWise is a multi-tenant SaaS platform. Each organisation has its own workspace with isolated data, subscription plan, and team members.

| Resource | URL |
|----------|-----|
| Web app | http://localhost:3000 |
| API docs | http://localhost:3001/docs |

### First steps

1. Visit the marketing site and click **Start free trial**, or go to `/register`.
2. Create an account with your name, email, password, and organisation name.
3. Verify your email if prompted, then sign in at `/login`.
4. Complete the onboarding wizard at **Dashboard → Onboarding** (organisation admins).
5. Invite team members from **Dashboard → Organization → Invitations**.

---

## 2. User Roles

Navigation and permissions depend on your role within the organisation.

| Role | Typical access |
|------|----------------|
| **Admin** | Full access, billing, organisation settings, member management |
| **Procurement Manager** | Procurement, RFQs, bids, vendors, POs, analytics |
| **Finance** | Approvals, invoices, contracts, analytics, bids |
| **Department Head** | Submit requests, approve at department level, RFQs |
| **User** | Create procurement requests, goods receipts, contracts (read) |

---

## 3. Dashboard

The dashboard shows KPIs, recent activity, quick actions, and notifications. Use the left sidebar to navigate. Your menu only shows modules your role can access.

- **Dashboard** — overview and quick links
- **Procurement** — create and track purchase requests
- **Approvals** — review pending approval steps
- **Analytics** — spend and operational metrics (Professional plan+)
- **AI Assistant** — chat, spend analysis, contract summaries (Professional plan+)

---

## 4. Procurement Workflow

End-to-end procure-to-pay flow:

1. Create a procurement request (**Dashboard → Procurement → New**). Add title, description, budget, items, and delivery date.
2. Submit the request for approval. An approval workflow is created automatically.
3. Approvers act in **Dashboard → Approvals** (approve or reject with comments).
4. After approval, create RFQs and invite vendors (Starter plan+).
5. Collect and evaluate bids, then award a vendor.
6. Issue a purchase order and send it to the vendor.
7. Record goods receipt when items arrive.
8. Match and process vendor invoices.
9. Manage contracts for ongoing supplier agreements.

---

## 5. Key Modules

- **Vendors** — maintain supplier records, contacts, and risk information
- **RFQs** — publish requests for quotation and track vendor responses
- **Bids** — compare vendor proposals and run evaluations
- **Purchase Orders** — issue, edit, and track PO status
- **Goods Receipts** — confirm delivery and reject damaged shipments
- **Invoices** — three-way matching and payment tracking
- **Contracts** — lifecycle management with versions and documents

---

## 6. Organization & Team

Organisation admins manage the tenant workspace:

- **Organization → Profile** — update organisation name and details
- **Organization → Members** — view team and update roles
- **Organization → Invitations** — invite users by email with assigned roles
- **Organization → Roles** — reference for role capabilities
- **Organization → Settings** — organisation preferences
- **Settings** — personal profile, security, notifications, audit logs

---

## 7. Billing & Subscription

Organisation admins manage subscription at **Dashboard → Billing**. Every new organisation starts with a **14-day trial**.

| Plan | Highlights |
|------|------------|
| **Free** | 3 users, 25 requests, core procurement |
| **Starter** | RFQs, bids, purchase orders — ₦75,000/mo |
| **Professional** | Full P2P, AI, analytics, vendor portal — ₦225,000/mo |
| **Enterprise** | Unlimited scale, SSO, API access — contact sales |

- View current plan, trial end date, and usage meters on the Billing page.
- Upgrade via Paystack checkout (requires Paystack configuration).
- Cancel subscriptions from **Dashboard → Billing** (Paystack subscription disable).

---

## 8. Support & Help

- **Dashboard → Support** — open support tickets for billing or product help
- **Marketing site → Contact** — reach sales for Enterprise plans
- **Documentation site** — http://localhost:3002 (SaaS, billing, deployment guides)
- **In-app onboarding wizard** — step-by-step setup for new tenants

---

## 9. Vendor Portal

Vendors access a separate portal at `/vendor/login` using credentials linked to their vendor record.

- View invited RFQs and submit bids
- Acknowledge purchase orders
- Submit and track invoices
- View contracts and use the vendor AI assistant

---

## 10. Mobile App

The Expo mobile app provides dashboard, approvals, purchase orders, invoices, contracts, vendor portal, and AI chat with offline sync.

- Set `EXPO_PUBLIC_API_URL` to your API base URL
- Run: `pnpm --filter mobile start`
- Sign in with the same credentials as the web app

---

## 11. Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Password123! |
| Finance | finance@demo.com | Password123! |
| Procurement Manager | procurement@demo.com | Password123! |
| Department Head | depthead@demo.com | Password123! |
| User | vendor@demo.com | Password123! |

---

## 12. Tips & Best Practices

- Use clear procurement titles and justifications to speed up approvals.
- Keep vendor records up to date before publishing RFQs.
- Check usage limits on the Billing page before inviting large teams.
- Enable email verification and strong passwords for production.
- Platform admins can access **Dashboard → Admin** for cross-tenant metrics.

---

## Technical reference

For deployment and API details, see:

- `docs/SAAS_PRODUCTION.md`
- `docs/AWS_DEPLOYMENT.md`
