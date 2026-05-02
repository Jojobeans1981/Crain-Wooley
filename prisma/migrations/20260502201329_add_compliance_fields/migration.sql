-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "practiceArea" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "disqualifyReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "stripeSessionId" TEXT,
    "paidAt" DATETIME,
    "consultAt" DATETIME,
    "calEventId" TEXT,
    "hired" BOOLEAN NOT NULL DEFAULT false,
    "hiredAt" DATETIME,
    "nurturePaused" BOOLEAN NOT NULL DEFAULT false,
    "clioContactId" TEXT,
    "clioMatterId" TEXT,
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "optedOutAt" DATETIME
);
INSERT INTO "new_Lead" ("calEventId", "caseType", "clioContactId", "clioMatterId", "consultAt", "createdAt", "description", "disqualifyReason", "email", "firstName", "hired", "hiredAt", "id", "lastName", "nurturePaused", "paidAt", "paymentStatus", "phone", "practiceArea", "qualified", "status", "stripeSessionId", "updatedAt", "urgency") SELECT "calEventId", "caseType", "clioContactId", "clioMatterId", "consultAt", "createdAt", "description", "disqualifyReason", "email", "firstName", "hired", "hiredAt", "id", "lastName", "nurturePaused", "paidAt", "paymentStatus", "phone", "practiceArea", "qualified", "status", "stripeSessionId", "updatedAt", "urgency" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
