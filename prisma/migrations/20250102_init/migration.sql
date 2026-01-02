-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL', 'PUBLIC', 'HMO', 'HOTEL', 'HOSTEL', 'GUEST_HOUSE', 'EDUCATION', 'CHILDCARE', 'HEALTHCARE', 'CARE_FACILITY', 'TRANSPORT', 'SPECIALITY_ACCOMMODATION', 'ENTERTAINMENT', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "DoorType" AS ENUM ('FLAT_ENTRANCE', 'COMMUNAL_STAIRWAY', 'COMMUNAL_CORRIDOR', 'COMMUNAL_LOBBY', 'PLANT_ROOM', 'SERVICE_RISER', 'RISER_CUPBOARD', 'METER_CUPBOARD', 'KITCHEN', 'HALLWAY', 'DINING_AREA', 'OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('THREE_MONTH', 'TWELVE_MONTH', 'AD_HOC');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REQUIRES_ACTION');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'FAIL', 'REQUIRES_ATTENTION');

-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DoorConstruction" AS ENUM ('STEEL', 'WOOD', 'GLASS');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DefectStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_PARTS', 'REPAIR_COMPLETED', 'REINSPECTION_PASSED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DefectSeverity" AS ENUM ('CRITICAL', 'MAJOR', 'MINOR');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#dc2626',
    "secondaryColor" TEXT NOT NULL DEFAULT '#991b1b',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "textColor" TEXT NOT NULL DEFAULT '#1f2937',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "brandingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "customCss" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "websiteUrl" TEXT,
    "address" TEXT,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'trial',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "maxDoors" INTEGER NOT NULL DEFAULT 1000,
    "maxBuildings" INTEGER NOT NULL DEFAULT 50,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "maxInspectors" INTEGER NOT NULL DEFAULT 5,
    "billingModel" TEXT NOT NULL DEFAULT 'PER_DOOR',
    "clientType" TEXT NOT NULL DEFAULT 'HOUSING_ASSOCIATION',
    "pricePerDoor" DOUBLE PRECISION NOT NULL DEFAULT 12.00,
    "pricePerInspector" DOUBLE PRECISION NOT NULL DEFAULT 65.00,
    "pricePerBuilding" DOUBLE PRECISION NOT NULL DEFAULT 500.00,
    "billingCycle" TEXT NOT NULL DEFAULT 'ANNUAL',
    "nextBillingDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'INSPECTOR',
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "organization" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "buildingType" "BuildingType" NOT NULL,
    "numberOfStoreys" INTEGER,
    "topStoreyHeight" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "tenantId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fire_doors" (
    "id" TEXT NOT NULL,
    "doorNumber" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "doorType" "DoorType" NOT NULL,
    "fireRating" TEXT NOT NULL,
    "manufacturer" TEXT,
    "installationDate" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "hasIntumescentStrips" BOOLEAN NOT NULL DEFAULT true,
    "hasSmokeSeal" BOOLEAN NOT NULL DEFAULT false,
    "hasLetterbox" BOOLEAN NOT NULL DEFAULT false,
    "hasAirTransferGrille" BOOLEAN NOT NULL DEFAULT false,
    "hasGlazing" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeUrl" TEXT,
    "nextInspectionDate" TIMESTAMP(3),
    "certificationUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fire_doors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fireDoorId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectionType" "InspectionType" NOT NULL,
    "nextInspectionDate" TIMESTAMP(3),
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "overallResult" "InspectionResult",
    "doorConstruction" "DoorConstruction",
    "certificationProvided" BOOLEAN,
    "damageOrDefects" BOOLEAN NOT NULL DEFAULT false,
    "damageDescription" TEXT,
    "doorLeafFrameOk" BOOLEAN NOT NULL DEFAULT false,
    "doorClosesCompletely" BOOLEAN NOT NULL DEFAULT false,
    "doorClosesFromAnyAngle" BOOLEAN NOT NULL DEFAULT false,
    "doorOpensInDirectionOfTravel" BOOLEAN NOT NULL DEFAULT false,
    "frameGapsAcceptable" BOOLEAN NOT NULL DEFAULT false,
    "maxGapSize" DOUBLE PRECISION,
    "hingesSecure" BOOLEAN NOT NULL DEFAULT false,
    "hingesCEMarked" BOOLEAN,
    "hingesGoodCondition" BOOLEAN,
    "screwsInPlaceAndSecure" BOOLEAN,
    "hingeCount" INTEGER,
    "minimumHingesPresent" BOOLEAN,
    "intumescentStripsIntact" BOOLEAN,
    "doorSignageCorrect" BOOLEAN,
    "doorSignageComments" TEXT,
    "smokeSealsIntact" BOOLEAN,
    "letterboxClosesProperly" BOOLEAN,
    "glazingIntact" BOOLEAN,
    "airTransferGrilleIntact" BOOLEAN,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionDescription" TEXT,
    "priority" "ActionPriority",
    "accessDenied" BOOLEAN NOT NULL DEFAULT false,
    "accessDeniedReason" TEXT,
    "inspectorNotes" TEXT,
    "photoPaths" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building_safety_profiles" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "riskSummary" TEXT,
    "inspectionPolicy" TEXT,
    "complianceTrend" TEXT,
    "regulatorStatus" TEXT,
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "building_safety_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_records" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trail" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeSnapshot" TEXT,
    "afterSnapshot" TEXT,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "items" TEXT,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "doorCount" INTEGER NOT NULL DEFAULT 0,
    "buildingCount" INTEGER NOT NULL DEFAULT 0,
    "inspectorCount" INTEGER NOT NULL DEFAULT 0,
    "inspectionCount" INTEGER NOT NULL DEFAULT 0,
    "calculatedAmount" DOUBLE PRECISION NOT NULL,
    "usageDetails" TEXT,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "specialties" TEXT,
    "averageCompletionDays" DOUBLE PRECISION,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defects" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "doorId" TEXT NOT NULL,
    "severity" "DefectSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedContractorId" TEXT,
    "assignedDate" TIMESTAMP(3),
    "targetCompletionDate" TIMESTAMP(3),
    "status" "DefectStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "repairCompletedDate" TIMESTAMP(3),
    "proofOfFixUrls" TEXT,
    "repairNotes" TEXT,
    "repairCost" DOUBLE PRECISION,
    "reinspectionRequired" BOOLEAN NOT NULL DEFAULT true,
    "reinspectionId" TEXT,
    "reinspectedDate" TIMESTAMP(3),
    "closedDate" TIMESTAMP(3),
    "closedById" TEXT,
    "closureNotes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "buildings_tenantId_idx" ON "buildings"("tenantId");

-- CreateIndex
CREATE INDEX "fire_doors_tenantId_idx" ON "fire_doors"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "fire_doors_buildingId_doorNumber_key" ON "fire_doors"("buildingId", "doorNumber");

-- CreateIndex
CREATE INDEX "inspections_tenantId_idx" ON "inspections"("tenantId");

-- CreateIndex
CREATE INDEX "inspections_fireDoorId_idx" ON "inspections"("fireDoorId");

-- CreateIndex
CREATE INDEX "inspections_inspectorId_idx" ON "inspections"("inspectorId");

-- CreateIndex
CREATE INDEX "inspections_inspectionDate_idx" ON "inspections"("inspectionDate");

-- CreateIndex
CREATE UNIQUE INDEX "building_safety_profiles_buildingId_key" ON "building_safety_profiles"("buildingId");

-- CreateIndex
CREATE INDEX "evidence_records_entityType_entityId_idx" ON "evidence_records"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "evidence_records_tenantId_idx" ON "evidence_records"("tenantId");

-- CreateIndex
CREATE INDEX "audit_trail_entityType_entityId_idx" ON "audit_trail"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_trail_tenantId_idx" ON "audit_trail"("tenantId");

-- CreateIndex
CREATE INDEX "audit_trail_createdAt_idx" ON "audit_trail"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "usage_records_tenantId_idx" ON "usage_records"("tenantId");

-- CreateIndex
CREATE INDEX "usage_records_period_idx" ON "usage_records"("period");

-- CreateIndex
CREATE INDEX "usage_records_invoiced_idx" ON "usage_records"("invoiced");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_tenantId_period_key" ON "usage_records"("tenantId", "period");

-- CreateIndex
CREATE INDEX "contractors_tenantId_idx" ON "contractors"("tenantId");

-- CreateIndex
CREATE INDEX "contractors_isActive_idx" ON "contractors"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "defects_ticketNumber_key" ON "defects"("ticketNumber");

-- CreateIndex
CREATE INDEX "defects_status_idx" ON "defects"("status");

-- CreateIndex
CREATE INDEX "defects_severity_idx" ON "defects"("severity");

-- CreateIndex
CREATE INDEX "defects_priority_idx" ON "defects"("priority");

-- CreateIndex
CREATE INDEX "defects_doorId_idx" ON "defects"("doorId");

-- CreateIndex
CREATE INDEX "defects_inspectionId_idx" ON "defects"("inspectionId");

-- CreateIndex
CREATE INDEX "defects_tenantId_idx" ON "defects"("tenantId");

-- CreateIndex
CREATE INDEX "defects_assignedContractorId_idx" ON "defects"("assignedContractorId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fire_doors" ADD CONSTRAINT "fire_doors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fire_doors" ADD CONSTRAINT "fire_doors_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_fireDoorId_fkey" FOREIGN KEY ("fireDoorId") REFERENCES "fire_doors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building_safety_profiles" ADD CONSTRAINT "building_safety_profiles_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_records" ADD CONSTRAINT "evidence_records_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_records" ADD CONSTRAINT "evidence_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defects" ADD CONSTRAINT "defects_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defects" ADD CONSTRAINT "defects_doorId_fkey" FOREIGN KEY ("doorId") REFERENCES "fire_doors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defects" ADD CONSTRAINT "defects_assignedContractorId_fkey" FOREIGN KEY ("assignedContractorId") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defects" ADD CONSTRAINT "defects_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

