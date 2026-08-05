-- Rename Stripe billing columns to Paystack equivalents

ALTER TABLE "Organisation" RENAME COLUMN "stripeCustomerId" TO "paystackCustomerCode";
ALTER TABLE "Organisation" RENAME COLUMN "stripeSubscriptionId" TO "paystackSubscriptionCode";

ALTER INDEX "Organisation_stripeCustomerId_key" RENAME TO "Organisation_paystackCustomerCode_key";
ALTER INDEX "Organisation_stripeSubscriptionId_key" RENAME TO "Organisation_paystackSubscriptionCode_key";

ALTER TABLE "Subscription" RENAME COLUMN "stripePriceId" TO "paystackPlanCode";
ALTER TABLE "Subscription" RENAME COLUMN "stripeSubscriptionId" TO "paystackSubscriptionCode";

ALTER INDEX "Subscription_stripeSubscriptionId_key" RENAME TO "Subscription_paystackSubscriptionCode_key";
