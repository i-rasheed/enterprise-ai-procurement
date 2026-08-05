-- CreateTable
CREATE TABLE "PendingOrganisationRegistration" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organisationName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingOrganisationRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingOrganisationRegistration_email_key" ON "PendingOrganisationRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PendingOrganisationRegistration_slug_key" ON "PendingOrganisationRegistration"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PendingOrganisationRegistration_tokenHash_key" ON "PendingOrganisationRegistration"("tokenHash");

-- CreateIndex
CREATE INDEX "PendingOrganisationRegistration_expiresAt_idx" ON "PendingOrganisationRegistration"("expiresAt");
