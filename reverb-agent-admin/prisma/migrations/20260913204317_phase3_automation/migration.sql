-- AlterTable
ALTER TABLE "SyncRun" ADD COLUMN     "actionsPlanned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "actionsSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "escalationsCreated" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SyncedListing" ADD COLUMN     "offersEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ReverbActionAudit" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "offerId" TEXT,
    "listingId" TEXT,
    "decision" TEXT,
    "requestSummary" TEXT,
    "responseSummary" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReverbActionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReverbActionAudit_conversationId_messageId_idx" ON "ReverbActionAudit"("conversationId", "messageId");

-- CreateIndex
CREATE INDEX "ReverbActionAudit_offerId_decision_idx" ON "ReverbActionAudit"("offerId", "decision");

-- CreateIndex
CREATE INDEX "ReverbActionAudit_createdAt_idx" ON "ReverbActionAudit"("createdAt");
