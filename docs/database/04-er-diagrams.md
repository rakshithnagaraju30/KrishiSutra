# KrishiSutra — Entity-Relationship Diagrams

> **Generated** by `npm run db:er` (apps/api/scripts/generate-er-diagrams.ts) from the migrated
> PostgreSQL database — do not edit by hand. Cardinality comes from the real constraints:
> `||` required, `|o` optional, `o{` many, `o|` at most one (unique FK).

**Totals:** 75 tables · 249 foreign keys · 14 schema modules.
See [03 — Database Architecture](03-database-architecture.md) for the design explanation.

## Contents

- [Core overview](#core-overview)
- [MODULE 1 — User management (+ Language, shared with Module 6)](#module-1-user-management-language-shared-with-module-6)
- [Reference (lookup) data shared by all modules. Every list here is admin-managed data, not an enum.](#reference-lookup-data-shared-by-all-modules-every-list-here-is-admin-managed-data-not-an-enum)
- [MODULE 2 — Crop categories (dynamic, unlimited depth)](#module-2-crop-categories-dynamic-unlimited-depth)
- [MODULE 3 — Crops, varieties and crop requirements (verified agricultural knowledge)](#module-3-crops-varieties-and-crop-requirements-verified-agricultural-knowledge)
- [MODULE 4 — Growing procedures (versioned)](#module-4-growing-procedures-versioned)
- [MODULE 5 — Educational media, content sources and expert review](#module-5-educational-media-content-sources-and-expert-review)
- [MODULE 6 — Language and translation](#module-6-language-and-translation)
- [MODULE 7 — Farm management (farmer-owned data)](#module-7-farm-management-farmer-owned-data)
- [MODULE 8 — Crop recommendations](#module-8-crop-recommendations)
- [MODULE 9 — Farmer crop lifecycle](#module-9-farmer-crop-lifecycle)
- [MODULE 10 — Disease and pest management](#module-10-disease-and-pest-management)
- [MODULE 11 — Agricultural inputs and expenses](#module-11-agricultural-inputs-and-expenses)
- [MODULE 12 — Harvest and sales](#module-12-harvest-and-sales)
- [MODULE 13 — Notifications and community (future features).](#module-13-notifications-and-community-future-features)

## Core overview

How the main concepts connect — shared agricultural knowledge on one side, each farmer's own records
on the other, and recommendations / cultivations linking the two. (Audit references and units omitted.)
If the diagram does not render (for example in the GitHub mobile app), open [er-overview.png](er-overview.png).

```mermaid
erDiagram
    MediaAsset |o--o{ Crop : "heroImageAssetId"
    FarmCrop ||--o{ CropActivityLog : "farmCropId"
    CropTask |o--o{ CropActivityLog : "taskId"
    MediaAsset |o--o{ CropCategory : "imageAssetId"
    CropCategory ||--o{ CropCategoryMapping : "categoryId"
    Crop ||--o{ CropCategoryMapping : "cropId"
    CropActivityLog |o--o{ CropExpense : "activityLogId"
    FarmCrop ||--o{ CropExpense : "farmCropId"
    FarmPlot |o--o{ CropRecommendation : "farmPlotId"
    SoilTest |o--o{ CropRecommendation : "soilTestId"
    User ||--o{ CropRecommendation : "userId"
    Crop ||--o{ CropRecommendationItem : "cropId"
    CropVariety |o--o{ CropRecommendationItem : "cropVarietyId, cropId"
    CropRecommendation ||--o{ CropRecommendationItem : "recommendationId"
    CropRequirement |o--o{ CropRecommendationReason : "cropRequirementId"
    CropRecommendationItem ||--o{ CropRecommendationReason : "itemId"
    AgronomicParameter |o--o{ CropRecommendationReason : "parameterId"
    Crop ||--o{ CropRequirement : "cropId"
    CropVariety |o--o{ CropRequirement : "cropVarietyId, cropId"
    AgronomicParameter ||--o{ CropRequirement : "parameterId"
    FarmCrop ||--o{ CropTask : "farmCropId"
    GrowingStage |o--o{ CropTask : "growingStageId"
    StageInstruction |o--o{ CropTask : "stageInstructionId"
    Crop ||--o{ CropVariety : "cropId"
    User ||--o{ Farm : "ownerId"
    Crop ||--o{ FarmCrop : "cropId"
    CropVariety |o--o{ FarmCrop : "cropVarietyId, cropId"
    FarmPlot ||--o{ FarmCrop : "farmPlotId"
    GrowingProcedure |o--o{ FarmCrop : "growingProcedureId, cropId"
    ProcedureVersion |o--o{ FarmCrop : "procedureVersionId, growingProcedureId"
    CropRecommendationItem |o--o{ FarmCrop : "recommendationItemId"
    Farm ||--o{ FarmPlot : "farmId"
    Crop ||--o{ GrowingProcedure : "cropId"
    CropVariety |o--o{ GrowingProcedure : "cropVarietyId, cropId"
    GrowingProcedure ||--o{ GrowingStage : "procedureId"
    ProcedureVersion ||--o{ GrowingStage : "procedureVersionId, procedureId"
    FarmCrop ||--o{ HarvestRecord : "farmCropId"
    FarmPlot ||--o{ PlotWaterSource : "plotId, farmId"
    WaterSource ||--o{ PlotWaterSource : "waterSourceId, farmId"
    GrowingProcedure ||--o{ ProcedureVersion : "procedureId"
    HarvestRecord ||--o{ SalesRecord : "harvestRecordId"
    FarmPlot ||--o{ SoilTest : "plotId"
    AgronomicParameter ||--o{ SoilTestResult : "parameterId"
    SoilTest ||--o{ SoilTestResult : "soilTestId"
    GrowingStage ||--o{ StageInstruction : "stageId"
    StageInstruction |o--o{ StageMedia : "instructionId"
    MediaAsset ||--o{ StageMedia : "mediaAssetId"
    GrowingStage ||--o{ StageMedia : "stageId"
    Farm ||--o{ WaterSource : "farmId"
```

## MODULE 1 — User management (+ Language, shared with Module 6)

Schema file: `apps/api/prisma/schema/01_users.prisma` · Tables: `Language`, `User`, `Role`, `UserRole`, `ExpertProfile`, `UserFile`

```mermaid
erDiagram
    Language {
        uuid id PK
        varchar code UK
        varchar name
        varchar nativeName
        varchar script "nullable"
        bool isActive
        bool isDefault
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    User {
        uuid id PK
        varchar fullName
        varchar email UK "nullable"
        varchar phone UK "nullable"
        varchar passwordHash "nullable"
        uuid profileImageFileId FK, UK "nullable"
        uuid preferredLanguageId FK "nullable"
        AccountStatus status
        timestamptz emailVerifiedAt "nullable"
        timestamptz phoneVerifiedAt "nullable"
        timestamptz lastLoginAt "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    Role {
        uuid id PK
        varchar code UK
        varchar name
        text description "nullable"
        bool isSystem
        timestamptz createdAt
        timestamptz updatedAt
    }
    UserRole {
        uuid userId PK, FK
        uuid roleId PK, FK
        uuid assignedById FK "nullable"
        timestamptz assignedAt
    }
    ExpertProfile {
        uuid id PK
        uuid userId FK, UK
        varchar organization "nullable"
        varchar designation "nullable"
        varchar specialization "nullable"
        varchar qualification "nullable"
        varchar registrationNumber "nullable"
        uuid regionId FK "nullable"
        text bio "nullable"
        timestamptz verifiedAt "nullable"
        uuid verifiedById FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    UserFile {
        uuid id PK
        uuid ownerId FK
        UserFilePurpose purpose
        StorageProvider storageProvider
        varchar storageKey
        varchar url
        varchar mimeType
        bigint sizeBytes "nullable"
        char checksumSha256 "nullable"
        varchar originalFileName "nullable"
        timestamptz createdAt
        timestamptz deletedAt "nullable"
    }
    Region |o--o{ ExpertProfile : "regionId"
    User ||--o| ExpertProfile : "userId"
    User |o--o{ ExpertProfile : "verifiedById"
    Language |o--o{ User : "preferredLanguageId"
    UserFile |o--o| User : "profileImageFileId"
    User ||--o{ UserFile : "ownerId"
    User |o--o{ UserRole : "assignedById"
    Role ||--o{ UserRole : "roleId"
    User ||--o{ UserRole : "userId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| ExpertProfile | regionId | Region(id) | SET NULL |
| ExpertProfile | userId | User(id) | CASCADE |
| ExpertProfile | verifiedById | User(id) | SET NULL |
| User | preferredLanguageId | Language(id) | SET NULL |
| User | profileImageFileId | UserFile(id) | SET NULL |
| UserFile | ownerId | User(id) | CASCADE |
| UserRole | assignedById | User(id) | SET NULL |
| UserRole | roleId | Role(id) | RESTRICT |
| UserRole | userId | User(id) | CASCADE |

</details>

## Reference (lookup) data shared by all modules. Every list here is admin-managed data, not an enum.

Schema file: `apps/api/prisma/schema/02_reference.prisma` · Tables: `MeasurementUnit`, `Region`, `SoilType`, `Season`, `AgronomicParameter`, `WaterSourceType`, `StageType`, `CultivationMethod`

```mermaid
erDiagram
    MeasurementUnit {
        uuid id PK
        varchar code UK
        varchar name
        varchar symbol
        UnitDimension dimension
        decimal toBaseFactor "nullable"
        bool isLocal
        uuid regionId FK "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    Region {
        uuid id PK
        uuid parentId FK "nullable"
        RegionType type
        varchar name
        varchar code "nullable"
        uuid agroClimaticZoneId FK "nullable"
        decimal latitude "nullable"
        decimal longitude "nullable"
        bool isActive
        timestamptz createdAt
        timestamptz updatedAt
    }
    SoilType {
        uuid id PK
        varchar code UK
        varchar name
        text description "nullable"
        char colorHex "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    Season {
        uuid id PK
        varchar code UK
        varchar name
        text description "nullable"
        smallint typicalStartMonth "nullable"
        smallint typicalEndMonth "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    AgronomicParameter {
        uuid id PK
        varchar code UK
        varchar name
        ParameterCategory category
        uuid defaultUnitId FK "nullable"
        text description "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    WaterSourceType {
        uuid id PK
        varchar code UK
        varchar name
        text description "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    StageType {
        uuid id PK
        varchar code UK
        varchar name
        text description "nullable"
        varchar iconName "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    CultivationMethod {
        uuid id PK
        varchar code UK
        varchar name
        text description "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
    }
    MeasurementUnit |o--o{ AgronomicParameter : "defaultUnitId"
    Region |o--o{ MeasurementUnit : "regionId"
    Region |o--o{ Region : "agroClimaticZoneId"
    Region |o--o{ Region : "parentId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| AgronomicParameter | defaultUnitId | MeasurementUnit(id) | RESTRICT |
| MeasurementUnit | regionId | Region(id) | SET NULL |
| Region | agroClimaticZoneId | Region(id) | SET NULL |
| Region | parentId | Region(id) | RESTRICT |

</details>

## MODULE 2 — Crop categories (dynamic, unlimited depth)

Schema file: `apps/api/prisma/schema/03_categories.prisma` · Tables: `CropCategory`, `CropCategoryMapping`

```mermaid
erDiagram
    CropCategory {
        uuid id PK
        uuid parentId FK "nullable"
        varchar name
        varchar slug UK
        text description "nullable"
        varchar iconName "nullable"
        uuid imageAssetId FK "nullable"
        bool isActive
        smallint displayOrder
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropCategoryMapping {
        uuid cropId PK, FK
        uuid categoryId PK, FK
        bool isPrimary
        smallint displayOrder
        timestamptz createdAt
    }
    MediaAsset |o--o{ CropCategory : "imageAssetId"
    CropCategory |o--o{ CropCategory : "parentId"
    CropCategory ||--o{ CropCategoryMapping : "categoryId"
    Crop ||--o{ CropCategoryMapping : "cropId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| CropCategory | imageAssetId | MediaAsset(id) | SET NULL |
| CropCategory | parentId | CropCategory(id) | RESTRICT |
| CropCategoryMapping | categoryId | CropCategory(id) | RESTRICT |
| CropCategoryMapping | cropId | Crop(id) | CASCADE |

</details>

## MODULE 3 — Crops, varieties and crop requirements (verified agricultural knowledge)

Schema file: `apps/api/prisma/schema/04_crops.prisma` · Tables: `Crop`, `CropVariety`, `CropRequirement`, `CropSeasonMapping`, `CropSoilSuitability`, `CropRegionSuitability`, `CropEconomics`, `CropMedia`

```mermaid
erDiagram
    Crop {
        uuid id PK
        varchar commonName
        varchar scientificName "nullable"
        varchar slug UK
        text description "nullable"
        CropLifeCycle lifeCycle "nullable"
        uuid heroImageAssetId FK "nullable"
        ContentStatus status
        bool isActive
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropVariety {
        uuid id PK
        uuid cropId FK
        varchar name
        varchar slug
        varchar code "nullable"
        text description "nullable"
        varchar releasingInstitution "nullable"
        smallint releaseYear "nullable"
        bool isHybrid "nullable"
        uuid sourceId FK "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropRequirement {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid regionId FK "nullable"
        uuid seasonId FK "nullable"
        uuid parameterId FK
        decimal minValue "nullable"
        decimal maxValue "nullable"
        decimal optimalMinValue "nullable"
        decimal optimalMaxValue "nullable"
        uuid unitId FK "nullable"
        QualitativeLevel level "nullable"
        RequirementImportance importance
        text notes "nullable"
        uuid sourceId FK "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropSeasonMapping {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid seasonId FK
        uuid regionId FK "nullable"
        smallint sowingStartMonth "nullable"
        smallint sowingEndMonth "nullable"
        text notes "nullable"
        uuid sourceId FK "nullable"
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropSoilSuitability {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid soilTypeId FK
        SuitabilityLevel suitability
        text notes "nullable"
        uuid sourceId FK "nullable"
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropRegionSuitability {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid regionId FK
        SuitabilityLevel suitability
        text notes "nullable"
        uuid sourceId FK "nullable"
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropEconomics {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid regionId FK "nullable"
        uuid seasonId FK "nullable"
        smallint referenceYear
        uuid areaUnitId FK
        decimal costOfCultivationMin "nullable"
        decimal costOfCultivationMax "nullable"
        char currency
        decimal yieldMin "nullable"
        decimal yieldMax "nullable"
        uuid yieldUnitId FK "nullable"
        text notes "nullable"
        uuid sourceId FK
        ContentStatus status
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropMedia {
        uuid cropId PK, FK
        uuid mediaAssetId PK, FK
        smallint sequence
        varchar caption "nullable"
        timestamptz createdAt
    }
    MediaAsset |o--o{ Crop : "heroImageAssetId"
    Crop ||--o{ CropEconomics : "cropId"
    CropVariety |o--o{ CropEconomics : "cropVarietyId, cropId"
    Region |o--o{ CropEconomics : "regionId"
    Season |o--o{ CropEconomics : "seasonId"
    Crop ||--o{ CropMedia : "cropId"
    MediaAsset ||--o{ CropMedia : "mediaAssetId"
    Crop ||--o{ CropRegionSuitability : "cropId"
    CropVariety |o--o{ CropRegionSuitability : "cropVarietyId, cropId"
    Region ||--o{ CropRegionSuitability : "regionId"
    Crop ||--o{ CropRequirement : "cropId"
    CropVariety |o--o{ CropRequirement : "cropVarietyId, cropId"
    AgronomicParameter ||--o{ CropRequirement : "parameterId"
    Region |o--o{ CropRequirement : "regionId"
    Season |o--o{ CropRequirement : "seasonId"
    Crop ||--o{ CropSeasonMapping : "cropId"
    CropVariety |o--o{ CropSeasonMapping : "cropVarietyId, cropId"
    Region |o--o{ CropSeasonMapping : "regionId"
    Season ||--o{ CropSeasonMapping : "seasonId"
    Crop ||--o{ CropSoilSuitability : "cropId"
    CropVariety |o--o{ CropSoilSuitability : "cropVarietyId, cropId"
    SoilType ||--o{ CropSoilSuitability : "soilTypeId"
    Crop ||--o{ CropVariety : "cropId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| Crop | heroImageAssetId | MediaAsset(id) | SET NULL |
| CropEconomics | areaUnitId | MeasurementUnit(id) | RESTRICT |
| CropEconomics | cropId | Crop(id) | RESTRICT |
| CropEconomics | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| CropEconomics | regionId | Region(id) | RESTRICT |
| CropEconomics | seasonId | Season(id) | RESTRICT |
| CropEconomics | sourceId | ContentSource(id) | RESTRICT |
| CropEconomics | yieldUnitId | MeasurementUnit(id) | RESTRICT |
| CropMedia | cropId | Crop(id) | CASCADE |
| CropMedia | mediaAssetId | MediaAsset(id) | RESTRICT |
| CropRegionSuitability | cropId | Crop(id) | CASCADE |
| CropRegionSuitability | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| CropRegionSuitability | regionId | Region(id) | RESTRICT |
| CropRegionSuitability | sourceId | ContentSource(id) | RESTRICT |
| CropRequirement | cropId | Crop(id) | RESTRICT |
| CropRequirement | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| CropRequirement | parameterId | AgronomicParameter(id) | RESTRICT |
| CropRequirement | regionId | Region(id) | RESTRICT |
| CropRequirement | seasonId | Season(id) | RESTRICT |
| CropRequirement | sourceId | ContentSource(id) | RESTRICT |
| CropRequirement | unitId | MeasurementUnit(id) | RESTRICT |
| CropSeasonMapping | cropId | Crop(id) | CASCADE |
| CropSeasonMapping | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| CropSeasonMapping | regionId | Region(id) | RESTRICT |
| CropSeasonMapping | seasonId | Season(id) | RESTRICT |
| CropSeasonMapping | sourceId | ContentSource(id) | RESTRICT |
| CropSoilSuitability | cropId | Crop(id) | CASCADE |
| CropSoilSuitability | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| CropSoilSuitability | soilTypeId | SoilType(id) | RESTRICT |
| CropSoilSuitability | sourceId | ContentSource(id) | RESTRICT |
| CropVariety | cropId | Crop(id) | RESTRICT |
| CropVariety | sourceId | ContentSource(id) | RESTRICT |

</details>

## MODULE 4 — Growing procedures (versioned)

Schema file: `apps/api/prisma/schema/05_procedures.prisma` · Tables: `GrowingProcedure`, `ProcedureVersion`, `GrowingStage`, `StageInstruction`, `StageResource`, `StageCommonMistake`

```mermaid
erDiagram
    GrowingProcedure {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid regionId FK "nullable"
        uuid seasonId FK "nullable"
        uuid cultivationMethodId FK "nullable"
        varchar name
        varchar slug
        text description "nullable"
        bool isDefault
        ContentStatus status
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    ProcedureVersion {
        uuid id PK
        uuid procedureId FK
        integer versionNumber
        ProcedureVersionStatus status
        text changeSummary "nullable"
        VerificationStatus verificationStatus
        uuid sourceId FK "nullable"
        uuid createdById FK "nullable"
        uuid approvedById FK "nullable"
        timestamptz submittedAt "nullable"
        timestamptz approvedAt "nullable"
        timestamptz publishedAt "nullable"
        timestamptz supersededAt "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    GrowingStage {
        uuid id PK
        uuid procedureVersionId FK
        uuid procedureId FK
        uuid stageTypeId FK "nullable"
        smallint sequence
        varchar title
        text description "nullable"
        smallint startDay "nullable"
        smallint endDay "nullable"
        StageDayAnchor dayAnchor
        bool isContinuous
        bool isOptional
        timestamptz createdAt
        timestamptz updatedAt
    }
    StageInstruction {
        uuid id PK
        uuid stageId FK
        smallint sequence
        varchar title
        text description
        InstructionType instructionType
        decimal durationValue "nullable"
        uuid durationUnitId FK "nullable"
        SafetyLevel safetyLevel
        text safetyInfo "nullable"
        uuid sourceId FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    StageResource {
        uuid id PK
        uuid stageId FK
        uuid instructionId FK "nullable"
        StageResourceType resourceType
        varchar name
        text description "nullable"
        uuid farmInputId FK "nullable"
        bool isOptional
        smallint sequence
        timestamptz createdAt
        timestamptz updatedAt
    }
    StageCommonMistake {
        uuid id PK
        uuid stageId FK
        smallint sequence
        varchar title
        text consequence "nullable"
        text prevention "nullable"
        uuid sourceId FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    Crop ||--o{ GrowingProcedure : "cropId"
    CropVariety |o--o{ GrowingProcedure : "cropVarietyId, cropId"
    CultivationMethod |o--o{ GrowingProcedure : "cultivationMethodId"
    Region |o--o{ GrowingProcedure : "regionId"
    Season |o--o{ GrowingProcedure : "seasonId"
    GrowingProcedure ||--o{ GrowingStage : "procedureId"
    ProcedureVersion ||--o{ GrowingStage : "procedureVersionId, procedureId"
    StageType |o--o{ GrowingStage : "stageTypeId"
    GrowingProcedure ||--o{ ProcedureVersion : "procedureId"
    GrowingStage ||--o{ StageCommonMistake : "stageId"
    GrowingStage ||--o{ StageInstruction : "stageId"
    FarmInput |o--o{ StageResource : "farmInputId"
    StageInstruction |o--o{ StageResource : "instructionId"
    GrowingStage ||--o{ StageResource : "stageId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| GrowingProcedure | cropId | Crop(id) | RESTRICT |
| GrowingProcedure | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| GrowingProcedure | cultivationMethodId | CultivationMethod(id) | RESTRICT |
| GrowingProcedure | regionId | Region(id) | RESTRICT |
| GrowingProcedure | seasonId | Season(id) | RESTRICT |
| GrowingStage | procedureId | GrowingProcedure(id) | CASCADE |
| GrowingStage | procedureVersionId, procedureId | ProcedureVersion(id, procedureId) | CASCADE |
| GrowingStage | stageTypeId | StageType(id) | RESTRICT |
| ProcedureVersion | approvedById | User(id) | SET NULL |
| ProcedureVersion | createdById | User(id) | SET NULL |
| ProcedureVersion | procedureId | GrowingProcedure(id) | CASCADE |
| ProcedureVersion | sourceId | ContentSource(id) | RESTRICT |
| StageCommonMistake | sourceId | ContentSource(id) | RESTRICT |
| StageCommonMistake | stageId | GrowingStage(id) | CASCADE |
| StageInstruction | durationUnitId | MeasurementUnit(id) | RESTRICT |
| StageInstruction | sourceId | ContentSource(id) | RESTRICT |
| StageInstruction | stageId | GrowingStage(id) | CASCADE |
| StageResource | farmInputId | FarmInput(id) | SET NULL |
| StageResource | instructionId | StageInstruction(id) | SET NULL |
| StageResource | stageId | GrowingStage(id) | CASCADE |

</details>

## MODULE 5 — Educational media, content sources and expert review

Schema file: `apps/api/prisma/schema/06_media_content.prisma` · Tables: `ContentSource`, `MediaAsset`, `StageMedia`, `ContentReview`

```mermaid
erDiagram
    ContentSource {
        uuid id PK
        SourceType sourceType
        varchar title
        varchar organization "nullable"
        varchar authors "nullable"
        smallint publicationYear "nullable"
        varchar url "nullable"
        varchar identifier "nullable"
        uuid regionId FK "nullable"
        LicenseType licenseType
        text notes "nullable"
        bool isActive
        timestamptz createdAt
        timestamptz updatedAt
    }
    MediaAsset {
        uuid id PK
        MediaType mediaType
        varchar title
        text description "nullable"
        StorageProvider storageProvider
        varchar storageKey "nullable"
        varchar url
        varchar thumbnailUrl "nullable"
        varchar mimeType "nullable"
        bigint fileSizeBytes "nullable"
        integer durationSeconds "nullable"
        integer widthPx "nullable"
        integer heightPx "nullable"
        uuid languageId FK "nullable"
        uuid sourceId FK "nullable"
        LicenseType licenseType
        text licenseDetails "nullable"
        varchar attributionText "nullable"
        varchar permissionReference "nullable"
        char checksumSha256 "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        uuid uploadedById FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    StageMedia {
        uuid id PK
        uuid stageId FK
        uuid mediaAssetId FK
        uuid instructionId FK "nullable"
        StageMediaPurpose purpose
        smallint sequence
        bool isPrimary
        varchar caption "nullable"
        timestamptz createdAt
    }
    ContentReview {
        uuid id PK
        uuid reviewerId FK "nullable"
        ReviewDecision decision
        text comments "nullable"
        timestamptz reviewedAt
        uuid procedureVersionId FK "nullable"
        uuid mediaAssetId FK "nullable"
        uuid cropRequirementId FK "nullable"
        uuid cropVarietyId FK "nullable"
        uuid cropEconomicsId FK "nullable"
        uuid diseaseTreatmentId FK "nullable"
        uuid inputRecommendationId FK "nullable"
        uuid translationId FK "nullable"
    }
    MediaAsset |o--o{ ContentReview : "mediaAssetId"
    Region |o--o{ ContentSource : "regionId"
    ContentSource |o--o{ MediaAsset : "sourceId"
    StageInstruction |o--o{ StageMedia : "instructionId"
    MediaAsset ||--o{ StageMedia : "mediaAssetId"
    GrowingStage ||--o{ StageMedia : "stageId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| ContentReview | cropEconomicsId | CropEconomics(id) | CASCADE |
| ContentReview | cropRequirementId | CropRequirement(id) | CASCADE |
| ContentReview | cropVarietyId | CropVariety(id) | CASCADE |
| ContentReview | diseaseTreatmentId | DiseaseTreatment(id) | CASCADE |
| ContentReview | inputRecommendationId | InputRecommendation(id) | CASCADE |
| ContentReview | mediaAssetId | MediaAsset(id) | CASCADE |
| ContentReview | procedureVersionId | ProcedureVersion(id) | CASCADE |
| ContentReview | reviewerId | User(id) | SET NULL |
| ContentReview | translationId | Translation(id) | CASCADE |
| ContentSource | regionId | Region(id) | SET NULL |
| MediaAsset | languageId | Language(id) | RESTRICT |
| MediaAsset | sourceId | ContentSource(id) | RESTRICT |
| MediaAsset | uploadedById | User(id) | SET NULL |
| StageMedia | instructionId | StageInstruction(id) | SET NULL |
| StageMedia | mediaAssetId | MediaAsset(id) | RESTRICT |
| StageMedia | stageId | GrowingStage(id) | CASCADE |

</details>

## MODULE 6 — Language and translation

Schema file: `apps/api/prisma/schema/07_translation.prisma` · Tables: `Translation`

```mermaid
erDiagram
    Translation {
        uuid id PK
        uuid languageId FK
        TranslatableField field
        text value
        TranslationStatus status
        uuid reviewedById FK "nullable"
        timestamptz reviewedAt "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        uuid cropCategoryId FK "nullable"
        uuid cropId FK "nullable"
        uuid cropVarietyId FK "nullable"
        uuid growingProcedureId FK "nullable"
        uuid growingStageId FK "nullable"
        uuid stageInstructionId FK "nullable"
        uuid stageResourceId FK "nullable"
        uuid stageCommonMistakeId FK "nullable"
        uuid mediaAssetId FK "nullable"
        uuid soilTypeId FK "nullable"
        uuid seasonId FK "nullable"
        uuid regionId FK "nullable"
        uuid agronomicParameterId FK "nullable"
        uuid waterSourceTypeId FK "nullable"
        uuid stageTypeId FK "nullable"
        uuid cultivationMethodId FK "nullable"
        uuid cropDiseaseId FK "nullable"
        uuid cropPestId FK "nullable"
        uuid diseaseSymptomId FK "nullable"
        uuid diseaseTreatmentId FK "nullable"
    }

```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| Translation | agronomicParameterId | AgronomicParameter(id) | CASCADE |
| Translation | cropCategoryId | CropCategory(id) | CASCADE |
| Translation | cropDiseaseId | CropDisease(id) | CASCADE |
| Translation | cropId | Crop(id) | CASCADE |
| Translation | cropPestId | CropPest(id) | CASCADE |
| Translation | cropVarietyId | CropVariety(id) | CASCADE |
| Translation | cultivationMethodId | CultivationMethod(id) | CASCADE |
| Translation | diseaseSymptomId | DiseaseSymptom(id) | CASCADE |
| Translation | diseaseTreatmentId | DiseaseTreatment(id) | CASCADE |
| Translation | growingProcedureId | GrowingProcedure(id) | CASCADE |
| Translation | growingStageId | GrowingStage(id) | CASCADE |
| Translation | languageId | Language(id) | RESTRICT |
| Translation | mediaAssetId | MediaAsset(id) | CASCADE |
| Translation | regionId | Region(id) | CASCADE |
| Translation | reviewedById | User(id) | SET NULL |
| Translation | seasonId | Season(id) | CASCADE |
| Translation | soilTypeId | SoilType(id) | CASCADE |
| Translation | stageCommonMistakeId | StageCommonMistake(id) | CASCADE |
| Translation | stageInstructionId | StageInstruction(id) | CASCADE |
| Translation | stageResourceId | StageResource(id) | CASCADE |
| Translation | stageTypeId | StageType(id) | CASCADE |
| Translation | waterSourceTypeId | WaterSourceType(id) | CASCADE |

</details>

## MODULE 7 — Farm management (farmer-owned data)

Schema file: `apps/api/prisma/schema/08_farms.prisma` · Tables: `Farm`, `FarmPlot`, `WaterSource`, `PlotWaterSource`, `SoilTest`, `SoilTestResult`

```mermaid
erDiagram
    Farm {
        uuid id PK
        uuid ownerId FK
        varchar name
        uuid regionId FK "nullable"
        varchar state "nullable"
        varchar district "nullable"
        varchar taluk "nullable"
        varchar village "nullable"
        varchar addressLine "nullable"
        varchar pincode "nullable"
        decimal latitude "nullable"
        decimal longitude "nullable"
        decimal totalArea "nullable"
        uuid totalAreaUnitId FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    FarmPlot {
        uuid id PK
        uuid farmId FK
        varchar name
        varchar surveyNumber "nullable"
        decimal area
        uuid areaUnitId FK
        uuid soilTypeId FK "nullable"
        IrrigationMethod irrigationMethod "nullable"
        LandTenure landTenure "nullable"
        decimal latitude "nullable"
        decimal longitude "nullable"
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    WaterSource {
        uuid id PK
        uuid farmId FK
        uuid waterSourceTypeId FK
        varchar name "nullable"
        WaterAvailability availability
        int2_array availableMonths "nullable"
        decimal estimatedYield "nullable"
        uuid yieldUnitId FK "nullable"
        decimal depthMetres "nullable"
        bool isShared
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    PlotWaterSource {
        uuid plotId PK, FK
        uuid waterSourceId PK, FK
        uuid farmId FK
        bool isPrimary
        timestamptz createdAt
    }
    SoilTest {
        uuid id PK
        uuid plotId FK
        date testDate
        SoilTestSource source
        varchar laboratoryName "nullable"
        varchar laboratoryCode "nullable"
        varchar sampleId "nullable"
        varchar reportNumber "nullable"
        uuid reportFileId FK "nullable"
        bool isUserConfirmed
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    SoilTestResult {
        uuid id PK
        uuid soilTestId FK
        uuid parameterId FK
        decimal value
        uuid unitId FK
        QualitativeLevel rating "nullable"
        varchar method "nullable"
        timestamptz createdAt
    }
    User ||--o{ Farm : "ownerId"
    Region |o--o{ Farm : "regionId"
    Farm ||--o{ FarmPlot : "farmId"
    SoilType |o--o{ FarmPlot : "soilTypeId"
    FarmPlot ||--o{ PlotWaterSource : "plotId, farmId"
    WaterSource ||--o{ PlotWaterSource : "waterSourceId, farmId"
    FarmPlot ||--o{ SoilTest : "plotId"
    UserFile |o--o{ SoilTest : "reportFileId"
    AgronomicParameter ||--o{ SoilTestResult : "parameterId"
    SoilTest ||--o{ SoilTestResult : "soilTestId"
    Farm ||--o{ WaterSource : "farmId"
    WaterSourceType ||--o{ WaterSource : "waterSourceTypeId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| Farm | ownerId | User(id) | CASCADE |
| Farm | regionId | Region(id) | SET NULL |
| Farm | totalAreaUnitId | MeasurementUnit(id) | RESTRICT |
| FarmPlot | areaUnitId | MeasurementUnit(id) | RESTRICT |
| FarmPlot | farmId | Farm(id) | CASCADE |
| FarmPlot | soilTypeId | SoilType(id) | RESTRICT |
| PlotWaterSource | plotId, farmId | FarmPlot(id, farmId) | CASCADE |
| PlotWaterSource | waterSourceId, farmId | WaterSource(id, farmId) | CASCADE |
| SoilTest | plotId | FarmPlot(id) | CASCADE |
| SoilTest | reportFileId | UserFile(id) | SET NULL |
| SoilTestResult | parameterId | AgronomicParameter(id) | RESTRICT |
| SoilTestResult | soilTestId | SoilTest(id) | CASCADE |
| SoilTestResult | unitId | MeasurementUnit(id) | RESTRICT |
| WaterSource | farmId | Farm(id) | CASCADE |
| WaterSource | waterSourceTypeId | WaterSourceType(id) | RESTRICT |
| WaterSource | yieldUnitId | MeasurementUnit(id) | RESTRICT |

</details>

## MODULE 8 — Crop recommendations

Schema file: `apps/api/prisma/schema/09_recommendations.prisma` · Tables: `WeatherSnapshot`, `CropRecommendation`, `CropRecommendationWeather`, `CropRecommendationItem`, `CropRecommendationReason`

```mermaid
erDiagram
    WeatherSnapshot {
        uuid id PK
        WeatherProvider provider
        WeatherSnapshotType snapshotType
        decimal latitude
        decimal longitude
        uuid regionId FK "nullable"
        timestamptz periodStart
        timestamptz periodEnd
        timestamptz fetchedAt
        decimal temperatureMinC "nullable"
        decimal temperatureMaxC "nullable"
        decimal temperatureMeanC "nullable"
        decimal rainfallMm "nullable"
        decimal relativeHumidityPct "nullable"
        decimal windSpeedKmph "nullable"
        jsonb rawPayload "nullable"
        timestamptz createdAt
    }
    CropRecommendation {
        uuid id PK
        uuid userId FK
        uuid farmPlotId FK "nullable"
        uuid seasonId FK "nullable"
        uuid regionId FK "nullable"
        uuid soilTypeId FK "nullable"
        uuid soilTestId FK "nullable"
        decimal latitude "nullable"
        decimal longitude "nullable"
        decimal budgetAmount "nullable"
        char budgetCurrency
        timestamptz recommendationDate
        RecommendationStatus status
        varchar ruleSetVersion
        text explanation "nullable"
        decimal dataCompletenessPct "nullable"
        text_array missingInputs "nullable"
        jsonb inputSnapshot
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropRecommendationWeather {
        uuid recommendationId PK, FK
        uuid weatherSnapshotId PK, FK
    }
    CropRecommendationItem {
        uuid id PK
        uuid recommendationId FK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        smallint rank
        SuitabilityLevel suitabilityLevel
        decimal suitabilityScore "nullable"
        varchar scoringMethod "nullable"
        text summary "nullable"
        uuid cropEconomicsId FK "nullable"
        decimal areaValue "nullable"
        uuid areaUnitId FK "nullable"
        decimal estimatedInvestmentMin "nullable"
        decimal estimatedInvestmentMax "nullable"
        char currency
        decimal expectedYieldMin "nullable"
        decimal expectedYieldMax "nullable"
        uuid yieldUnitId FK "nullable"
        timestamptz createdAt
    }
    CropRecommendationReason {
        uuid id PK
        uuid itemId FK
        ReasonKind kind
        varchar criterionCode
        CriterionResult result
        varchar reasonCode
        text message "nullable"
        varchar observedValue "nullable"
        varchar requiredValue "nullable"
        uuid parameterId FK "nullable"
        uuid cropRequirementId FK "nullable"
        uuid sourceId FK "nullable"
        smallint sequence
        timestamptz createdAt
    }
    FarmPlot |o--o{ CropRecommendation : "farmPlotId"
    Region |o--o{ CropRecommendation : "regionId"
    Season |o--o{ CropRecommendation : "seasonId"
    SoilTest |o--o{ CropRecommendation : "soilTestId"
    SoilType |o--o{ CropRecommendation : "soilTypeId"
    User ||--o{ CropRecommendation : "userId"
    CropEconomics |o--o{ CropRecommendationItem : "cropEconomicsId"
    Crop ||--o{ CropRecommendationItem : "cropId"
    CropVariety |o--o{ CropRecommendationItem : "cropVarietyId, cropId"
    CropRecommendation ||--o{ CropRecommendationItem : "recommendationId"
    CropRequirement |o--o{ CropRecommendationReason : "cropRequirementId"
    CropRecommendationItem ||--o{ CropRecommendationReason : "itemId"
    AgronomicParameter |o--o{ CropRecommendationReason : "parameterId"
    CropRecommendation ||--o{ CropRecommendationWeather : "recommendationId"
    WeatherSnapshot ||--o{ CropRecommendationWeather : "weatherSnapshotId"
    Region |o--o{ WeatherSnapshot : "regionId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| CropRecommendation | farmPlotId | FarmPlot(id) | SET NULL |
| CropRecommendation | regionId | Region(id) | SET NULL |
| CropRecommendation | seasonId | Season(id) | RESTRICT |
| CropRecommendation | soilTestId | SoilTest(id) | SET NULL |
| CropRecommendation | soilTypeId | SoilType(id) | RESTRICT |
| CropRecommendation | userId | User(id) | CASCADE |
| CropRecommendationItem | areaUnitId | MeasurementUnit(id) | RESTRICT |
| CropRecommendationItem | cropEconomicsId | CropEconomics(id) | RESTRICT |
| CropRecommendationItem | cropId | Crop(id) | RESTRICT |
| CropRecommendationItem | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| CropRecommendationItem | recommendationId | CropRecommendation(id) | CASCADE |
| CropRecommendationItem | yieldUnitId | MeasurementUnit(id) | RESTRICT |
| CropRecommendationReason | cropRequirementId | CropRequirement(id) | SET NULL |
| CropRecommendationReason | itemId | CropRecommendationItem(id) | CASCADE |
| CropRecommendationReason | parameterId | AgronomicParameter(id) | SET NULL |
| CropRecommendationReason | sourceId | ContentSource(id) | SET NULL |
| CropRecommendationWeather | recommendationId | CropRecommendation(id) | CASCADE |
| CropRecommendationWeather | weatherSnapshotId | WeatherSnapshot(id) | RESTRICT |
| WeatherSnapshot | regionId | Region(id) | SET NULL |

</details>

## MODULE 9 — Farmer crop lifecycle

Schema file: `apps/api/prisma/schema/10_lifecycle.prisma` · Tables: `FarmCrop`, `CropTask`, `TaskReminder`, `CropActivityLog`, `CropObservation`, `CropObservationFile`, `IrrigationLog`

```mermaid
erDiagram
    FarmCrop {
        uuid id PK
        uuid farmPlotId FK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid growingProcedureId FK "nullable"
        uuid procedureVersionId FK "nullable"
        uuid seasonId FK "nullable"
        uuid recommendationItemId FK "nullable"
        varchar label "nullable"
        date plantingDate "nullable"
        date expectedHarvestDate "nullable"
        date actualHarvestDate "nullable"
        decimal cultivatedArea
        uuid areaUnitId FK
        CultivationStatus status
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropTask {
        uuid id PK
        uuid farmCropId FK
        uuid growingStageId FK "nullable"
        uuid stageInstructionId FK "nullable"
        varchar title
        text description "nullable"
        integer sequence
        bool isCustom
        TaskStatus status
        date scheduledStartDate "nullable"
        date dueDate "nullable"
        date postponedFromDate "nullable"
        timestamptz completedAt "nullable"
        text skippedReason "nullable"
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    TaskReminder {
        uuid id PK
        uuid taskId FK
        timestamptz remindAt
        NotificationChannel channel
        ReminderStatus status
        timestamptz sentAt "nullable"
        text failureReason "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropActivityLog {
        uuid id PK
        uuid farmCropId FK
        uuid taskId FK "nullable"
        ActivityType activityType
        date activityDate
        varchar title "nullable"
        text description "nullable"
        uuid performedById FK "nullable"
        smallint labourCount "nullable"
        decimal labourHours "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropObservation {
        uuid id PK
        uuid farmCropId FK
        uuid growingStageId FK "nullable"
        timestamptz observedAt
        ObservationType observationType
        Severity severity "nullable"
        decimal affectedAreaPct "nullable"
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropObservationFile {
        uuid observationId PK, FK
        uuid fileId PK, FK
        smallint sequence
    }
    IrrigationLog {
        uuid id PK
        uuid activityLogId FK, UK
        uuid waterSourceId FK "nullable"
        IrrigationMethod method "nullable"
        integer durationMinutes "nullable"
        decimal waterQuantity "nullable"
        uuid waterUnitId FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    FarmCrop ||--o{ CropActivityLog : "farmCropId"
    CropTask |o--o{ CropActivityLog : "taskId"
    FarmCrop ||--o{ CropObservation : "farmCropId"
    GrowingStage |o--o{ CropObservation : "growingStageId"
    UserFile ||--o{ CropObservationFile : "fileId"
    CropObservation ||--o{ CropObservationFile : "observationId"
    FarmCrop ||--o{ CropTask : "farmCropId"
    GrowingStage |o--o{ CropTask : "growingStageId"
    StageInstruction |o--o{ CropTask : "stageInstructionId"
    Crop ||--o{ FarmCrop : "cropId"
    CropVariety |o--o{ FarmCrop : "cropVarietyId, cropId"
    FarmPlot ||--o{ FarmCrop : "farmPlotId"
    GrowingProcedure |o--o{ FarmCrop : "growingProcedureId, cropId"
    ProcedureVersion |o--o{ FarmCrop : "procedureVersionId, growingProcedureId"
    CropRecommendationItem |o--o{ FarmCrop : "recommendationItemId"
    Season |o--o{ FarmCrop : "seasonId"
    CropActivityLog ||--o| IrrigationLog : "activityLogId"
    WaterSource |o--o{ IrrigationLog : "waterSourceId"
    CropTask ||--o{ TaskReminder : "taskId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| CropActivityLog | farmCropId | FarmCrop(id) | CASCADE |
| CropActivityLog | performedById | User(id) | SET NULL |
| CropActivityLog | taskId | CropTask(id) | SET NULL |
| CropObservation | farmCropId | FarmCrop(id) | CASCADE |
| CropObservation | growingStageId | GrowingStage(id) | RESTRICT |
| CropObservationFile | fileId | UserFile(id) | CASCADE |
| CropObservationFile | observationId | CropObservation(id) | CASCADE |
| CropTask | farmCropId | FarmCrop(id) | CASCADE |
| CropTask | growingStageId | GrowingStage(id) | RESTRICT |
| CropTask | stageInstructionId | StageInstruction(id) | RESTRICT |
| FarmCrop | areaUnitId | MeasurementUnit(id) | RESTRICT |
| FarmCrop | cropId | Crop(id) | RESTRICT |
| FarmCrop | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| FarmCrop | farmPlotId | FarmPlot(id) | CASCADE |
| FarmCrop | growingProcedureId, cropId | GrowingProcedure(id, cropId) | RESTRICT |
| FarmCrop | procedureVersionId, growingProcedureId | ProcedureVersion(id, procedureId) | RESTRICT |
| FarmCrop | recommendationItemId | CropRecommendationItem(id) | SET NULL |
| FarmCrop | seasonId | Season(id) | RESTRICT |
| IrrigationLog | activityLogId | CropActivityLog(id) | CASCADE |
| IrrigationLog | waterSourceId | WaterSource(id) | SET NULL |
| IrrigationLog | waterUnitId | MeasurementUnit(id) | RESTRICT |
| TaskReminder | taskId | CropTask(id) | CASCADE |

</details>

## MODULE 10 — Disease and pest management

Schema file: `apps/api/prisma/schema/11_pests_diseases.prisma` · Tables: `CropDisease`, `CropPest`, `CropDiseaseMapping`, `CropPestMapping`, `DiseaseSymptom`, `DiseaseSymptomMedia`, `DiseaseTreatment`, `CropDiagnosis`, `CropDiagnosisFile`, `DiagnosisAiCandidate`

```mermaid
erDiagram
    CropDisease {
        uuid id PK
        varchar name
        varchar slug UK
        varchar causalOrganism "nullable"
        PathogenType pathogenType "nullable"
        text description "nullable"
        uuid heroImageAssetId FK "nullable"
        uuid sourceId FK "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropPest {
        uuid id PK
        varchar commonName
        varchar slug UK
        varchar scientificName "nullable"
        PestType pestType "nullable"
        text description "nullable"
        uuid heroImageAssetId FK "nullable"
        uuid sourceId FK "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropDiseaseMapping {
        uuid cropId PK, FK
        uuid diseaseId PK, FK
        uuid susceptibleStageTypeId FK "nullable"
        text notes "nullable"
        uuid sourceId FK "nullable"
        timestamptz createdAt
    }
    CropPestMapping {
        uuid cropId PK, FK
        uuid pestId PK, FK
        uuid susceptibleStageTypeId FK "nullable"
        text notes "nullable"
        uuid sourceId FK "nullable"
        timestamptz createdAt
    }
    DiseaseSymptom {
        uuid id PK
        uuid diseaseId FK "nullable"
        uuid pestId FK "nullable"
        PlantPart plantPart "nullable"
        text description
        smallint sequence
        timestamptz createdAt
        timestamptz updatedAt
    }
    DiseaseSymptomMedia {
        uuid symptomId PK, FK
        uuid mediaAssetId PK, FK
        smallint sequence
    }
    DiseaseTreatment {
        uuid id PK
        uuid diseaseId FK "nullable"
        uuid pestId FK "nullable"
        TreatmentType treatmentType
        varchar title
        text description
        uuid farmInputId FK "nullable"
        decimal doseValue "nullable"
        uuid doseUnitId FK "nullable"
        QuantityBasis doseBasis "nullable"
        ApplicationMethod applicationMethod "nullable"
        smallint preHarvestIntervalDays "nullable"
        text safetyPrecautions "nullable"
        varchar regulatoryReference "nullable"
        uuid sourceId FK "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        uuid approvedById FK "nullable"
        timestamptz approvedAt "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropDiagnosis {
        uuid id PK
        uuid requestedById FK
        uuid farmCropId FK "nullable"
        uuid cropId FK "nullable"
        uuid observationId FK "nullable"
        text description "nullable"
        DiagnosisStatus status
        uuid confirmedDiseaseId FK "nullable"
        uuid confirmedPestId FK "nullable"
        uuid confirmedById FK "nullable"
        timestamptz confirmedAt "nullable"
        text expertNotes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropDiagnosisFile {
        uuid diagnosisId PK, FK
        uuid fileId PK, FK
        smallint sequence
    }
    DiagnosisAiCandidate {
        uuid id PK
        uuid diagnosisId FK
        varchar modelName
        varchar modelVersion
        smallint rank
        uuid diseaseId FK "nullable"
        uuid pestId FK "nullable"
        varchar labelText "nullable"
        decimal confidence
        jsonb rawOutput "nullable"
        timestamptz createdAt
    }
    CropDisease |o--o{ CropDiagnosis : "confirmedDiseaseId"
    CropPest |o--o{ CropDiagnosis : "confirmedPestId"
    Crop |o--o{ CropDiagnosis : "cropId"
    FarmCrop |o--o{ CropDiagnosis : "farmCropId"
    CropObservation |o--o{ CropDiagnosis : "observationId"
    User ||--o{ CropDiagnosis : "requestedById"
    CropDiagnosis ||--o{ CropDiagnosisFile : "diagnosisId"
    UserFile ||--o{ CropDiagnosisFile : "fileId"
    MediaAsset |o--o{ CropDisease : "heroImageAssetId"
    Crop ||--o{ CropDiseaseMapping : "cropId"
    CropDisease ||--o{ CropDiseaseMapping : "diseaseId"
    StageType |o--o{ CropDiseaseMapping : "susceptibleStageTypeId"
    MediaAsset |o--o{ CropPest : "heroImageAssetId"
    Crop ||--o{ CropPestMapping : "cropId"
    CropPest ||--o{ CropPestMapping : "pestId"
    StageType |o--o{ CropPestMapping : "susceptibleStageTypeId"
    CropDiagnosis ||--o{ DiagnosisAiCandidate : "diagnosisId"
    CropDisease |o--o{ DiagnosisAiCandidate : "diseaseId"
    CropPest |o--o{ DiagnosisAiCandidate : "pestId"
    CropDisease |o--o{ DiseaseSymptom : "diseaseId"
    CropPest |o--o{ DiseaseSymptom : "pestId"
    MediaAsset ||--o{ DiseaseSymptomMedia : "mediaAssetId"
    DiseaseSymptom ||--o{ DiseaseSymptomMedia : "symptomId"
    CropDisease |o--o{ DiseaseTreatment : "diseaseId"
    FarmInput |o--o{ DiseaseTreatment : "farmInputId"
    CropPest |o--o{ DiseaseTreatment : "pestId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| CropDiagnosis | confirmedById | User(id) | SET NULL |
| CropDiagnosis | confirmedDiseaseId | CropDisease(id) | SET NULL |
| CropDiagnosis | confirmedPestId | CropPest(id) | SET NULL |
| CropDiagnosis | cropId | Crop(id) | SET NULL |
| CropDiagnosis | farmCropId | FarmCrop(id) | SET NULL |
| CropDiagnosis | observationId | CropObservation(id) | SET NULL |
| CropDiagnosis | requestedById | User(id) | CASCADE |
| CropDiagnosisFile | diagnosisId | CropDiagnosis(id) | CASCADE |
| CropDiagnosisFile | fileId | UserFile(id) | CASCADE |
| CropDisease | heroImageAssetId | MediaAsset(id) | SET NULL |
| CropDisease | sourceId | ContentSource(id) | RESTRICT |
| CropDiseaseMapping | cropId | Crop(id) | CASCADE |
| CropDiseaseMapping | diseaseId | CropDisease(id) | CASCADE |
| CropDiseaseMapping | sourceId | ContentSource(id) | RESTRICT |
| CropDiseaseMapping | susceptibleStageTypeId | StageType(id) | SET NULL |
| CropPest | heroImageAssetId | MediaAsset(id) | SET NULL |
| CropPest | sourceId | ContentSource(id) | RESTRICT |
| CropPestMapping | cropId | Crop(id) | CASCADE |
| CropPestMapping | pestId | CropPest(id) | CASCADE |
| CropPestMapping | sourceId | ContentSource(id) | RESTRICT |
| CropPestMapping | susceptibleStageTypeId | StageType(id) | SET NULL |
| DiagnosisAiCandidate | diagnosisId | CropDiagnosis(id) | CASCADE |
| DiagnosisAiCandidate | diseaseId | CropDisease(id) | SET NULL |
| DiagnosisAiCandidate | pestId | CropPest(id) | SET NULL |
| DiseaseSymptom | diseaseId | CropDisease(id) | CASCADE |
| DiseaseSymptom | pestId | CropPest(id) | CASCADE |
| DiseaseSymptomMedia | mediaAssetId | MediaAsset(id) | RESTRICT |
| DiseaseSymptomMedia | symptomId | DiseaseSymptom(id) | CASCADE |
| DiseaseTreatment | approvedById | User(id) | SET NULL |
| DiseaseTreatment | diseaseId | CropDisease(id) | CASCADE |
| DiseaseTreatment | doseUnitId | MeasurementUnit(id) | RESTRICT |
| DiseaseTreatment | farmInputId | FarmInput(id) | SET NULL |
| DiseaseTreatment | pestId | CropPest(id) | CASCADE |
| DiseaseTreatment | sourceId | ContentSource(id) | RESTRICT |

</details>

## MODULE 11 — Agricultural inputs and expenses

Schema file: `apps/api/prisma/schema/12_inputs_expenses.prisma` · Tables: `FarmInput`, `InputRecommendation`, `InputPurchase`, `InputApplicationLog`, `CropExpense`

```mermaid
erDiagram
    FarmInput {
        uuid id PK
        InputType inputType
        varchar name
        varchar brandName "nullable"
        varchar manufacturer "nullable"
        varchar activeIngredient "nullable"
        varchar composition "nullable"
        varchar registrationNumber "nullable"
        uuid defaultUnitId FK "nullable"
        bool isVerified
        uuid createdById FK "nullable"
        bool isActive
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    InputRecommendation {
        uuid id PK
        uuid cropId FK
        uuid cropVarietyId FK "nullable"
        uuid growingStageId FK "nullable"
        uuid regionId FK "nullable"
        uuid seasonId FK "nullable"
        uuid farmInputId FK "nullable"
        uuid nutrientParameterId FK "nullable"
        decimal quantityMin "nullable"
        decimal quantityMax "nullable"
        uuid quantityUnitId FK
        QuantityBasis basis
        ApplicationMethod applicationMethod "nullable"
        text timingNote "nullable"
        text conditionNote "nullable"
        uuid sourceId FK "nullable"
        ContentStatus status
        VerificationStatus verificationStatus
        timestamptz createdAt
        timestamptz updatedAt
    }
    InputPurchase {
        uuid id PK
        uuid userId FK
        uuid farmId FK "nullable"
        uuid farmInputId FK "nullable"
        varchar itemName
        decimal quantity
        uuid unitId FK
        decimal unitPrice "nullable"
        decimal totalAmount
        char currency
        date purchaseDate
        varchar supplierName "nullable"
        uuid receiptFileId FK "nullable"
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    InputApplicationLog {
        uuid id PK
        uuid activityLogId FK, UK
        uuid farmInputId FK "nullable"
        uuid inputPurchaseId FK "nullable"
        uuid inputRecommendationId FK "nullable"
        varchar productName "nullable"
        decimal quantity
        uuid unitId FK
        ApplicationMethod applicationMethod "nullable"
        decimal areaCovered "nullable"
        uuid areaUnitId FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    CropExpense {
        uuid id PK
        uuid farmCropId FK
        ExpenseCategory category
        date expenseDate
        decimal amount
        char currency
        varchar description "nullable"
        decimal quantity "nullable"
        uuid unitId FK "nullable"
        uuid inputPurchaseId FK "nullable"
        uuid activityLogId FK "nullable"
        PaymentMode paymentMode "nullable"
        uuid receiptFileId FK "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    CropActivityLog |o--o{ CropExpense : "activityLogId"
    FarmCrop ||--o{ CropExpense : "farmCropId"
    InputPurchase |o--o{ CropExpense : "inputPurchaseId"
    UserFile |o--o{ CropExpense : "receiptFileId"
    CropActivityLog ||--o| InputApplicationLog : "activityLogId"
    FarmInput |o--o{ InputApplicationLog : "farmInputId"
    InputPurchase |o--o{ InputApplicationLog : "inputPurchaseId"
    InputRecommendation |o--o{ InputApplicationLog : "inputRecommendationId"
    Farm |o--o{ InputPurchase : "farmId"
    FarmInput |o--o{ InputPurchase : "farmInputId"
    UserFile |o--o{ InputPurchase : "receiptFileId"
    User ||--o{ InputPurchase : "userId"
    Crop ||--o{ InputRecommendation : "cropId"
    CropVariety |o--o{ InputRecommendation : "cropVarietyId, cropId"
    FarmInput |o--o{ InputRecommendation : "farmInputId"
    GrowingStage |o--o{ InputRecommendation : "growingStageId"
    AgronomicParameter |o--o{ InputRecommendation : "nutrientParameterId"
    Region |o--o{ InputRecommendation : "regionId"
    Season |o--o{ InputRecommendation : "seasonId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| CropExpense | activityLogId | CropActivityLog(id) | SET NULL |
| CropExpense | farmCropId | FarmCrop(id) | CASCADE |
| CropExpense | inputPurchaseId | InputPurchase(id) | SET NULL |
| CropExpense | receiptFileId | UserFile(id) | SET NULL |
| CropExpense | unitId | MeasurementUnit(id) | RESTRICT |
| FarmInput | createdById | User(id) | SET NULL |
| FarmInput | defaultUnitId | MeasurementUnit(id) | RESTRICT |
| InputApplicationLog | activityLogId | CropActivityLog(id) | CASCADE |
| InputApplicationLog | areaUnitId | MeasurementUnit(id) | RESTRICT |
| InputApplicationLog | farmInputId | FarmInput(id) | SET NULL |
| InputApplicationLog | inputPurchaseId | InputPurchase(id) | SET NULL |
| InputApplicationLog | inputRecommendationId | InputRecommendation(id) | SET NULL |
| InputApplicationLog | unitId | MeasurementUnit(id) | RESTRICT |
| InputPurchase | farmId | Farm(id) | SET NULL |
| InputPurchase | farmInputId | FarmInput(id) | SET NULL |
| InputPurchase | receiptFileId | UserFile(id) | SET NULL |
| InputPurchase | unitId | MeasurementUnit(id) | RESTRICT |
| InputPurchase | userId | User(id) | CASCADE |
| InputRecommendation | cropId | Crop(id) | RESTRICT |
| InputRecommendation | cropVarietyId, cropId | CropVariety(id, cropId) | RESTRICT |
| InputRecommendation | farmInputId | FarmInput(id) | SET NULL |
| InputRecommendation | growingStageId | GrowingStage(id) | CASCADE |
| InputRecommendation | nutrientParameterId | AgronomicParameter(id) | RESTRICT |
| InputRecommendation | quantityUnitId | MeasurementUnit(id) | RESTRICT |
| InputRecommendation | regionId | Region(id) | RESTRICT |
| InputRecommendation | seasonId | Season(id) | RESTRICT |
| InputRecommendation | sourceId | ContentSource(id) | RESTRICT |

</details>

## MODULE 12 — Harvest and sales

Schema file: `apps/api/prisma/schema/13_harvest_sales.prisma` · Tables: `HarvestRecord`, `SalesRecord`

```mermaid
erDiagram
    HarvestRecord {
        uuid id PK
        uuid farmCropId FK
        smallint harvestNumber
        date harvestDate
        decimal quantity
        uuid unitId FK
        varchar qualityGrade "nullable"
        decimal moisturePct "nullable"
        decimal areaHarvested "nullable"
        uuid areaUnitId FK "nullable"
        varchar storageLocation "nullable"
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    SalesRecord {
        uuid id PK
        uuid harvestRecordId FK
        date saleDate
        decimal quantitySold
        uuid unitId FK
        decimal pricePerUnit
        decimal grossAmount
        decimal deductions
        decimal netAmount
        char currency
        BuyerType buyerType "nullable"
        varchar buyerName "nullable"
        varchar buyerContact "nullable"
        varchar marketName "nullable"
        uuid marketRegionId FK "nullable"
        PaymentStatus paymentStatus
        PaymentMode paymentMode "nullable"
        text notes "nullable"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    FarmCrop ||--o{ HarvestRecord : "farmCropId"
    HarvestRecord ||--o{ SalesRecord : "harvestRecordId"
    Region |o--o{ SalesRecord : "marketRegionId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| HarvestRecord | areaUnitId | MeasurementUnit(id) | RESTRICT |
| HarvestRecord | farmCropId | FarmCrop(id) | CASCADE |
| HarvestRecord | unitId | MeasurementUnit(id) | RESTRICT |
| SalesRecord | harvestRecordId | HarvestRecord(id) | CASCADE |
| SalesRecord | marketRegionId | Region(id) | SET NULL |
| SalesRecord | unitId | MeasurementUnit(id) | RESTRICT |

</details>

## MODULE 13 — Notifications and community (future features).

Schema file: `apps/api/prisma/schema/14_community.prisma` · Tables: `Notification`, `FarmerPost`, `PostMedia`, `PostComment`, `ExpertConsultation`

```mermaid
erDiagram
    Notification {
        uuid id PK
        uuid userId FK
        NotificationType type
        NotificationChannel channel
        varchar title
        text body
        NotificationStatus status
        uuid cropTaskId FK "nullable"
        uuid farmCropId FK "nullable"
        uuid recommendationId FK "nullable"
        uuid consultationId FK "nullable"
        timestamptz sentAt "nullable"
        timestamptz readAt "nullable"
        timestamptz createdAt
    }
    FarmerPost {
        uuid id PK
        uuid authorId FK
        uuid cropId FK "nullable"
        uuid languageId FK "nullable"
        varchar title "nullable"
        text body
        ModerationStatus status
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    PostMedia {
        uuid id PK
        uuid postId FK
        uuid fileId FK
        smallint sequence
        varchar caption "nullable"
        timestamptz createdAt
    }
    PostComment {
        uuid id PK
        uuid postId FK
        uuid authorId FK
        uuid parentCommentId FK "nullable"
        text body
        bool isExpertAnswer
        ModerationStatus status
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "nullable"
    }
    ExpertConsultation {
        uuid id PK
        uuid farmerId FK
        uuid expertId FK "nullable"
        uuid farmCropId FK "nullable"
        uuid cropId FK "nullable"
        uuid diagnosisId FK "nullable"
        varchar subject
        text description
        ConsultationChannel channel
        ConsultationStatus status
        timestamptz requestedAt
        timestamptz assignedAt "nullable"
        timestamptz resolvedAt "nullable"
        text resolutionSummary "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }
    Crop |o--o{ ExpertConsultation : "cropId"
    CropDiagnosis |o--o{ ExpertConsultation : "diagnosisId"
    User |o--o{ ExpertConsultation : "expertId"
    FarmCrop |o--o{ ExpertConsultation : "farmCropId"
    User ||--o{ ExpertConsultation : "farmerId"
    User ||--o{ FarmerPost : "authorId"
    Crop |o--o{ FarmerPost : "cropId"
    ExpertConsultation |o--o{ Notification : "consultationId"
    CropTask |o--o{ Notification : "cropTaskId"
    FarmCrop |o--o{ Notification : "farmCropId"
    CropRecommendation |o--o{ Notification : "recommendationId"
    User ||--o{ Notification : "userId"
    User ||--o{ PostComment : "authorId"
    PostComment |o--o{ PostComment : "parentCommentId"
    FarmerPost ||--o{ PostComment : "postId"
    UserFile ||--o{ PostMedia : "fileId"
    FarmerPost ||--o{ PostMedia : "postId"
```

<details><summary>All foreign keys in this module</summary>

| Table | Column(s) | References | On delete |
|---|---|---|---|
| ExpertConsultation | cropId | Crop(id) | SET NULL |
| ExpertConsultation | diagnosisId | CropDiagnosis(id) | SET NULL |
| ExpertConsultation | expertId | User(id) | SET NULL |
| ExpertConsultation | farmCropId | FarmCrop(id) | SET NULL |
| ExpertConsultation | farmerId | User(id) | CASCADE |
| FarmerPost | authorId | User(id) | CASCADE |
| FarmerPost | cropId | Crop(id) | SET NULL |
| FarmerPost | languageId | Language(id) | SET NULL |
| Notification | consultationId | ExpertConsultation(id) | SET NULL |
| Notification | cropTaskId | CropTask(id) | SET NULL |
| Notification | farmCropId | FarmCrop(id) | SET NULL |
| Notification | recommendationId | CropRecommendation(id) | SET NULL |
| Notification | userId | User(id) | CASCADE |
| PostComment | authorId | User(id) | CASCADE |
| PostComment | parentCommentId | PostComment(id) | CASCADE |
| PostComment | postId | FarmerPost(id) | CASCADE |
| PostMedia | fileId | UserFile(id) | CASCADE |
| PostMedia | postId | FarmerPost(id) | CASCADE |

</details>
