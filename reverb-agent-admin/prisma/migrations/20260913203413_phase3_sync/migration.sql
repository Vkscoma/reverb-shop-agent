-- CreateTable
CREATE TABLE "SyncedListing" (
    "id" TEXT NOT NULL,
    "reverbId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReverbConversation" (
    "id" TEXT NOT NULL,
    "reverbId" TEXT NOT NULL,
    "listingId" TEXT,
    "unread" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'unprocessed',
    "latestMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReverbConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReverbMessage" (
    "id" TEXT NOT NULL,
    "reverbId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReverbMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReverbOffer" (
    "id" TEXT NOT NULL,
    "reverbId" TEXT NOT NULL,
    "listingId" TEXT,
    "amount" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReverbOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "listingsCount" INTEGER NOT NULL DEFAULT 0,
    "conversationsCount" INTEGER NOT NULL DEFAULT 0,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "offersCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncedListing_reverbId_key" ON "SyncedListing"("reverbId");

-- CreateIndex
CREATE INDEX "SyncedListing_status_idx" ON "SyncedListing"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReverbConversation_reverbId_key" ON "ReverbConversation"("reverbId");

-- CreateIndex
CREATE INDEX "ReverbConversation_status_idx" ON "ReverbConversation"("status");

-- CreateIndex
CREATE INDEX "ReverbConversation_unread_idx" ON "ReverbConversation"("unread");

-- CreateIndex
CREATE UNIQUE INDEX "ReverbMessage_reverbId_key" ON "ReverbMessage"("reverbId");

-- CreateIndex
CREATE INDEX "ReverbMessage_conversationId_idx" ON "ReverbMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ReverbMessage_sentAt_idx" ON "ReverbMessage"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReverbOffer_reverbId_key" ON "ReverbOffer"("reverbId");

-- CreateIndex
CREATE INDEX "ReverbOffer_listingId_idx" ON "ReverbOffer"("listingId");

-- CreateIndex
CREATE INDEX "ReverbOffer_status_idx" ON "ReverbOffer"("status");

-- CreateIndex
CREATE INDEX "SyncRun_startedAt_idx" ON "SyncRun"("startedAt");

-- CreateIndex
CREATE INDEX "SyncRun_status_idx" ON "SyncRun"("status");

-- AddForeignKey
ALTER TABLE "ReverbMessage" ADD CONSTRAINT "ReverbMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ReverbConversation"("reverbId") ON DELETE CASCADE ON UPDATE CASCADE;
