-- CreateEnum
CREATE TYPE "EmbeddingEntityType" AS ENUM ('CONTRACT', 'RFQ', 'PURCHASE_ORDER', 'INVOICE', 'PROCUREMENT_REQUEST', 'BID');

-- CreateTable
CREATE TABLE "AiPromptLog" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiPromptLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddingRecord" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "entityType" "EmbeddingEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmbeddingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiPromptLog_organisationId_idx" ON "AiPromptLog"("organisationId");

-- CreateIndex
CREATE INDEX "AiPromptLog_userId_idx" ON "AiPromptLog"("userId");

-- CreateIndex
CREATE INDEX "AiPromptLog_feature_idx" ON "AiPromptLog"("feature");

-- CreateIndex
CREATE INDEX "AiPromptLog_createdAt_idx" ON "AiPromptLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmbeddingRecord_organisationId_idx" ON "EmbeddingRecord"("organisationId");

-- CreateIndex
CREATE INDEX "EmbeddingRecord_entityType_idx" ON "EmbeddingRecord"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddingRecord_entityType_entityId_key" ON "EmbeddingRecord"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "AiPromptLog" ADD CONSTRAINT "AiPromptLog_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiPromptLog" ADD CONSTRAINT "AiPromptLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddingRecord" ADD CONSTRAINT "EmbeddingRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
