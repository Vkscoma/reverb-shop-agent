CREATE TABLE "AutomationSetting" (
    "id" TEXT NOT NULL,
    "offerAutoRespond" BOOLEAN NOT NULL DEFAULT false,
    "messageAutoRespond" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationSetting_pkey" PRIMARY KEY ("id")
);
