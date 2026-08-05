-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'WITHDRAWN', 'DISQUALIFIED');

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "bidNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "deliveryPeriod" TEXT,
    "paymentTerms" TEXT,
    "warrantyPeriod" TEXT,
    "notes" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidItem" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "totalPrice" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BidItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidAttachment" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BidAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bid_bidNumber_key" ON "Bid"("bidNumber");

-- CreateIndex
CREATE INDEX "Bid_rfqId_idx" ON "Bid"("rfqId");

-- CreateIndex
CREATE INDEX "Bid_vendorId_idx" ON "Bid"("vendorId");

-- CreateIndex
CREATE INDEX "Bid_submittedById_idx" ON "Bid"("submittedById");

-- CreateIndex
CREATE INDEX "Bid_status_idx" ON "Bid"("status");

-- CreateIndex
CREATE INDEX "BidItem_bidId_idx" ON "BidItem"("bidId");

-- CreateIndex
CREATE INDEX "BidAttachment_bidId_idx" ON "BidAttachment"("bidId");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidItem" ADD CONSTRAINT "BidItem_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidAttachment" ADD CONSTRAINT "BidAttachment_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
