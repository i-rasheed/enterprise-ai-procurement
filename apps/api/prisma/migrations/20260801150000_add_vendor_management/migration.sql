-- CreateEnum
CREATE TYPE "public"."VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "public"."ComplianceStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "registrationNumber" TEXT,
    "taxIdentificationNumber" TEXT,
    "category" TEXT,
    "status" "public"."VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "rating" DOUBLE PRECISION,
    "complianceStatus" "public"."ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vendor_organisationId_idx" ON "public"."Vendor"("organisationId");

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "public"."Vendor"("status");

-- CreateIndex
CREATE INDEX "Vendor_complianceStatus_idx" ON "public"."Vendor"("complianceStatus");

-- CreateIndex
CREATE INDEX "Vendor_category_idx" ON "public"."Vendor"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_organisationId_email_key" ON "public"."Vendor"("organisationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_organisationId_registrationNumber_key" ON "public"."Vendor"("organisationId", "registrationNumber");

-- AddForeignKey
ALTER TABLE "public"."Vendor" ADD CONSTRAINT "Vendor_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
