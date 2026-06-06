-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PracticeArea" AS ENUM ('ESTATE_PLANNING', 'PROBATE', 'FAMILY_LAW', 'PERSONAL_INJURY', 'BUSINESS_LAW', 'CRIMINAL_DEFENSE', 'REAL_ESTATE', 'OTHER');

-- CreateEnum
CREATE TYPE "IntakeType" AS ENUM ('WILLS', 'PROBATE');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('IMMEDIATE', 'WITHIN_WEEK', 'WITHIN_MONTH', 'RESEARCHING');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'DISQUALIFIED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETE', 'SCHEDULED', 'CONSULTED', 'HIRED', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "SequenceStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ClioSyncType" AS ENUM ('UPSERT_CONTACT', 'ONBOARD_MATTER');

-- CreateEnum
CREATE TYPE "ClioSyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'VIEWER');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "practiceArea" "PracticeArea" NOT NULL,
    "caseType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "disqualifyReason" TEXT,
    "intakeType" "IntakeType",
    "zip" TEXT,
    "dob" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "preferredOffice" TEXT,
    "consultationFormat" TEXT,
    "preferredContactTime" TEXT,
    "clientLivesInTexas" BOOLEAN,
    "maritalStatus" TEXT,
    "hasChildren" BOOLEAN,
    "childrenCount" TEXT,
    "hasMinorChildren" BOOLEAN,
    "hasSpecialNeedsDependent" BOOLEAN,
    "spouseName" TEXT,
    "spouseDob" TEXT,
    "spouseEmail" TEXT,
    "spousePhone" TEXT,
    "dateOfMarriage" TEXT,
    "spouseChildrenSeparate" TEXT,
    "assetRange" TEXT,
    "debtRange" TEXT,
    "ownsRealEstate" BOOLEAN,
    "realEstateCount" TEXT,
    "ownsBusiness" BOOLEAN,
    "businessType" TEXT,
    "businessHasSuccession" BOOLEAN,
    "hasExistingPlan" BOOLEAN,
    "existingPlanYear" TEXT,
    "deedAddresses" TEXT,
    "companyInfo" TEXT,
    "ownsOutOfState" BOOLEAN,
    "topConcerns" TEXT,
    "worstCaseFear" TEXT,
    "specialGifts" TEXT,
    "remoteContingentBeneficiaries" TEXT,
    "organDonationNotes" TEXT,
    "livingWillYou" BOOLEAN,
    "livingWillSpouse" BOOLEAN,
    "receivesGovBenefits" BOOLEAN,
    "hasDivorcePayments" BOOLEAN,
    "hasMarriageContract" BOOLEAN,
    "hasFiledGiftTaxReturns" BOOLEAN,
    "hasPriorEstatePlan" BOOLEAN,
    "childrenHaveSpecialNeedsExtended" BOOLEAN,
    "childrenReceiveGovBenefits" BOOLEAN,
    "supportsAdultDependents" BOOLEAN,
    "services" TEXT,
    "decedentName" TEXT,
    "decedentDateOfDeath" TEXT,
    "decedentRelationship" TEXT,
    "decedentRelationshipOther" TEXT,
    "decedentCounty" TEXT,
    "decedentTexasResident" BOOLEAN,
    "decedentHadTrust" BOOLEAN,
    "willExists" TEXT,
    "willHasOriginal" TEXT,
    "willYear" TEXT,
    "probateCourtFiled" TEXT,
    "probateCountyFiled" TEXT,
    "probateExecutorAppointed" BOOLEAN,
    "heirDisputes" TEXT,
    "childrenDetails" JSONB,
    "realEstateProperties" JSONB,
    "primaryBeneficiaries" JSONB,
    "fiduciaries" JSONB,
    "attachments" JSONB,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "stripeSessionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "consultAt" TIMESTAMP(3),
    "calEventId" TEXT,
    "hired" BOOLEAN NOT NULL DEFAULT false,
    "hiredAt" TIMESTAMP(3),
    "nurturePaused" BOOLEAN NOT NULL DEFAULT false,
    "clioContactId" TEXT,
    "clioMatterId" TEXT,
    "clioSyncedAt" TIMESTAMP(3),
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "optedOutAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "step" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "SequenceStatus" NOT NULL DEFAULT 'PENDING',
    "template" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lockedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT,
    "type" TEXT NOT NULL,
    "actor" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "meta" JSONB,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurtureTemplate" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "channel" "Channel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NurtureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTaskTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueOffsetHours" INTEGER NOT NULL DEFAULT 24,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClioToken" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClioToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClioSyncJob" (
    "id" TEXT NOT NULL,
    "type" "ClioSyncType" NOT NULL,
    "leadId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" "ClioSyncStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClioSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_externalId_key" ON "Sequence"("externalId");

-- CreateIndex
CREATE INDEX "Sequence_leadId_idx" ON "Sequence"("leadId");

-- CreateIndex
CREATE INDEX "Sequence_scheduledAt_idx" ON "Sequence"("scheduledAt");

-- CreateIndex
CREATE INDEX "Sequence_status_idx" ON "Sequence"("status");

-- CreateIndex
CREATE INDEX "AuditEvent_leadId_idx" ON "AuditEvent"("leadId");

-- CreateIndex
CREATE INDEX "AuditEvent_type_idx" ON "AuditEvent"("type");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "NurtureTemplate_day_idx" ON "NurtureTemplate"("day");

-- CreateIndex
CREATE INDEX "NurtureTemplate_channel_idx" ON "NurtureTemplate"("channel");

-- CreateIndex
CREATE INDEX "OnboardingTaskTemplate_active_idx" ON "OnboardingTaskTemplate"("active");

-- CreateIndex
CREATE INDEX "OnboardingTaskTemplate_sortOrder_idx" ON "OnboardingTaskTemplate"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClioSyncJob_idempotencyKey_key" ON "ClioSyncJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ClioSyncJob_status_nextAttemptAt_idx" ON "ClioSyncJob"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ClioSyncJob_leadId_idx" ON "ClioSyncJob"("leadId");

-- AddForeignKey
ALTER TABLE "Sequence" ADD CONSTRAINT "Sequence_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClioSyncJob" ADD CONSTRAINT "ClioSyncJob_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

