-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "clioSyncedAt" DATETIME;

-- CreateTable
CREATE TABLE "ClioSyncJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttemptAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClioSyncJob_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClioSyncJob_idempotencyKey_key" ON "ClioSyncJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ClioSyncJob_status_nextAttemptAt_idx" ON "ClioSyncJob"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ClioSyncJob_leadId_idx" ON "ClioSyncJob"("leadId");
