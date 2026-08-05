-- CreateEnum
CREATE TYPE "RFQStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VendorInvitationStatus" AS ENUM ('INVITED', 'VIEWED', 'RESPONDED', 'DECLINED');

-- CreateTable
CREATE TABLE "RFQ" (
    "id" TEXT NOT NULL,
    "procurementRequestId" TEXT NOT NULL,
    "rfqNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "closingDate" TIMESTAMP(3) NOT NULL,
    "status" "RFQStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFQVendor" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "status" "VendorInvitationStatus" NOT NULL DEFAULT 'INVITED',

    CONSTRAINT "RFQVendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RFQ_rfqNumber_key" ON "RFQ"("rfqNumber");

-- CreateIndex
CREATE INDEX "RFQ_procurementRequestId_idx" ON "RFQ"("procurementRequestId");

-- CreateIndex
CREATE INDEX "RFQ_status_idx" ON "RFQ"("status");

-- CreateIndex
CREATE INDEX "RFQ_createdById_idx" ON "RFQ"("createdById");

-- CreateIndex
CREATE INDEX "RFQVendor_rfqId_idx" ON "RFQVendor"("rfqId");

-- CreateIndex
CREATE INDEX "RFQVendor_vendorId_idx" ON "RFQVendor"("vendorId");

-- CreateIndex
CREATE INDEX "RFQVendor_status_idx" ON "RFQVendor"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RFQVendor_rfqId_vendorId_key" ON "RFQVendor"("rfqId", "vendorId");

-- AddForeignKey
ALTER TABLE "RFQ" ADD CONSTRAINT "RFQ_procurementRequestId_fkey" FOREIGN KEY ("procurementRequestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFQ" ADD CONSTRAINT "RFQ_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFQVendor" ADD CONSTRAINT "RFQVendor_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFQVendor" ADD CONSTRAINT "RFQVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
