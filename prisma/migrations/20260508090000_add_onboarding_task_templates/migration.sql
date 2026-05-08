CREATE TABLE "OnboardingTaskTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dueOffsetHours" INTEGER NOT NULL DEFAULT 24,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "OnboardingTaskTemplate_active_idx" ON "OnboardingTaskTemplate"("active");
CREATE INDEX "OnboardingTaskTemplate_sortOrder_idx" ON "OnboardingTaskTemplate"("sortOrder");
