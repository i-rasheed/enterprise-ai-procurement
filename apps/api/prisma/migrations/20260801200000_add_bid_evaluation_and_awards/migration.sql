-- AlterEnum
ALTER TYPE "BidStatus" ADD VALUE 'AWARDED';

-- CreateTable
CREATE TABLE "EvaluationCriteria" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidEvaluation" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "technicalScore" DOUBLE PRECISION NOT NULL,
    "commercialScore" DOUBLE PRECISION NOT NULL,
    "complianceScore" DOUBLE PRECISION NOT NULL,
    "deliveryScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BidEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "procurementRequestId" TEXT NOT NULL,
    "awardedById" TEXT NOT NULL,
    "awardReason" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluationCriteria_organisationId_idx" ON "EvaluationCriteria"("organisationId");

-- CreateIndex
CREATE INDEX "BidEvaluation_bidId_idx" ON "BidEvaluation"("bidId");

-- CreateIndex
CREATE INDEX "BidEvaluation_evaluatorId_idx" ON "BidEvaluation"("evaluatorId");

-- CreateIndex
CREATE UNIQUE INDEX "BidEvaluation_bidId_evaluatorId_key" ON "BidEvaluation"("bidId", "evaluatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Award_bidId_key" ON "Award"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "Award_procurementRequestId_key" ON "Award"("procurementRequestId");

-- CreateIndex
CREATE INDEX "Award_procurementRequestId_idx" ON "Award"("procurementRequestId");

-- CreateIndex
CREATE INDEX "Award_awardedById_idx" ON "Award"("awardedById");

-- AddForeignKey
ALTER TABLE "EvaluationCriteria" ADD CONSTRAINT "EvaluationCriteria_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidEvaluation" ADD CONSTRAINT "BidEvaluation_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidEvaluation" ADD CONSTRAINT "BidEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_procurementRequestId_fkey" FOREIGN KEY ("procurementRequestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
