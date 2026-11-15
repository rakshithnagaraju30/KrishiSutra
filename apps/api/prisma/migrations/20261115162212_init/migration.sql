-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('S3', 'CLOUDINARY', 'GCS', 'YOUTUBE', 'EXTERNAL_URL');

-- CreateEnum
CREATE TYPE "UserFilePurpose" AS ENUM ('PROFILE_IMAGE', 'SOIL_REPORT', 'CROP_PHOTO', 'DIAGNOSIS_IMAGE', 'POST_MEDIA', 'RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "RegionType" AS ENUM ('COUNTRY', 'STATE', 'DISTRICT', 'SUB_DISTRICT', 'VILLAGE', 'AGRO_CLIMATIC_ZONE');

-- CreateEnum
CREATE TYPE "UnitDimension" AS ENUM ('AREA', 'MASS', 'VOLUME', 'LENGTH', 'TEMPERATURE', 'CONCENTRATION', 'RATIO', 'TIME', 'COUNT', 'RATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ParameterCategory" AS ENUM ('SOIL', 'NUTRIENT', 'CLIMATE', 'WATER', 'CROP');

-- CreateEnum
CREATE TYPE "QualitativeLevel" AS ENUM ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'SOURCE_CITED', 'EXPERT_VERIFIED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('ICAR_INSTITUTE', 'AGRICULTURAL_UNIVERSITY', 'KRISHI_VIGYAN_KENDRA', 'GOVERNMENT_DEPARTMENT', 'RESEARCH_PUBLICATION', 'AGRICULTURAL_EXPERT', 'INTERNAL_DEMO', 'OTHER');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('CC0', 'CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA', 'PUBLIC_DOMAIN', 'GOVERNMENT_OPEN_DATA', 'PERMISSION_GRANTED', 'OWN_CONTENT', 'EMBED_ONLY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CropLifeCycle" AS ENUM ('ANNUAL', 'BIENNIAL', 'PERENNIAL');

-- CreateEnum
CREATE TYPE "SuitabilityLevel" AS ENUM ('HIGHLY_SUITABLE', 'SUITABLE', 'MODERATELY_SUITABLE', 'NOT_SUITABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RequirementImportance" AS ENUM ('MANDATORY', 'PREFERRED', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "ProcedureVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StageDayAnchor" AS ENUM ('PROCEDURE_START', 'SOWING', 'TRANSPLANTING', 'PLANTING');

-- CreateEnum
CREATE TYPE "InstructionType" AS ENUM ('ACTION', 'OBSERVATION', 'PRECAUTION', 'TIP', 'DECISION');

-- CreateEnum
CREATE TYPE "SafetyLevel" AS ENUM ('NONE', 'CAUTION', 'WARNING', 'DANGER');

-- CreateEnum
CREATE TYPE "StageResourceType" AS ENUM ('MATERIAL', 'EQUIPMENT', 'TOOL', 'MACHINERY', 'INPUT', 'LABOUR', 'SERVICE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'ANIMATION', 'DIAGRAM', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "StageMediaPurpose" AS ENUM ('DEMONSTRATION', 'EXPLANATION', 'REFERENCE_PHOTO', 'AUDIO_NARRATION', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "TranslatableField" AS ENUM ('NAME', 'TITLE', 'DESCRIPTION', 'SHORT_DESCRIPTION', 'CONTENT', 'SAFETY_INFO', 'CONSEQUENCE', 'PREVENTION', 'CAPTION', 'TRANSCRIPT');

-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('MACHINE_DRAFT', 'DRAFT', 'IN_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "IrrigationMethod" AS ENUM ('RAINFED', 'FLOOD', 'FURROW', 'BASIN', 'DRIP', 'SPRINKLER', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LandTenure" AS ENUM ('OWNED', 'LEASED', 'SHARECROPPED', 'COMMUNITY', 'OTHER');

-- CreateEnum
CREATE TYPE "WaterAvailability" AS ENUM ('PERENNIAL', 'SEASONAL', 'UNRELIABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SoilTestSource" AS ENUM ('SOIL_HEALTH_CARD', 'GOVERNMENT_LAB', 'PRIVATE_LAB', 'KRISHI_VIGYAN_KENDRA', 'FIELD_TEST_KIT', 'OTHER');

-- CreateEnum
CREATE TYPE "WeatherProvider" AS ENUM ('OPEN_METEO', 'NASA_POWER', 'IMD', 'OTHER');

-- CreateEnum
CREATE TYPE "WeatherSnapshotType" AS ENUM ('CURRENT', 'FORECAST', 'HISTORICAL_NORMAL', 'OBSERVED');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ReasonKind" AS ENUM ('REASON', 'WARNING', 'EXCLUSION', 'MISSING_DATA');

-- CreateEnum
CREATE TYPE "CriterionResult" AS ENUM ('SUITABLE', 'CAUTION', 'UNSUITABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CultivationStatus" AS ENUM ('PLANNED', 'ACTIVE', 'HARVESTING', 'COMPLETED', 'FAILED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'SMS', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LAND_PREPARATION', 'SEED_TREATMENT', 'NURSERY', 'SOWING', 'TRANSPLANTING', 'IRRIGATION', 'FERTILIZER_APPLICATION', 'PEST_CONTROL', 'WEEDING', 'INTERCULTURE', 'PRUNING', 'HARVESTING', 'POST_HARVEST', 'OTHER');

-- CreateEnum
CREATE TYPE "ObservationType" AS ENUM ('GROWTH', 'PEST', 'DISEASE', 'NUTRIENT_DEFICIENCY', 'WEATHER_DAMAGE', 'WATER_STRESS', 'GENERAL');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PathogenType" AS ENUM ('FUNGAL', 'BACTERIAL', 'VIRAL', 'PHYTOPLASMA', 'NEMATODE', 'PHYSIOLOGICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PestType" AS ENUM ('INSECT', 'MITE', 'NEMATODE', 'RODENT', 'BIRD', 'MOLLUSC', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantPart" AS ENUM ('ROOT', 'STEM', 'LEAF', 'FLOWER', 'FRUIT', 'SEED', 'POD', 'WHOLE_PLANT');

-- CreateEnum
CREATE TYPE "TreatmentType" AS ENUM ('PREVENTIVE', 'CULTURAL', 'MECHANICAL', 'BIOLOGICAL', 'ORGANIC', 'CHEMICAL');

-- CreateEnum
CREATE TYPE "DiagnosisStatus" AS ENUM ('PENDING', 'AI_SUGGESTED', 'AWAITING_EXPERT', 'EXPERT_CONFIRMED', 'EXPERT_REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('SEED', 'PLANTING_MATERIAL', 'FERTILIZER', 'ORGANIC_MANURE', 'BIOFERTILIZER', 'INSECTICIDE', 'FUNGICIDE', 'HERBICIDE', 'BIOPESTICIDE', 'GROWTH_REGULATOR', 'SOIL_AMENDMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "QuantityBasis" AS ENUM ('PER_ACRE', 'PER_HECTARE', 'PER_SQUARE_METRE', 'PER_PLANT', 'PER_TREE', 'PER_KG_SEED', 'PER_LITRE_WATER', 'TOTAL');

-- CreateEnum
CREATE TYPE "ApplicationMethod" AS ENUM ('BASAL', 'BROADCAST', 'BAND_PLACEMENT', 'TOP_DRESSING', 'FOLIAR_SPRAY', 'FERTIGATION', 'SEED_TREATMENT', 'SOIL_DRENCH', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('SEEDS', 'FERTILIZER', 'ORGANIC_MANURE', 'PEST_CONTROL', 'LABOUR', 'IRRIGATION', 'MACHINERY', 'LAND_RENT', 'TRANSPORT', 'STORAGE', 'MARKETING', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT', 'OTHER');

-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('MANDI_TRADER', 'COMMISSION_AGENT', 'FPO', 'PROCESSOR', 'EXPORTER', 'RETAIL_CONSUMER', 'GOVERNMENT_PROCUREMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_REMINDER', 'WEATHER_ALERT', 'RECOMMENDATION_READY', 'CONTENT_UPDATE', 'DIAGNOSIS_UPDATE', 'CONSULTATION_UPDATE', 'COMMUNITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PUBLISHED', 'UNDER_REVIEW', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConsultationChannel" AS ENUM ('CHAT', 'VOICE_CALL', 'VIDEO_CALL', 'FIELD_VISIT');

-- CreateTable
CREATE TABLE "Language" (
    "id" UUID NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nativeName" VARCHAR(100) NOT NULL,
    "script" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254),
    "phone" VARCHAR(20),
    "passwordHash" VARCHAR(255),
    "profileImageFileId" UUID,
    "preferredLanguageId" UUID,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerifiedAt" TIMESTAMPTZ(6),
    "phoneVerifiedAt" TIMESTAMPTZ(6),
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedById" UUID,
    "assignedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "ExpertProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organization" VARCHAR(200),
    "designation" VARCHAR(150),
    "specialization" VARCHAR(200),
    "qualification" VARCHAR(200),
    "registrationNumber" VARCHAR(100),
    "regionId" UUID,
    "bio" TEXT,
    "verifiedAt" TIMESTAMPTZ(6),
    "verifiedById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "purpose" "UserFilePurpose" NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL,
    "storageKey" VARCHAR(512) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" BIGINT,
    "checksumSha256" CHAR(64),
    "originalFileName" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementUnit" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "dimension" "UnitDimension" NOT NULL,
    "toBaseFactor" DECIMAL(24,12),
    "isLocal" BOOLEAN NOT NULL DEFAULT false,
    "regionId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MeasurementUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "type" "RegionType" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(20),
    "agroClimaticZoneId" UUID,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilType" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "colorHex" CHAR(7),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SoilType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "typicalStartMonth" SMALLINT,
    "typicalEndMonth" SMALLINT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgronomicParameter" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" "ParameterCategory" NOT NULL,
    "defaultUnitId" UUID,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AgronomicParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterSourceType" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WaterSourceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageType" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "iconName" VARCHAR(60),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CultivationMethod" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CultivationMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropCategory" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "iconName" VARCHAR(60),
    "imageAssetId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CropCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropCategoryMapping" (
    "cropId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropCategoryMapping_pkey" PRIMARY KEY ("cropId","categoryId")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" UUID NOT NULL,
    "commonName" VARCHAR(150) NOT NULL,
    "scientificName" VARCHAR(200),
    "slug" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "lifeCycle" "CropLifeCycle",
    "heroImageAssetId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropVariety" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "code" VARCHAR(50),
    "description" TEXT,
    "releasingInstitution" VARCHAR(200),
    "releaseYear" SMALLINT,
    "isHybrid" BOOLEAN,
    "sourceId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CropVariety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRequirement" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "regionId" UUID,
    "seasonId" UUID,
    "parameterId" UUID NOT NULL,
    "minValue" DECIMAL(12,4),
    "maxValue" DECIMAL(12,4),
    "optimalMinValue" DECIMAL(12,4),
    "optimalMaxValue" DECIMAL(12,4),
    "unitId" UUID,
    "level" "QualitativeLevel",
    "importance" "RequirementImportance" NOT NULL DEFAULT 'PREFERRED',
    "notes" TEXT,
    "sourceId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropSeasonMapping" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "seasonId" UUID NOT NULL,
    "regionId" UUID,
    "sowingStartMonth" SMALLINT,
    "sowingEndMonth" SMALLINT,
    "notes" TEXT,
    "sourceId" UUID,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropSeasonMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropSoilSuitability" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "soilTypeId" UUID NOT NULL,
    "suitability" "SuitabilityLevel" NOT NULL,
    "notes" TEXT,
    "sourceId" UUID,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropSoilSuitability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRegionSuitability" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "regionId" UUID NOT NULL,
    "suitability" "SuitabilityLevel" NOT NULL,
    "notes" TEXT,
    "sourceId" UUID,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropRegionSuitability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropEconomics" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "regionId" UUID,
    "seasonId" UUID,
    "referenceYear" SMALLINT NOT NULL,
    "areaUnitId" UUID NOT NULL,
    "costOfCultivationMin" DECIMAL(14,2),
    "costOfCultivationMax" DECIMAL(14,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "yieldMin" DECIMAL(14,3),
    "yieldMax" DECIMAL(14,3),
    "yieldUnitId" UUID,
    "notes" TEXT,
    "sourceId" UUID NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropEconomics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropMedia" (
    "cropId" UUID NOT NULL,
    "mediaAssetId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,
    "caption" VARCHAR(300),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropMedia_pkey" PRIMARY KEY ("cropId","mediaAssetId")
);

-- CreateTable
CREATE TABLE "GrowingProcedure" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "regionId" UUID,
    "seasonId" UUID,
    "cultivationMethodId" UUID,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "GrowingProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureVersion" (
    "id" UUID NOT NULL,
    "procedureId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "ProcedureVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "changeSummary" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceId" UUID,
    "createdById" UUID,
    "approvedById" UUID,
    "submittedAt" TIMESTAMPTZ(6),
    "approvedAt" TIMESTAMPTZ(6),
    "publishedAt" TIMESTAMPTZ(6),
    "supersededAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProcedureVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowingStage" (
    "id" UUID NOT NULL,
    "procedureVersionId" UUID NOT NULL,
    "procedureId" UUID NOT NULL,
    "stageTypeId" UUID,
    "sequence" SMALLINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "startDay" SMALLINT,
    "endDay" SMALLINT,
    "dayAnchor" "StageDayAnchor" NOT NULL DEFAULT 'SOWING',
    "isContinuous" BOOLEAN NOT NULL DEFAULT false,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "GrowingStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageInstruction" (
    "id" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "instructionType" "InstructionType" NOT NULL DEFAULT 'ACTION',
    "durationValue" DECIMAL(8,2),
    "durationUnitId" UUID,
    "safetyLevel" "SafetyLevel" NOT NULL DEFAULT 'NONE',
    "safetyInfo" TEXT,
    "sourceId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StageInstruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageResource" (
    "id" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "instructionId" UUID,
    "resourceType" "StageResourceType" NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "farmInputId" UUID,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "sequence" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StageResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageCommonMistake" (
    "id" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "consequence" TEXT,
    "prevention" TEXT,
    "sourceId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StageCommonMistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSource" (
    "id" UUID NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "organization" VARCHAR(200),
    "authors" VARCHAR(300),
    "publicationYear" SMALLINT,
    "url" VARCHAR(2048),
    "identifier" VARCHAR(100),
    "regionId" UUID,
    "licenseType" "LicenseType" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "storageProvider" "StorageProvider" NOT NULL,
    "storageKey" VARCHAR(512),
    "url" VARCHAR(2048) NOT NULL,
    "thumbnailUrl" VARCHAR(2048),
    "mimeType" VARCHAR(100),
    "fileSizeBytes" BIGINT,
    "durationSeconds" INTEGER,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "languageId" UUID,
    "sourceId" UUID,
    "licenseType" "LicenseType" NOT NULL DEFAULT 'UNKNOWN',
    "licenseDetails" TEXT,
    "attributionText" VARCHAR(500),
    "permissionReference" VARCHAR(300),
    "checksumSha256" CHAR(64),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "uploadedById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageMedia" (
    "id" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "mediaAssetId" UUID NOT NULL,
    "instructionId" UUID,
    "purpose" "StageMediaPurpose" NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "caption" VARCHAR(300),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" UUID NOT NULL,
    "reviewerId" UUID,
    "decision" "ReviewDecision" NOT NULL,
    "comments" TEXT,
    "reviewedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procedureVersionId" UUID,
    "mediaAssetId" UUID,
    "cropRequirementId" UUID,
    "cropVarietyId" UUID,
    "cropEconomicsId" UUID,
    "diseaseTreatmentId" UUID,
    "inputRecommendationId" UUID,
    "translationId" UUID,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "field" "TranslatableField" NOT NULL,
    "value" TEXT NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "cropCategoryId" UUID,
    "cropId" UUID,
    "cropVarietyId" UUID,
    "growingProcedureId" UUID,
    "growingStageId" UUID,
    "stageInstructionId" UUID,
    "stageResourceId" UUID,
    "stageCommonMistakeId" UUID,
    "mediaAssetId" UUID,
    "soilTypeId" UUID,
    "seasonId" UUID,
    "regionId" UUID,
    "agronomicParameterId" UUID,
    "waterSourceTypeId" UUID,
    "stageTypeId" UUID,
    "cultivationMethodId" UUID,
    "cropDiseaseId" UUID,
    "cropPestId" UUID,
    "diseaseSymptomId" UUID,
    "diseaseTreatmentId" UUID,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "regionId" UUID,
    "state" VARCHAR(100),
    "district" VARCHAR(100),
    "taluk" VARCHAR(100),
    "village" VARCHAR(150),
    "addressLine" VARCHAR(300),
    "pincode" VARCHAR(10),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "totalArea" DECIMAL(12,4),
    "totalAreaUnitId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmPlot" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "surveyNumber" VARCHAR(50),
    "area" DECIMAL(12,4) NOT NULL,
    "areaUnitId" UUID NOT NULL,
    "soilTypeId" UUID,
    "irrigationMethod" "IrrigationMethod",
    "landTenure" "LandTenure",
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "FarmPlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterSource" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "waterSourceTypeId" UUID NOT NULL,
    "name" VARCHAR(150),
    "availability" "WaterAvailability" NOT NULL DEFAULT 'UNKNOWN',
    "availableMonths" SMALLINT[],
    "estimatedYield" DECIMAL(12,3),
    "yieldUnitId" UUID,
    "depthMetres" DECIMAL(8,2),
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "WaterSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotWaterSource" (
    "plotId" UUID NOT NULL,
    "waterSourceId" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlotWaterSource_pkey" PRIMARY KEY ("plotId","waterSourceId")
);

-- CreateTable
CREATE TABLE "SoilTest" (
    "id" UUID NOT NULL,
    "plotId" UUID NOT NULL,
    "testDate" DATE NOT NULL,
    "source" "SoilTestSource" NOT NULL DEFAULT 'OTHER',
    "laboratoryName" VARCHAR(200),
    "laboratoryCode" VARCHAR(50),
    "sampleId" VARCHAR(100),
    "reportNumber" VARCHAR(100),
    "reportFileId" UUID,
    "isUserConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "SoilTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilTestResult" (
    "id" UUID NOT NULL,
    "soilTestId" UUID NOT NULL,
    "parameterId" UUID NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,
    "unitId" UUID NOT NULL,
    "rating" "QualitativeLevel",
    "method" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoilTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" UUID NOT NULL,
    "provider" "WeatherProvider" NOT NULL,
    "snapshotType" "WeatherSnapshotType" NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "regionId" UUID,
    "periodStart" TIMESTAMPTZ(6) NOT NULL,
    "periodEnd" TIMESTAMPTZ(6) NOT NULL,
    "fetchedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperatureMinC" DECIMAL(5,2),
    "temperatureMaxC" DECIMAL(5,2),
    "temperatureMeanC" DECIMAL(5,2),
    "rainfallMm" DECIMAL(8,2),
    "relativeHumidityPct" DECIMAL(5,2),
    "windSpeedKmph" DECIMAL(6,2),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRecommendation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "farmPlotId" UUID,
    "seasonId" UUID,
    "regionId" UUID,
    "soilTypeId" UUID,
    "soilTestId" UUID,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "budgetAmount" DECIMAL(14,2),
    "budgetCurrency" CHAR(3) NOT NULL DEFAULT 'INR',
    "recommendationDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "ruleSetVersion" VARCHAR(50) NOT NULL,
    "explanation" TEXT,
    "dataCompletenessPct" DECIMAL(5,2),
    "missingInputs" TEXT[],
    "inputSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRecommendationWeather" (
    "recommendationId" UUID NOT NULL,
    "weatherSnapshotId" UUID NOT NULL,

    CONSTRAINT "CropRecommendationWeather_pkey" PRIMARY KEY ("recommendationId","weatherSnapshotId")
);

-- CreateTable
CREATE TABLE "CropRecommendationItem" (
    "id" UUID NOT NULL,
    "recommendationId" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "rank" SMALLINT NOT NULL,
    "suitabilityLevel" "SuitabilityLevel" NOT NULL DEFAULT 'UNKNOWN',
    "suitabilityScore" DECIMAL(5,2),
    "scoringMethod" VARCHAR(100),
    "summary" TEXT,
    "cropEconomicsId" UUID,
    "areaValue" DECIMAL(12,4),
    "areaUnitId" UUID,
    "estimatedInvestmentMin" DECIMAL(14,2),
    "estimatedInvestmentMax" DECIMAL(14,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "expectedYieldMin" DECIMAL(14,3),
    "expectedYieldMax" DECIMAL(14,3),
    "yieldUnitId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropRecommendationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRecommendationReason" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "kind" "ReasonKind" NOT NULL,
    "criterionCode" VARCHAR(50) NOT NULL,
    "result" "CriterionResult" NOT NULL,
    "reasonCode" VARCHAR(100) NOT NULL,
    "message" TEXT,
    "observedValue" VARCHAR(100),
    "requiredValue" VARCHAR(100),
    "parameterId" UUID,
    "cropRequirementId" UUID,
    "sourceId" UUID,
    "sequence" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropRecommendationReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmCrop" (
    "id" UUID NOT NULL,
    "farmPlotId" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "growingProcedureId" UUID,
    "procedureVersionId" UUID,
    "seasonId" UUID,
    "recommendationItemId" UUID,
    "label" VARCHAR(150),
    "plantingDate" DATE,
    "expectedHarvestDate" DATE,
    "actualHarvestDate" DATE,
    "cultivatedArea" DECIMAL(12,4) NOT NULL,
    "areaUnitId" UUID NOT NULL,
    "status" "CultivationStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "FarmCrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropTask" (
    "id" UUID NOT NULL,
    "farmCropId" UUID NOT NULL,
    "growingStageId" UUID,
    "stageInstructionId" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledStartDate" DATE,
    "dueDate" DATE,
    "postponedFromDate" DATE,
    "completedAt" TIMESTAMPTZ(6),
    "skippedReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskReminder" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "remindAt" TIMESTAMPTZ(6) NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'PUSH',
    "status" "ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
    "sentAt" TIMESTAMPTZ(6),
    "failureReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TaskReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropActivityLog" (
    "id" UUID NOT NULL,
    "farmCropId" UUID NOT NULL,
    "taskId" UUID,
    "activityType" "ActivityType" NOT NULL,
    "activityDate" DATE NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "performedById" UUID,
    "labourCount" SMALLINT,
    "labourHours" DECIMAL(6,2),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CropActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropObservation" (
    "id" UUID NOT NULL,
    "farmCropId" UUID NOT NULL,
    "growingStageId" UUID,
    "observedAt" TIMESTAMPTZ(6) NOT NULL,
    "observationType" "ObservationType" NOT NULL,
    "severity" "Severity",
    "affectedAreaPct" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropObservationFile" (
    "observationId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "CropObservationFile_pkey" PRIMARY KEY ("observationId","fileId")
);

-- CreateTable
CREATE TABLE "IrrigationLog" (
    "id" UUID NOT NULL,
    "activityLogId" UUID NOT NULL,
    "waterSourceId" UUID,
    "method" "IrrigationMethod",
    "durationMinutes" INTEGER,
    "waterQuantity" DECIMAL(12,3),
    "waterUnitId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IrrigationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropDisease" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "causalOrganism" VARCHAR(200),
    "pathogenType" "PathogenType",
    "description" TEXT,
    "heroImageAssetId" UUID,
    "sourceId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CropDisease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropPest" (
    "id" UUID NOT NULL,
    "commonName" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "scientificName" VARCHAR(200),
    "pestType" "PestType",
    "description" TEXT,
    "heroImageAssetId" UUID,
    "sourceId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CropPest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropDiseaseMapping" (
    "cropId" UUID NOT NULL,
    "diseaseId" UUID NOT NULL,
    "susceptibleStageTypeId" UUID,
    "notes" TEXT,
    "sourceId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropDiseaseMapping_pkey" PRIMARY KEY ("cropId","diseaseId")
);

-- CreateTable
CREATE TABLE "CropPestMapping" (
    "cropId" UUID NOT NULL,
    "pestId" UUID NOT NULL,
    "susceptibleStageTypeId" UUID,
    "notes" TEXT,
    "sourceId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropPestMapping_pkey" PRIMARY KEY ("cropId","pestId")
);

-- CreateTable
CREATE TABLE "DiseaseSymptom" (
    "id" UUID NOT NULL,
    "diseaseId" UUID,
    "pestId" UUID,
    "plantPart" "PlantPart",
    "description" TEXT NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DiseaseSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseSymptomMedia" (
    "symptomId" UUID NOT NULL,
    "mediaAssetId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "DiseaseSymptomMedia_pkey" PRIMARY KEY ("symptomId","mediaAssetId")
);

-- CreateTable
CREATE TABLE "DiseaseTreatment" (
    "id" UUID NOT NULL,
    "diseaseId" UUID,
    "pestId" UUID,
    "treatmentType" "TreatmentType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "farmInputId" UUID,
    "doseValue" DECIMAL(12,4),
    "doseUnitId" UUID,
    "doseBasis" "QuantityBasis",
    "applicationMethod" "ApplicationMethod",
    "preHarvestIntervalDays" SMALLINT,
    "safetyPrecautions" TEXT,
    "regulatoryReference" VARCHAR(200),
    "sourceId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "approvedById" UUID,
    "approvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "DiseaseTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropDiagnosis" (
    "id" UUID NOT NULL,
    "requestedById" UUID NOT NULL,
    "farmCropId" UUID,
    "cropId" UUID,
    "observationId" UUID,
    "description" TEXT,
    "status" "DiagnosisStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedDiseaseId" UUID,
    "confirmedPestId" UUID,
    "confirmedById" UUID,
    "confirmedAt" TIMESTAMPTZ(6),
    "expertNotes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CropDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropDiagnosisFile" (
    "diagnosisId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "CropDiagnosisFile_pkey" PRIMARY KEY ("diagnosisId","fileId")
);

-- CreateTable
CREATE TABLE "DiagnosisAiCandidate" (
    "id" UUID NOT NULL,
    "diagnosisId" UUID NOT NULL,
    "modelName" VARCHAR(100) NOT NULL,
    "modelVersion" VARCHAR(50) NOT NULL,
    "rank" SMALLINT NOT NULL,
    "diseaseId" UUID,
    "pestId" UUID,
    "labelText" VARCHAR(200),
    "confidence" DECIMAL(5,4) NOT NULL,
    "rawOutput" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosisAiCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmInput" (
    "id" UUID NOT NULL,
    "inputType" "InputType" NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "brandName" VARCHAR(150),
    "manufacturer" VARCHAR(200),
    "activeIngredient" VARCHAR(300),
    "composition" VARCHAR(300),
    "registrationNumber" VARCHAR(100),
    "defaultUnitId" UUID,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "FarmInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputRecommendation" (
    "id" UUID NOT NULL,
    "cropId" UUID NOT NULL,
    "cropVarietyId" UUID,
    "growingStageId" UUID,
    "regionId" UUID,
    "seasonId" UUID,
    "farmInputId" UUID,
    "nutrientParameterId" UUID,
    "quantityMin" DECIMAL(12,4),
    "quantityMax" DECIMAL(12,4),
    "quantityUnitId" UUID NOT NULL,
    "basis" "QuantityBasis" NOT NULL,
    "applicationMethod" "ApplicationMethod",
    "timingNote" TEXT,
    "conditionNote" TEXT,
    "sourceId" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "InputRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputPurchase" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "farmId" UUID,
    "farmInputId" UUID,
    "itemName" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitId" UUID NOT NULL,
    "unitPrice" DECIMAL(14,2),
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "purchaseDate" DATE NOT NULL,
    "supplierName" VARCHAR(200),
    "receiptFileId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "InputPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputApplicationLog" (
    "id" UUID NOT NULL,
    "activityLogId" UUID NOT NULL,
    "farmInputId" UUID,
    "inputPurchaseId" UUID,
    "inputRecommendationId" UUID,
    "productName" VARCHAR(200),
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitId" UUID NOT NULL,
    "applicationMethod" "ApplicationMethod",
    "areaCovered" DECIMAL(12,4),
    "areaUnitId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "InputApplicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropExpense" (
    "id" UUID NOT NULL,
    "farmCropId" UUID NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "expenseDate" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "description" VARCHAR(300),
    "quantity" DECIMAL(14,3),
    "unitId" UUID,
    "inputPurchaseId" UUID,
    "activityLogId" UUID,
    "paymentMode" "PaymentMode",
    "receiptFileId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CropExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestRecord" (
    "id" UUID NOT NULL,
    "farmCropId" UUID NOT NULL,
    "harvestNumber" SMALLINT NOT NULL DEFAULT 1,
    "harvestDate" DATE NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitId" UUID NOT NULL,
    "qualityGrade" VARCHAR(50),
    "moisturePct" DECIMAL(5,2),
    "areaHarvested" DECIMAL(12,4),
    "areaUnitId" UUID,
    "storageLocation" VARCHAR(200),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "HarvestRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesRecord" (
    "id" UUID NOT NULL,
    "harvestRecordId" UUID NOT NULL,
    "saleDate" DATE NOT NULL,
    "quantitySold" DECIMAL(14,3) NOT NULL,
    "unitId" UUID NOT NULL,
    "pricePerUnit" DECIMAL(14,2) NOT NULL,
    "grossAmount" DECIMAL(14,2) NOT NULL,
    "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "buyerType" "BuyerType",
    "buyerName" VARCHAR(200),
    "buyerContact" VARCHAR(100),
    "marketName" VARCHAR(200),
    "marketRegionId" UUID,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMode" "PaymentMode",
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "SalesRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "cropTaskId" UUID,
    "farmCropId" UUID,
    "recommendationId" UUID,
    "consultationId" UUID,
    "sentAt" TIMESTAMPTZ(6),
    "readAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerPost" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "cropId" UUID,
    "languageId" UUID,
    "title" VARCHAR(200),
    "body" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "FarmerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "sequence" SMALLINT NOT NULL DEFAULT 0,
    "caption" VARCHAR(300),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "parentCommentId" UUID,
    "body" TEXT NOT NULL,
    "isExpertAnswer" BOOLEAN NOT NULL DEFAULT false,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertConsultation" (
    "id" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "expertId" UUID,
    "farmCropId" UUID,
    "cropId" UUID,
    "diagnosisId" UUID,
    "subject" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "channel" "ConsultationChannel" NOT NULL DEFAULT 'CHAT',
    "status" "ConsultationStatus" NOT NULL DEFAULT 'OPEN',
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMPTZ(6),
    "resolvedAt" TIMESTAMPTZ(6),
    "resolutionSummary" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExpertConsultation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Language_single_default_key" ON "Language"("isDefault") WHERE ("isDefault" = true);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileImageFileId_key" ON "User"("profileImageFileId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_preferredLanguageId_idx" ON "User"("preferredLanguageId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");

-- CreateIndex
CREATE INDEX "ExpertProfile_regionId_idx" ON "ExpertProfile"("regionId");

-- CreateIndex
CREATE INDEX "UserFile_ownerId_purpose_idx" ON "UserFile"("ownerId", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_storageProvider_storageKey_key" ON "UserFile"("storageProvider", "storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementUnit_code_key" ON "MeasurementUnit"("code");

-- CreateIndex
CREATE INDEX "MeasurementUnit_dimension_idx" ON "MeasurementUnit"("dimension");

-- CreateIndex
CREATE INDEX "Region_agroClimaticZoneId_idx" ON "Region"("agroClimaticZoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_type_code_key" ON "Region"("type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_parentId_type_name_key" ON "Region"("parentId", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SoilType_code_key" ON "SoilType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Season_code_key" ON "Season"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AgronomicParameter_code_key" ON "AgronomicParameter"("code");

-- CreateIndex
CREATE INDEX "AgronomicParameter_category_idx" ON "AgronomicParameter"("category");

-- CreateIndex
CREATE UNIQUE INDEX "WaterSourceType_code_key" ON "WaterSourceType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StageType_code_key" ON "StageType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CultivationMethod_code_key" ON "CultivationMethod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CropCategory_slug_key" ON "CropCategory"("slug");

-- CreateIndex
CREATE INDEX "CropCategory_parentId_displayOrder_idx" ON "CropCategory"("parentId", "displayOrder");

-- CreateIndex
CREATE INDEX "CropCategoryMapping_categoryId_displayOrder_idx" ON "CropCategoryMapping"("categoryId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CropCategoryMapping_one_primary_per_crop" ON "CropCategoryMapping"("cropId", "isPrimary") WHERE ("isPrimary" = true);

-- CreateIndex
CREATE UNIQUE INDEX "Crop_slug_key" ON "Crop"("slug");

-- CreateIndex
CREATE INDEX "Crop_status_idx" ON "Crop"("status");

-- CreateIndex
CREATE INDEX "CropVariety_cropId_status_idx" ON "CropVariety"("cropId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CropVariety_cropId_slug_key" ON "CropVariety"("cropId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CropVariety_id_cropId_key" ON "CropVariety"("id", "cropId");

-- CreateIndex
CREATE INDEX "CropRequirement_cropId_parameterId_status_idx" ON "CropRequirement"("cropId", "parameterId", "status");

-- CreateIndex
CREATE INDEX "CropRequirement_cropVarietyId_idx" ON "CropRequirement"("cropVarietyId");

-- CreateIndex
CREATE INDEX "CropRequirement_regionId_idx" ON "CropRequirement"("regionId");

-- CreateIndex
CREATE INDEX "CropRequirement_seasonId_idx" ON "CropRequirement"("seasonId");

-- CreateIndex
CREATE INDEX "CropSeasonMapping_cropId_seasonId_idx" ON "CropSeasonMapping"("cropId", "seasonId");

-- CreateIndex
CREATE INDEX "CropSeasonMapping_seasonId_idx" ON "CropSeasonMapping"("seasonId");

-- CreateIndex
CREATE INDEX "CropSeasonMapping_regionId_idx" ON "CropSeasonMapping"("regionId");

-- CreateIndex
CREATE INDEX "CropSoilSuitability_cropId_soilTypeId_idx" ON "CropSoilSuitability"("cropId", "soilTypeId");

-- CreateIndex
CREATE INDEX "CropSoilSuitability_soilTypeId_idx" ON "CropSoilSuitability"("soilTypeId");

-- CreateIndex
CREATE INDEX "CropRegionSuitability_cropId_regionId_idx" ON "CropRegionSuitability"("cropId", "regionId");

-- CreateIndex
CREATE INDEX "CropRegionSuitability_regionId_idx" ON "CropRegionSuitability"("regionId");

-- CreateIndex
CREATE INDEX "CropEconomics_cropId_regionId_referenceYear_idx" ON "CropEconomics"("cropId", "regionId", "referenceYear");

-- CreateIndex
CREATE INDEX "CropMedia_mediaAssetId_idx" ON "CropMedia"("mediaAssetId");

-- CreateIndex
CREATE INDEX "GrowingProcedure_cropVarietyId_idx" ON "GrowingProcedure"("cropVarietyId");

-- CreateIndex
CREATE INDEX "GrowingProcedure_cropId_status_idx" ON "GrowingProcedure"("cropId", "status");

-- CreateIndex
CREATE INDEX "GrowingProcedure_regionId_seasonId_idx" ON "GrowingProcedure"("regionId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowingProcedure_cropId_slug_key" ON "GrowingProcedure"("cropId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "GrowingProcedure_id_cropId_key" ON "GrowingProcedure"("id", "cropId");

-- CreateIndex
CREATE INDEX "ProcedureVersion_status_idx" ON "ProcedureVersion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureVersion_procedureId_versionNumber_key" ON "ProcedureVersion"("procedureId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureVersion_id_procedureId_key" ON "ProcedureVersion"("id", "procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureVersion_one_published_per_procedure" ON "ProcedureVersion"("procedureId", "status") WHERE ("status" = 'PUBLISHED');

-- CreateIndex
CREATE INDEX "GrowingStage_procedureId_idx" ON "GrowingStage"("procedureId");

-- CreateIndex
CREATE INDEX "GrowingStage_stageTypeId_idx" ON "GrowingStage"("stageTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowingStage_procedureVersionId_sequence_key" ON "GrowingStage"("procedureVersionId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "StageInstruction_stageId_sequence_key" ON "StageInstruction"("stageId", "sequence");

-- CreateIndex
CREATE INDEX "StageResource_stageId_sequence_idx" ON "StageResource"("stageId", "sequence");

-- CreateIndex
CREATE INDEX "StageResource_instructionId_idx" ON "StageResource"("instructionId");

-- CreateIndex
CREATE INDEX "StageResource_farmInputId_idx" ON "StageResource"("farmInputId");

-- CreateIndex
CREATE UNIQUE INDEX "StageCommonMistake_stageId_sequence_key" ON "StageCommonMistake"("stageId", "sequence");

-- CreateIndex
CREATE INDEX "ContentSource_sourceType_idx" ON "ContentSource"("sourceType");

-- CreateIndex
CREATE INDEX "MediaAsset_mediaType_status_idx" ON "MediaAsset"("mediaType", "status");

-- CreateIndex
CREATE INDEX "MediaAsset_languageId_idx" ON "MediaAsset"("languageId");

-- CreateIndex
CREATE INDEX "MediaAsset_sourceId_idx" ON "MediaAsset"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageProvider_storageKey_key" ON "MediaAsset"("storageProvider", "storageKey");

-- CreateIndex
CREATE INDEX "StageMedia_mediaAssetId_idx" ON "StageMedia"("mediaAssetId");

-- CreateIndex
CREATE INDEX "StageMedia_instructionId_idx" ON "StageMedia"("instructionId");

-- CreateIndex
CREATE UNIQUE INDEX "StageMedia_stageId_mediaAssetId_key" ON "StageMedia"("stageId", "mediaAssetId");

-- CreateIndex
CREATE INDEX "ContentReview_reviewerId_idx" ON "ContentReview"("reviewerId");

-- CreateIndex
CREATE INDEX "ContentReview_procedureVersionId_idx" ON "ContentReview"("procedureVersionId");

-- CreateIndex
CREATE INDEX "ContentReview_mediaAssetId_idx" ON "ContentReview"("mediaAssetId");

-- CreateIndex
CREATE INDEX "ContentReview_cropRequirementId_idx" ON "ContentReview"("cropRequirementId");

-- CreateIndex
CREATE INDEX "ContentReview_cropVarietyId_idx" ON "ContentReview"("cropVarietyId");

-- CreateIndex
CREATE INDEX "ContentReview_cropEconomicsId_idx" ON "ContentReview"("cropEconomicsId");

-- CreateIndex
CREATE INDEX "ContentReview_diseaseTreatmentId_idx" ON "ContentReview"("diseaseTreatmentId");

-- CreateIndex
CREATE INDEX "ContentReview_inputRecommendationId_idx" ON "ContentReview"("inputRecommendationId");

-- CreateIndex
CREATE INDEX "ContentReview_translationId_idx" ON "ContentReview"("translationId");

-- CreateIndex
CREATE INDEX "Translation_languageId_status_idx" ON "Translation"("languageId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_cropCategoryId_field_languageId_key" ON "Translation"("cropCategoryId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_cropId_field_languageId_key" ON "Translation"("cropId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_cropVarietyId_field_languageId_key" ON "Translation"("cropVarietyId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_growingProcedureId_field_languageId_key" ON "Translation"("growingProcedureId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_growingStageId_field_languageId_key" ON "Translation"("growingStageId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_stageInstructionId_field_languageId_key" ON "Translation"("stageInstructionId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_stageResourceId_field_languageId_key" ON "Translation"("stageResourceId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_stageCommonMistakeId_field_languageId_key" ON "Translation"("stageCommonMistakeId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_mediaAssetId_field_languageId_key" ON "Translation"("mediaAssetId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_soilTypeId_field_languageId_key" ON "Translation"("soilTypeId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_seasonId_field_languageId_key" ON "Translation"("seasonId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_regionId_field_languageId_key" ON "Translation"("regionId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_agronomicParameterId_field_languageId_key" ON "Translation"("agronomicParameterId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_waterSourceTypeId_field_languageId_key" ON "Translation"("waterSourceTypeId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_stageTypeId_field_languageId_key" ON "Translation"("stageTypeId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_cultivationMethodId_field_languageId_key" ON "Translation"("cultivationMethodId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_cropDiseaseId_field_languageId_key" ON "Translation"("cropDiseaseId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_cropPestId_field_languageId_key" ON "Translation"("cropPestId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_diseaseSymptomId_field_languageId_key" ON "Translation"("diseaseSymptomId", "field", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_diseaseTreatmentId_field_languageId_key" ON "Translation"("diseaseTreatmentId", "field", "languageId");

-- CreateIndex
CREATE INDEX "Farm_ownerId_idx" ON "Farm"("ownerId");

-- CreateIndex
CREATE INDEX "Farm_regionId_idx" ON "Farm"("regionId");

-- CreateIndex
CREATE INDEX "FarmPlot_farmId_idx" ON "FarmPlot"("farmId");

-- CreateIndex
CREATE INDEX "FarmPlot_soilTypeId_idx" ON "FarmPlot"("soilTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmPlot_id_farmId_key" ON "FarmPlot"("id", "farmId");

-- CreateIndex
CREATE INDEX "WaterSource_farmId_idx" ON "WaterSource"("farmId");

-- CreateIndex
CREATE INDEX "WaterSource_waterSourceTypeId_idx" ON "WaterSource"("waterSourceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterSource_id_farmId_key" ON "WaterSource"("id", "farmId");

-- CreateIndex
CREATE INDEX "PlotWaterSource_waterSourceId_idx" ON "PlotWaterSource"("waterSourceId");

-- CreateIndex
CREATE INDEX "SoilTest_plotId_testDate_idx" ON "SoilTest"("plotId", "testDate");

-- CreateIndex
CREATE INDEX "SoilTestResult_parameterId_idx" ON "SoilTestResult"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "SoilTestResult_soilTestId_parameterId_key" ON "SoilTestResult"("soilTestId", "parameterId");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_latitude_longitude_snapshotType_periodStart_idx" ON "WeatherSnapshot"("latitude", "longitude", "snapshotType", "periodStart");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_regionId_idx" ON "WeatherSnapshot"("regionId");

-- CreateIndex
CREATE INDEX "CropRecommendation_userId_recommendationDate_idx" ON "CropRecommendation"("userId", "recommendationDate");

-- CreateIndex
CREATE INDEX "CropRecommendation_farmPlotId_idx" ON "CropRecommendation"("farmPlotId");

-- CreateIndex
CREATE INDEX "CropRecommendationWeather_weatherSnapshotId_idx" ON "CropRecommendationWeather"("weatherSnapshotId");

-- CreateIndex
CREATE INDEX "CropRecommendationItem_cropId_idx" ON "CropRecommendationItem"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "CropRecommendationItem_recommendationId_rank_key" ON "CropRecommendationItem"("recommendationId", "rank");

-- CreateIndex
CREATE INDEX "CropRecommendationReason_itemId_kind_idx" ON "CropRecommendationReason"("itemId", "kind");

-- CreateIndex
CREATE INDEX "CropRecommendationReason_cropRequirementId_idx" ON "CropRecommendationReason"("cropRequirementId");

-- CreateIndex
CREATE INDEX "FarmCrop_farmPlotId_status_idx" ON "FarmCrop"("farmPlotId", "status");

-- CreateIndex
CREATE INDEX "FarmCrop_cropId_idx" ON "FarmCrop"("cropId");

-- CreateIndex
CREATE INDEX "FarmCrop_procedureVersionId_idx" ON "FarmCrop"("procedureVersionId");

-- CreateIndex
CREATE INDEX "CropTask_farmCropId_status_idx" ON "CropTask"("farmCropId", "status");

-- CreateIndex
CREATE INDEX "CropTask_farmCropId_dueDate_idx" ON "CropTask"("farmCropId", "dueDate");

-- CreateIndex
CREATE INDEX "CropTask_growingStageId_idx" ON "CropTask"("growingStageId");

-- CreateIndex
CREATE INDEX "CropTask_stageInstructionId_idx" ON "CropTask"("stageInstructionId");

-- CreateIndex
CREATE INDEX "TaskReminder_status_remindAt_idx" ON "TaskReminder"("status", "remindAt");

-- CreateIndex
CREATE INDEX "TaskReminder_taskId_idx" ON "TaskReminder"("taskId");

-- CreateIndex
CREATE INDEX "CropActivityLog_farmCropId_activityDate_idx" ON "CropActivityLog"("farmCropId", "activityDate");

-- CreateIndex
CREATE INDEX "CropActivityLog_taskId_idx" ON "CropActivityLog"("taskId");

-- CreateIndex
CREATE INDEX "CropObservation_farmCropId_observedAt_idx" ON "CropObservation"("farmCropId", "observedAt");

-- CreateIndex
CREATE INDEX "CropObservationFile_fileId_idx" ON "CropObservationFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationLog_activityLogId_key" ON "IrrigationLog"("activityLogId");

-- CreateIndex
CREATE INDEX "IrrigationLog_waterSourceId_idx" ON "IrrigationLog"("waterSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "CropDisease_slug_key" ON "CropDisease"("slug");

-- CreateIndex
CREATE INDEX "CropDisease_status_idx" ON "CropDisease"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CropPest_slug_key" ON "CropPest"("slug");

-- CreateIndex
CREATE INDEX "CropPest_status_idx" ON "CropPest"("status");

-- CreateIndex
CREATE INDEX "CropDiseaseMapping_diseaseId_idx" ON "CropDiseaseMapping"("diseaseId");

-- CreateIndex
CREATE INDEX "CropPestMapping_pestId_idx" ON "CropPestMapping"("pestId");

-- CreateIndex
CREATE INDEX "DiseaseSymptom_diseaseId_idx" ON "DiseaseSymptom"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseSymptom_pestId_idx" ON "DiseaseSymptom"("pestId");

-- CreateIndex
CREATE INDEX "DiseaseSymptomMedia_mediaAssetId_idx" ON "DiseaseSymptomMedia"("mediaAssetId");

-- CreateIndex
CREATE INDEX "DiseaseTreatment_diseaseId_status_idx" ON "DiseaseTreatment"("diseaseId", "status");

-- CreateIndex
CREATE INDEX "DiseaseTreatment_pestId_status_idx" ON "DiseaseTreatment"("pestId", "status");

-- CreateIndex
CREATE INDEX "CropDiagnosis_requestedById_createdAt_idx" ON "CropDiagnosis"("requestedById", "createdAt");

-- CreateIndex
CREATE INDEX "CropDiagnosis_status_idx" ON "CropDiagnosis"("status");

-- CreateIndex
CREATE INDEX "CropDiagnosis_farmCropId_idx" ON "CropDiagnosis"("farmCropId");

-- CreateIndex
CREATE INDEX "CropDiagnosisFile_fileId_idx" ON "CropDiagnosisFile"("fileId");

-- CreateIndex
CREATE INDEX "DiagnosisAiCandidate_diseaseId_idx" ON "DiagnosisAiCandidate"("diseaseId");

-- CreateIndex
CREATE INDEX "DiagnosisAiCandidate_pestId_idx" ON "DiagnosisAiCandidate"("pestId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisAiCandidate_diagnosisId_modelName_modelVersion_ran_key" ON "DiagnosisAiCandidate"("diagnosisId", "modelName", "modelVersion", "rank");

-- CreateIndex
CREATE INDEX "FarmInput_inputType_name_idx" ON "FarmInput"("inputType", "name");

-- CreateIndex
CREATE INDEX "FarmInput_createdById_idx" ON "FarmInput"("createdById");

-- CreateIndex
CREATE INDEX "InputRecommendation_cropId_status_idx" ON "InputRecommendation"("cropId", "status");

-- CreateIndex
CREATE INDEX "InputRecommendation_growingStageId_idx" ON "InputRecommendation"("growingStageId");

-- CreateIndex
CREATE INDEX "InputRecommendation_farmInputId_idx" ON "InputRecommendation"("farmInputId");

-- CreateIndex
CREATE INDEX "InputPurchase_userId_purchaseDate_idx" ON "InputPurchase"("userId", "purchaseDate");

-- CreateIndex
CREATE INDEX "InputPurchase_farmId_idx" ON "InputPurchase"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "InputApplicationLog_activityLogId_key" ON "InputApplicationLog"("activityLogId");

-- CreateIndex
CREATE INDEX "InputApplicationLog_farmInputId_idx" ON "InputApplicationLog"("farmInputId");

-- CreateIndex
CREATE INDEX "InputApplicationLog_inputPurchaseId_idx" ON "InputApplicationLog"("inputPurchaseId");

-- CreateIndex
CREATE INDEX "CropExpense_farmCropId_expenseDate_idx" ON "CropExpense"("farmCropId", "expenseDate");

-- CreateIndex
CREATE INDEX "CropExpense_farmCropId_category_idx" ON "CropExpense"("farmCropId", "category");

-- CreateIndex
CREATE INDEX "HarvestRecord_farmCropId_harvestDate_idx" ON "HarvestRecord"("farmCropId", "harvestDate");

-- CreateIndex
CREATE UNIQUE INDEX "HarvestRecord_farmCropId_harvestNumber_key" ON "HarvestRecord"("farmCropId", "harvestNumber");

-- CreateIndex
CREATE INDEX "SalesRecord_harvestRecordId_idx" ON "SalesRecord"("harvestRecordId");

-- CreateIndex
CREATE INDEX "SalesRecord_saleDate_idx" ON "SalesRecord"("saleDate");

-- CreateIndex
CREATE INDEX "Notification_userId_status_createdAt_idx" ON "Notification"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "FarmerPost_cropId_createdAt_idx" ON "FarmerPost"("cropId", "createdAt");

-- CreateIndex
CREATE INDEX "FarmerPost_authorId_idx" ON "FarmerPost"("authorId");

-- CreateIndex
CREATE INDEX "PostMedia_fileId_idx" ON "PostMedia"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "PostMedia_postId_fileId_key" ON "PostMedia"("postId", "fileId");

-- CreateIndex
CREATE INDEX "PostComment_postId_createdAt_idx" ON "PostComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostComment_authorId_idx" ON "PostComment"("authorId");

-- CreateIndex
CREATE INDEX "PostComment_parentCommentId_idx" ON "PostComment"("parentCommentId");

-- CreateIndex
CREATE INDEX "ExpertConsultation_farmerId_status_idx" ON "ExpertConsultation"("farmerId", "status");

-- CreateIndex
CREATE INDEX "ExpertConsultation_expertId_status_idx" ON "ExpertConsultation"("expertId", "status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileImageFileId_fkey" FOREIGN KEY ("profileImageFileId") REFERENCES "UserFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredLanguageId_fkey" FOREIGN KEY ("preferredLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementUnit" ADD CONSTRAINT "MeasurementUnit_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_agroClimaticZoneId_fkey" FOREIGN KEY ("agroClimaticZoneId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgronomicParameter" ADD CONSTRAINT "AgronomicParameter_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCategory" ADD CONSTRAINT "CropCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CropCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCategory" ADD CONSTRAINT "CropCategory_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCategoryMapping" ADD CONSTRAINT "CropCategoryMapping_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCategoryMapping" ADD CONSTRAINT "CropCategoryMapping_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CropCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_heroImageAssetId_fkey" FOREIGN KEY ("heroImageAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropVariety" ADD CONSTRAINT "CropVariety_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropVariety" ADD CONSTRAINT "CropVariety_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "AgronomicParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRequirement" ADD CONSTRAINT "CropRequirement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSeasonMapping" ADD CONSTRAINT "CropSeasonMapping_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSeasonMapping" ADD CONSTRAINT "CropSeasonMapping_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSeasonMapping" ADD CONSTRAINT "CropSeasonMapping_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSeasonMapping" ADD CONSTRAINT "CropSeasonMapping_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSeasonMapping" ADD CONSTRAINT "CropSeasonMapping_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSoilSuitability" ADD CONSTRAINT "CropSoilSuitability_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSoilSuitability" ADD CONSTRAINT "CropSoilSuitability_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSoilSuitability" ADD CONSTRAINT "CropSoilSuitability_soilTypeId_fkey" FOREIGN KEY ("soilTypeId") REFERENCES "SoilType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropSoilSuitability" ADD CONSTRAINT "CropSoilSuitability_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRegionSuitability" ADD CONSTRAINT "CropRegionSuitability_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRegionSuitability" ADD CONSTRAINT "CropRegionSuitability_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRegionSuitability" ADD CONSTRAINT "CropRegionSuitability_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRegionSuitability" ADD CONSTRAINT "CropRegionSuitability_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_areaUnitId_fkey" FOREIGN KEY ("areaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_yieldUnitId_fkey" FOREIGN KEY ("yieldUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEconomics" ADD CONSTRAINT "CropEconomics_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropMedia" ADD CONSTRAINT "CropMedia_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropMedia" ADD CONSTRAINT "CropMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingProcedure" ADD CONSTRAINT "GrowingProcedure_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingProcedure" ADD CONSTRAINT "GrowingProcedure_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingProcedure" ADD CONSTRAINT "GrowingProcedure_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingProcedure" ADD CONSTRAINT "GrowingProcedure_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingProcedure" ADD CONSTRAINT "GrowingProcedure_cultivationMethodId_fkey" FOREIGN KEY ("cultivationMethodId") REFERENCES "CultivationMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureVersion" ADD CONSTRAINT "ProcedureVersion_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "GrowingProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureVersion" ADD CONSTRAINT "ProcedureVersion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureVersion" ADD CONSTRAINT "ProcedureVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureVersion" ADD CONSTRAINT "ProcedureVersion_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingStage" ADD CONSTRAINT "GrowingStage_procedureVersionId_procedureId_fkey" FOREIGN KEY ("procedureVersionId", "procedureId") REFERENCES "ProcedureVersion"("id", "procedureId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingStage" ADD CONSTRAINT "GrowingStage_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "GrowingProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowingStage" ADD CONSTRAINT "GrowingStage_stageTypeId_fkey" FOREIGN KEY ("stageTypeId") REFERENCES "StageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageInstruction" ADD CONSTRAINT "StageInstruction_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "GrowingStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageInstruction" ADD CONSTRAINT "StageInstruction_durationUnitId_fkey" FOREIGN KEY ("durationUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageInstruction" ADD CONSTRAINT "StageInstruction_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResource" ADD CONSTRAINT "StageResource_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "GrowingStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResource" ADD CONSTRAINT "StageResource_instructionId_fkey" FOREIGN KEY ("instructionId") REFERENCES "StageInstruction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResource" ADD CONSTRAINT "StageResource_farmInputId_fkey" FOREIGN KEY ("farmInputId") REFERENCES "FarmInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageCommonMistake" ADD CONSTRAINT "StageCommonMistake_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "GrowingStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageCommonMistake" ADD CONSTRAINT "StageCommonMistake_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageMedia" ADD CONSTRAINT "StageMedia_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "GrowingStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageMedia" ADD CONSTRAINT "StageMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageMedia" ADD CONSTRAINT "StageMedia_instructionId_fkey" FOREIGN KEY ("instructionId") REFERENCES "StageInstruction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_procedureVersionId_fkey" FOREIGN KEY ("procedureVersionId") REFERENCES "ProcedureVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_cropRequirementId_fkey" FOREIGN KEY ("cropRequirementId") REFERENCES "CropRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_cropVarietyId_fkey" FOREIGN KEY ("cropVarietyId") REFERENCES "CropVariety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_cropEconomicsId_fkey" FOREIGN KEY ("cropEconomicsId") REFERENCES "CropEconomics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_diseaseTreatmentId_fkey" FOREIGN KEY ("diseaseTreatmentId") REFERENCES "DiseaseTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_inputRecommendationId_fkey" FOREIGN KEY ("inputRecommendationId") REFERENCES "InputRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_cropCategoryId_fkey" FOREIGN KEY ("cropCategoryId") REFERENCES "CropCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_cropVarietyId_fkey" FOREIGN KEY ("cropVarietyId") REFERENCES "CropVariety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_growingProcedureId_fkey" FOREIGN KEY ("growingProcedureId") REFERENCES "GrowingProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_growingStageId_fkey" FOREIGN KEY ("growingStageId") REFERENCES "GrowingStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_stageInstructionId_fkey" FOREIGN KEY ("stageInstructionId") REFERENCES "StageInstruction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_stageResourceId_fkey" FOREIGN KEY ("stageResourceId") REFERENCES "StageResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_stageCommonMistakeId_fkey" FOREIGN KEY ("stageCommonMistakeId") REFERENCES "StageCommonMistake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_soilTypeId_fkey" FOREIGN KEY ("soilTypeId") REFERENCES "SoilType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_agronomicParameterId_fkey" FOREIGN KEY ("agronomicParameterId") REFERENCES "AgronomicParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_waterSourceTypeId_fkey" FOREIGN KEY ("waterSourceTypeId") REFERENCES "WaterSourceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_stageTypeId_fkey" FOREIGN KEY ("stageTypeId") REFERENCES "StageType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_cultivationMethodId_fkey" FOREIGN KEY ("cultivationMethodId") REFERENCES "CultivationMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_cropDiseaseId_fkey" FOREIGN KEY ("cropDiseaseId") REFERENCES "CropDisease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_cropPestId_fkey" FOREIGN KEY ("cropPestId") REFERENCES "CropPest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_diseaseSymptomId_fkey" FOREIGN KEY ("diseaseSymptomId") REFERENCES "DiseaseSymptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_diseaseTreatmentId_fkey" FOREIGN KEY ("diseaseTreatmentId") REFERENCES "DiseaseTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_totalAreaUnitId_fkey" FOREIGN KEY ("totalAreaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmPlot" ADD CONSTRAINT "FarmPlot_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmPlot" ADD CONSTRAINT "FarmPlot_areaUnitId_fkey" FOREIGN KEY ("areaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmPlot" ADD CONSTRAINT "FarmPlot_soilTypeId_fkey" FOREIGN KEY ("soilTypeId") REFERENCES "SoilType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterSource" ADD CONSTRAINT "WaterSource_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterSource" ADD CONSTRAINT "WaterSource_waterSourceTypeId_fkey" FOREIGN KEY ("waterSourceTypeId") REFERENCES "WaterSourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterSource" ADD CONSTRAINT "WaterSource_yieldUnitId_fkey" FOREIGN KEY ("yieldUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotWaterSource" ADD CONSTRAINT "PlotWaterSource_plotId_farmId_fkey" FOREIGN KEY ("plotId", "farmId") REFERENCES "FarmPlot"("id", "farmId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotWaterSource" ADD CONSTRAINT "PlotWaterSource_waterSourceId_farmId_fkey" FOREIGN KEY ("waterSourceId", "farmId") REFERENCES "WaterSource"("id", "farmId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTest" ADD CONSTRAINT "SoilTest_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "FarmPlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTest" ADD CONSTRAINT "SoilTest_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "UserFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTestResult" ADD CONSTRAINT "SoilTestResult_soilTestId_fkey" FOREIGN KEY ("soilTestId") REFERENCES "SoilTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTestResult" ADD CONSTRAINT "SoilTestResult_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "AgronomicParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTestResult" ADD CONSTRAINT "SoilTestResult_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherSnapshot" ADD CONSTRAINT "WeatherSnapshot_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_farmPlotId_fkey" FOREIGN KEY ("farmPlotId") REFERENCES "FarmPlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_soilTypeId_fkey" FOREIGN KEY ("soilTypeId") REFERENCES "SoilType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_soilTestId_fkey" FOREIGN KEY ("soilTestId") REFERENCES "SoilTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationWeather" ADD CONSTRAINT "CropRecommendationWeather_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "CropRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationWeather" ADD CONSTRAINT "CropRecommendationWeather_weatherSnapshotId_fkey" FOREIGN KEY ("weatherSnapshotId") REFERENCES "WeatherSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationItem" ADD CONSTRAINT "CropRecommendationItem_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "CropRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationItem" ADD CONSTRAINT "CropRecommendationItem_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationItem" ADD CONSTRAINT "CropRecommendationItem_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationItem" ADD CONSTRAINT "CropRecommendationItem_cropEconomicsId_fkey" FOREIGN KEY ("cropEconomicsId") REFERENCES "CropEconomics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationItem" ADD CONSTRAINT "CropRecommendationItem_areaUnitId_fkey" FOREIGN KEY ("areaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationItem" ADD CONSTRAINT "CropRecommendationItem_yieldUnitId_fkey" FOREIGN KEY ("yieldUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationReason" ADD CONSTRAINT "CropRecommendationReason_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CropRecommendationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationReason" ADD CONSTRAINT "CropRecommendationReason_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "AgronomicParameter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationReason" ADD CONSTRAINT "CropRecommendationReason_cropRequirementId_fkey" FOREIGN KEY ("cropRequirementId") REFERENCES "CropRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendationReason" ADD CONSTRAINT "CropRecommendationReason_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_farmPlotId_fkey" FOREIGN KEY ("farmPlotId") REFERENCES "FarmPlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_growingProcedureId_cropId_fkey" FOREIGN KEY ("growingProcedureId", "cropId") REFERENCES "GrowingProcedure"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_procedureVersionId_growingProcedureId_fkey" FOREIGN KEY ("procedureVersionId", "growingProcedureId") REFERENCES "ProcedureVersion"("id", "procedureId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_recommendationItemId_fkey" FOREIGN KEY ("recommendationItemId") REFERENCES "CropRecommendationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCrop" ADD CONSTRAINT "FarmCrop_areaUnitId_fkey" FOREIGN KEY ("areaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTask" ADD CONSTRAINT "CropTask_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTask" ADD CONSTRAINT "CropTask_growingStageId_fkey" FOREIGN KEY ("growingStageId") REFERENCES "GrowingStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTask" ADD CONSTRAINT "CropTask_stageInstructionId_fkey" FOREIGN KEY ("stageInstructionId") REFERENCES "StageInstruction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskReminder" ADD CONSTRAINT "TaskReminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CropTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropActivityLog" ADD CONSTRAINT "CropActivityLog_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropActivityLog" ADD CONSTRAINT "CropActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CropTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropActivityLog" ADD CONSTRAINT "CropActivityLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropObservation" ADD CONSTRAINT "CropObservation_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropObservation" ADD CONSTRAINT "CropObservation_growingStageId_fkey" FOREIGN KEY ("growingStageId") REFERENCES "GrowingStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropObservationFile" ADD CONSTRAINT "CropObservationFile_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "CropObservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropObservationFile" ADD CONSTRAINT "CropObservationFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "UserFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationLog" ADD CONSTRAINT "IrrigationLog_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "CropActivityLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationLog" ADD CONSTRAINT "IrrigationLog_waterSourceId_fkey" FOREIGN KEY ("waterSourceId") REFERENCES "WaterSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationLog" ADD CONSTRAINT "IrrigationLog_waterUnitId_fkey" FOREIGN KEY ("waterUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDisease" ADD CONSTRAINT "CropDisease_heroImageAssetId_fkey" FOREIGN KEY ("heroImageAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDisease" ADD CONSTRAINT "CropDisease_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPest" ADD CONSTRAINT "CropPest_heroImageAssetId_fkey" FOREIGN KEY ("heroImageAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPest" ADD CONSTRAINT "CropPest_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiseaseMapping" ADD CONSTRAINT "CropDiseaseMapping_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiseaseMapping" ADD CONSTRAINT "CropDiseaseMapping_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "CropDisease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiseaseMapping" ADD CONSTRAINT "CropDiseaseMapping_susceptibleStageTypeId_fkey" FOREIGN KEY ("susceptibleStageTypeId") REFERENCES "StageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiseaseMapping" ADD CONSTRAINT "CropDiseaseMapping_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPestMapping" ADD CONSTRAINT "CropPestMapping_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPestMapping" ADD CONSTRAINT "CropPestMapping_pestId_fkey" FOREIGN KEY ("pestId") REFERENCES "CropPest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPestMapping" ADD CONSTRAINT "CropPestMapping_susceptibleStageTypeId_fkey" FOREIGN KEY ("susceptibleStageTypeId") REFERENCES "StageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropPestMapping" ADD CONSTRAINT "CropPestMapping_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "CropDisease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_pestId_fkey" FOREIGN KEY ("pestId") REFERENCES "CropPest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptomMedia" ADD CONSTRAINT "DiseaseSymptomMedia_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "DiseaseSymptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptomMedia" ADD CONSTRAINT "DiseaseSymptomMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "CropDisease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_pestId_fkey" FOREIGN KEY ("pestId") REFERENCES "CropPest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_farmInputId_fkey" FOREIGN KEY ("farmInputId") REFERENCES "FarmInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_doseUnitId_fkey" FOREIGN KEY ("doseUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseTreatment" ADD CONSTRAINT "DiseaseTreatment_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "CropObservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_confirmedDiseaseId_fkey" FOREIGN KEY ("confirmedDiseaseId") REFERENCES "CropDisease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_confirmedPestId_fkey" FOREIGN KEY ("confirmedPestId") REFERENCES "CropPest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosisFile" ADD CONSTRAINT "CropDiagnosisFile_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "CropDiagnosis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropDiagnosisFile" ADD CONSTRAINT "CropDiagnosisFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "UserFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisAiCandidate" ADD CONSTRAINT "DiagnosisAiCandidate_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "CropDiagnosis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisAiCandidate" ADD CONSTRAINT "DiagnosisAiCandidate_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "CropDisease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisAiCandidate" ADD CONSTRAINT "DiagnosisAiCandidate_pestId_fkey" FOREIGN KEY ("pestId") REFERENCES "CropPest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmInput" ADD CONSTRAINT "FarmInput_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmInput" ADD CONSTRAINT "FarmInput_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_cropVarietyId_cropId_fkey" FOREIGN KEY ("cropVarietyId", "cropId") REFERENCES "CropVariety"("id", "cropId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_growingStageId_fkey" FOREIGN KEY ("growingStageId") REFERENCES "GrowingStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_farmInputId_fkey" FOREIGN KEY ("farmInputId") REFERENCES "FarmInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_nutrientParameterId_fkey" FOREIGN KEY ("nutrientParameterId") REFERENCES "AgronomicParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_quantityUnitId_fkey" FOREIGN KEY ("quantityUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputRecommendation" ADD CONSTRAINT "InputRecommendation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPurchase" ADD CONSTRAINT "InputPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPurchase" ADD CONSTRAINT "InputPurchase_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPurchase" ADD CONSTRAINT "InputPurchase_farmInputId_fkey" FOREIGN KEY ("farmInputId") REFERENCES "FarmInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPurchase" ADD CONSTRAINT "InputPurchase_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPurchase" ADD CONSTRAINT "InputPurchase_receiptFileId_fkey" FOREIGN KEY ("receiptFileId") REFERENCES "UserFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplicationLog" ADD CONSTRAINT "InputApplicationLog_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "CropActivityLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplicationLog" ADD CONSTRAINT "InputApplicationLog_farmInputId_fkey" FOREIGN KEY ("farmInputId") REFERENCES "FarmInput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplicationLog" ADD CONSTRAINT "InputApplicationLog_inputPurchaseId_fkey" FOREIGN KEY ("inputPurchaseId") REFERENCES "InputPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplicationLog" ADD CONSTRAINT "InputApplicationLog_inputRecommendationId_fkey" FOREIGN KEY ("inputRecommendationId") REFERENCES "InputRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplicationLog" ADD CONSTRAINT "InputApplicationLog_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplicationLog" ADD CONSTRAINT "InputApplicationLog_areaUnitId_fkey" FOREIGN KEY ("areaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropExpense" ADD CONSTRAINT "CropExpense_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropExpense" ADD CONSTRAINT "CropExpense_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropExpense" ADD CONSTRAINT "CropExpense_inputPurchaseId_fkey" FOREIGN KEY ("inputPurchaseId") REFERENCES "InputPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropExpense" ADD CONSTRAINT "CropExpense_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "CropActivityLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropExpense" ADD CONSTRAINT "CropExpense_receiptFileId_fkey" FOREIGN KEY ("receiptFileId") REFERENCES "UserFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestRecord" ADD CONSTRAINT "HarvestRecord_areaUnitId_fkey" FOREIGN KEY ("areaUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_harvestRecordId_fkey" FOREIGN KEY ("harvestRecordId") REFERENCES "HarvestRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_marketRegionId_fkey" FOREIGN KEY ("marketRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_cropTaskId_fkey" FOREIGN KEY ("cropTaskId") REFERENCES "CropTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "CropRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "ExpertConsultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerPost" ADD CONSTRAINT "FarmerPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerPost" ADD CONSTRAINT "FarmerPost_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerPost" ADD CONSTRAINT "FarmerPost_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FarmerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "UserFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FarmerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertConsultation" ADD CONSTRAINT "ExpertConsultation_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertConsultation" ADD CONSTRAINT "ExpertConsultation_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertConsultation" ADD CONSTRAINT "ExpertConsultation_farmCropId_fkey" FOREIGN KEY ("farmCropId") REFERENCES "FarmCrop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertConsultation" ADD CONSTRAINT "ExpertConsultation_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertConsultation" ADD CONSTRAINT "ExpertConsultation_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "CropDiagnosis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
