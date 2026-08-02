import { apiClient } from "@/lib/api/client";

export const saasRepository = {
  getBillingOverview() {
    return apiClient.get("/billing/overview").then((r) => r.data.data ?? r.data);
  },
  getUsage() {
    return apiClient.get("/billing/usage").then((r) => r.data.data ?? r.data);
  },
  createCheckout(plan: string) {
    return apiClient
      .post("/billing/checkout", { plan })
      .then((r) => r.data.data ?? r.data);
  },
  createPortalSession() {
    return apiClient.post("/billing/portal").then((r) => r.data.data ?? r.data);
  },
  getFeatureFlags() {
    return apiClient.get("/feature-flags").then((r) => r.data.data ?? r.data);
  },
  getOnboardingStatus() {
    return apiClient.get("/onboarding").then((r) => r.data.data ?? r.data);
  },
  advanceOnboarding() {
    return apiClient.patch("/onboarding/advance").then((r) => r.data.data ?? r.data);
  },
  skipOnboarding() {
    return apiClient.post("/onboarding/skip").then((r) => r.data.data ?? r.data);
  },
  listSupportTickets() {
    return apiClient.get("/support/tickets").then((r) => r.data.data ?? r.data);
  },
  createSupportTicket(payload: {
    subject: string;
    message: string;
    priority?: string;
  }) {
    return apiClient
      .post("/support/tickets", payload)
      .then((r) => r.data.data ?? r.data);
  },
  getPlatformDashboard() {
    return apiClient.get("/platform/dashboard").then((r) => r.data.data ?? r.data);
  },
  listPlatformOrganisations() {
    return apiClient.get("/platform/organisations").then((r) => r.data.data ?? r.data);
  },
  listPlatformTickets() {
    return apiClient.get("/platform/support/tickets").then((r) => r.data.data ?? r.data);
  },
};
