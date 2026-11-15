-- KrishiSutra — CHECK constraints
-- Prisma's schema language cannot express CHECK constraints, so they live in this hand-written
-- migration. Every constraint is named "<Table>_<rule>_chk" so violations are easy to identify.
-- They enforce rules that must never be broken whatever code writes to the database.

------------------------------------------------------------------------------------------------
-- Helpers used below (all IMMUTABLE expressions, valid inside CHECK constraints)
--   ranges:   lower <= upper when both present
--   pairs:    a quantity and its unit are both present or both absent
--   currency: ISO-4217 style three upper-case letters
------------------------------------------------------------------------------------------------

-- ===== MODULE 1 — Users =====================================================================
ALTER TABLE "User"
  ADD CONSTRAINT "User_email_or_phone_chk" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL),
  ADD CONSTRAINT "User_email_lowercase_chk" CHECK ("email" IS NULL OR "email" = lower("email")),
  ADD CONSTRAINT "User_phone_e164_chk" CHECK ("phone" IS NULL OR "phone" ~ '^\+[1-9][0-9]{6,14}$');

ALTER TABLE "UserFile"
  ADD CONSTRAINT "UserFile_size_chk" CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0);

-- ===== Reference data =======================================================================
ALTER TABLE "MeasurementUnit"
  ADD CONSTRAINT "MeasurementUnit_factor_positive_chk" CHECK ("toBaseFactor" IS NULL OR "toBaseFactor" > 0);

ALTER TABLE "Region"
  ADD CONSTRAINT "Region_not_own_parent_chk" CHECK ("parentId" IS NULL OR "parentId" <> "id"),
  ADD CONSTRAINT "Region_latitude_chk" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "Region_longitude_chk" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180);

ALTER TABLE "SoilType"
  ADD CONSTRAINT "SoilType_color_hex_chk" CHECK ("colorHex" IS NULL OR "colorHex" ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE "Season"
  ADD CONSTRAINT "Season_start_month_chk" CHECK ("typicalStartMonth" IS NULL OR "typicalStartMonth" BETWEEN 1 AND 12),
  ADD CONSTRAINT "Season_end_month_chk" CHECK ("typicalEndMonth" IS NULL OR "typicalEndMonth" BETWEEN 1 AND 12);

-- ===== MODULE 2 — Categories ================================================================
ALTER TABLE "CropCategory"
  ADD CONSTRAINT "CropCategory_not_own_parent_chk" CHECK ("parentId" IS NULL OR "parentId" <> "id");

-- ===== MODULE 3 — Crops & requirements ======================================================
ALTER TABLE "CropVariety"
  ADD CONSTRAINT "CropVariety_release_year_chk" CHECK ("releaseYear" IS NULL OR "releaseYear" BETWEEN 1900 AND 2200);

ALTER TABLE "CropRequirement"
  ADD CONSTRAINT "CropRequirement_has_value_chk"
    CHECK ("minValue" IS NOT NULL OR "maxValue" IS NOT NULL OR "level" IS NOT NULL),
  ADD CONSTRAINT "CropRequirement_range_chk"
    CHECK ("minValue" IS NULL OR "maxValue" IS NULL OR "minValue" <= "maxValue"),
  ADD CONSTRAINT "CropRequirement_optimal_range_chk"
    CHECK ("optimalMinValue" IS NULL OR "optimalMaxValue" IS NULL OR "optimalMinValue" <= "optimalMaxValue"),
  ADD CONSTRAINT "CropRequirement_optimal_within_range_chk"
    CHECK (("optimalMinValue" IS NULL OR "minValue" IS NULL OR "optimalMinValue" >= "minValue")
       AND ("optimalMaxValue" IS NULL OR "maxValue" IS NULL OR "optimalMaxValue" <= "maxValue")),
  -- A numeric requirement must say which unit it is in.
  ADD CONSTRAINT "CropRequirement_numeric_has_unit_chk"
    CHECK (("minValue" IS NULL AND "maxValue" IS NULL) OR "unitId" IS NOT NULL),
  -- Nothing reaches farmers without a source.
  ADD CONSTRAINT "CropRequirement_published_has_source_chk"
    CHECK ("status" <> 'PUBLISHED' OR "sourceId" IS NOT NULL);

ALTER TABLE "CropSeasonMapping"
  ADD CONSTRAINT "CropSeasonMapping_start_month_chk" CHECK ("sowingStartMonth" IS NULL OR "sowingStartMonth" BETWEEN 1 AND 12),
  ADD CONSTRAINT "CropSeasonMapping_end_month_chk" CHECK ("sowingEndMonth" IS NULL OR "sowingEndMonth" BETWEEN 1 AND 12);

ALTER TABLE "CropEconomics"
  ADD CONSTRAINT "CropEconomics_reference_year_chk" CHECK ("referenceYear" BETWEEN 1950 AND 2200),
  ADD CONSTRAINT "CropEconomics_cost_nonnegative_chk"
    CHECK (("costOfCultivationMin" IS NULL OR "costOfCultivationMin" >= 0) AND ("costOfCultivationMax" IS NULL OR "costOfCultivationMax" >= 0)),
  ADD CONSTRAINT "CropEconomics_cost_range_chk"
    CHECK ("costOfCultivationMin" IS NULL OR "costOfCultivationMax" IS NULL OR "costOfCultivationMin" <= "costOfCultivationMax"),
  ADD CONSTRAINT "CropEconomics_yield_nonnegative_chk"
    CHECK (("yieldMin" IS NULL OR "yieldMin" >= 0) AND ("yieldMax" IS NULL OR "yieldMax" >= 0)),
  ADD CONSTRAINT "CropEconomics_yield_range_chk"
    CHECK ("yieldMin" IS NULL OR "yieldMax" IS NULL OR "yieldMin" <= "yieldMax"),
  ADD CONSTRAINT "CropEconomics_yield_has_unit_chk"
    CHECK (("yieldMin" IS NULL AND "yieldMax" IS NULL) OR "yieldUnitId" IS NOT NULL),
  ADD CONSTRAINT "CropEconomics_currency_chk" CHECK ("currency" ~ '^[A-Z]{3}$');

-- ===== MODULE 4 — Procedures ================================================================
ALTER TABLE "ProcedureVersion"
  ADD CONSTRAINT "ProcedureVersion_number_positive_chk" CHECK ("versionNumber" >= 1),
  ADD CONSTRAINT "ProcedureVersion_published_has_dates_chk"
    CHECK ("status" <> 'PUBLISHED' OR ("publishedAt" IS NOT NULL AND "approvedAt" IS NOT NULL));

ALTER TABLE "GrowingStage"
  ADD CONSTRAINT "GrowingStage_sequence_positive_chk" CHECK ("sequence" >= 1),
  ADD CONSTRAINT "GrowingStage_day_range_chk" CHECK ("startDay" IS NULL OR "endDay" IS NULL OR "startDay" <= "endDay");

ALTER TABLE "StageInstruction"
  ADD CONSTRAINT "StageInstruction_sequence_positive_chk" CHECK ("sequence" >= 1),
  ADD CONSTRAINT "StageInstruction_duration_pair_chk" CHECK (("durationValue" IS NULL) = ("durationUnitId" IS NULL)),
  ADD CONSTRAINT "StageInstruction_duration_positive_chk" CHECK ("durationValue" IS NULL OR "durationValue" > 0);

ALTER TABLE "StageCommonMistake"
  ADD CONSTRAINT "StageCommonMistake_sequence_positive_chk" CHECK ("sequence" >= 1);

-- ===== MODULE 5 — Media & content ===========================================================
ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_numbers_nonnegative_chk"
    CHECK (("fileSizeBytes" IS NULL OR "fileSizeBytes" >= 0) AND ("durationSeconds" IS NULL OR "durationSeconds" >= 0)
       AND ("widthPx" IS NULL OR "widthPx" > 0) AND ("heightPx" IS NULL OR "heightPx" > 0)),
  ADD CONSTRAINT "MediaAsset_permission_reference_chk"
    CHECK ("licenseType" <> 'PERMISSION_GRANTED' OR "permissionReference" IS NOT NULL),
  -- Media with unknown rights cannot be shown to farmers.
  ADD CONSTRAINT "MediaAsset_published_licence_known_chk"
    CHECK ("status" <> 'PUBLISHED' OR "licenseType" <> 'UNKNOWN');

ALTER TABLE "ContentReview"
  ADD CONSTRAINT "ContentReview_exactly_one_target_chk"
    CHECK (num_nonnulls("procedureVersionId", "mediaAssetId", "cropRequirementId", "cropVarietyId",
                        "cropEconomicsId", "diseaseTreatmentId", "inputRecommendationId", "translationId") = 1);

-- ===== MODULE 6 — Translation ===============================================================
ALTER TABLE "Translation"
  ADD CONSTRAINT "Translation_exactly_one_target_chk"
    CHECK (num_nonnulls("cropCategoryId", "cropId", "cropVarietyId", "growingProcedureId", "growingStageId",
                        "stageInstructionId", "stageResourceId", "stageCommonMistakeId", "mediaAssetId",
                        "soilTypeId", "seasonId", "regionId", "agronomicParameterId", "waterSourceTypeId",
                        "stageTypeId", "cultivationMethodId", "cropDiseaseId", "cropPestId",
                        "diseaseSymptomId", "diseaseTreatmentId") = 1),
  ADD CONSTRAINT "Translation_value_not_blank_chk" CHECK (length(btrim("value")) > 0);

-- ===== MODULE 7 — Farms =====================================================================
ALTER TABLE "Farm"
  ADD CONSTRAINT "Farm_latitude_chk" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "Farm_longitude_chk" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT "Farm_area_positive_chk" CHECK ("totalArea" IS NULL OR "totalArea" > 0),
  ADD CONSTRAINT "Farm_area_pair_chk" CHECK (("totalArea" IS NULL) = ("totalAreaUnitId" IS NULL));

ALTER TABLE "FarmPlot"
  ADD CONSTRAINT "FarmPlot_area_positive_chk" CHECK ("area" > 0),
  ADD CONSTRAINT "FarmPlot_latitude_chk" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "FarmPlot_longitude_chk" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180);

ALTER TABLE "WaterSource"
  ADD CONSTRAINT "WaterSource_months_valid_chk"
    CHECK ("availableMonths" <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]::smallint[]),
  ADD CONSTRAINT "WaterSource_yield_positive_chk" CHECK ("estimatedYield" IS NULL OR "estimatedYield" > 0),
  ADD CONSTRAINT "WaterSource_yield_pair_chk" CHECK (("estimatedYield" IS NULL) = ("yieldUnitId" IS NULL)),
  ADD CONSTRAINT "WaterSource_depth_positive_chk" CHECK ("depthMetres" IS NULL OR "depthMetres" > 0);

ALTER TABLE "SoilTestResult"
  ADD CONSTRAINT "SoilTestResult_value_nonnegative_chk" CHECK ("value" >= 0);

-- ===== MODULE 8 — Recommendations ===========================================================
ALTER TABLE "WeatherSnapshot"
  ADD CONSTRAINT "WeatherSnapshot_period_chk" CHECK ("periodStart" <= "periodEnd"),
  ADD CONSTRAINT "WeatherSnapshot_latitude_chk" CHECK ("latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "WeatherSnapshot_longitude_chk" CHECK ("longitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT "WeatherSnapshot_humidity_chk"
    CHECK ("relativeHumidityPct" IS NULL OR "relativeHumidityPct" BETWEEN 0 AND 100),
  ADD CONSTRAINT "WeatherSnapshot_rainfall_chk" CHECK ("rainfallMm" IS NULL OR "rainfallMm" >= 0);

ALTER TABLE "CropRecommendation"
  ADD CONSTRAINT "CropRecommendation_completeness_chk"
    CHECK ("dataCompletenessPct" IS NULL OR "dataCompletenessPct" BETWEEN 0 AND 100),
  ADD CONSTRAINT "CropRecommendation_budget_chk" CHECK ("budgetAmount" IS NULL OR "budgetAmount" >= 0),
  ADD CONSTRAINT "CropRecommendation_currency_chk" CHECK ("budgetCurrency" ~ '^[A-Z]{3}$');

ALTER TABLE "CropRecommendationItem"
  ADD CONSTRAINT "CropRecommendationItem_rank_chk" CHECK ("rank" >= 1),
  ADD CONSTRAINT "CropRecommendationItem_score_range_chk"
    CHECK ("suitabilityScore" IS NULL OR "suitabilityScore" BETWEEN 0 AND 100),
  -- A score is only allowed when it was produced by a named, documented method.
  ADD CONSTRAINT "CropRecommendationItem_score_has_method_chk"
    CHECK ("suitabilityScore" IS NULL OR "scoringMethod" IS NOT NULL),
  -- Investment / yield figures must come from a verified CropEconomics row — never generated.
  ADD CONSTRAINT "CropRecommendationItem_figures_have_source_chk"
    CHECK (("estimatedInvestmentMin" IS NULL AND "estimatedInvestmentMax" IS NULL
            AND "expectedYieldMin" IS NULL AND "expectedYieldMax" IS NULL)
           OR "cropEconomicsId" IS NOT NULL),
  ADD CONSTRAINT "CropRecommendationItem_investment_range_chk"
    CHECK ("estimatedInvestmentMin" IS NULL OR "estimatedInvestmentMax" IS NULL OR "estimatedInvestmentMin" <= "estimatedInvestmentMax"),
  ADD CONSTRAINT "CropRecommendationItem_yield_range_chk"
    CHECK ("expectedYieldMin" IS NULL OR "expectedYieldMax" IS NULL OR "expectedYieldMin" <= "expectedYieldMax"),
  ADD CONSTRAINT "CropRecommendationItem_yield_has_unit_chk"
    CHECK (("expectedYieldMin" IS NULL AND "expectedYieldMax" IS NULL) OR "yieldUnitId" IS NOT NULL),
  ADD CONSTRAINT "CropRecommendationItem_area_pair_chk" CHECK (("areaValue" IS NULL) = ("areaUnitId" IS NULL)),
  ADD CONSTRAINT "CropRecommendationItem_currency_chk" CHECK ("currency" ~ '^[A-Z]{3}$');

-- ===== MODULE 9 — Crop lifecycle ============================================================
ALTER TABLE "FarmCrop"
  ADD CONSTRAINT "FarmCrop_area_positive_chk" CHECK ("cultivatedArea" > 0),
  -- The composite FK (procedureVersionId, growingProcedureId) is not checked when growingProcedureId
  -- is NULL (MATCH SIMPLE), so a pinned version also requires its procedure.
  ADD CONSTRAINT "FarmCrop_version_needs_procedure_chk"
    CHECK ("procedureVersionId" IS NULL OR "growingProcedureId" IS NOT NULL),
  ADD CONSTRAINT "FarmCrop_expected_harvest_after_planting_chk"
    CHECK ("expectedHarvestDate" IS NULL OR "plantingDate" IS NULL OR "expectedHarvestDate" >= "plantingDate"),
  ADD CONSTRAINT "FarmCrop_actual_harvest_after_planting_chk"
    CHECK ("actualHarvestDate" IS NULL OR "plantingDate" IS NULL OR "actualHarvestDate" >= "plantingDate");

ALTER TABLE "CropTask"
  ADD CONSTRAINT "CropTask_completed_has_time_chk" CHECK ("status" <> 'COMPLETED' OR "completedAt" IS NOT NULL),
  ADD CONSTRAINT "CropTask_schedule_chk"
    CHECK ("scheduledStartDate" IS NULL OR "dueDate" IS NULL OR "scheduledStartDate" <= "dueDate"),
  -- Generated tasks come from the procedure; custom tasks are the farmer's own.
  ADD CONSTRAINT "CropTask_origin_chk"
    CHECK ("isCustom" OR "growingStageId" IS NOT NULL);

ALTER TABLE "CropActivityLog"
  ADD CONSTRAINT "CropActivityLog_labour_chk"
    CHECK (("labourCount" IS NULL OR "labourCount" >= 0) AND ("labourHours" IS NULL OR "labourHours" >= 0));

ALTER TABLE "CropObservation"
  ADD CONSTRAINT "CropObservation_affected_pct_chk"
    CHECK ("affectedAreaPct" IS NULL OR "affectedAreaPct" BETWEEN 0 AND 100);

ALTER TABLE "IrrigationLog"
  ADD CONSTRAINT "IrrigationLog_duration_chk" CHECK ("durationMinutes" IS NULL OR "durationMinutes" > 0),
  ADD CONSTRAINT "IrrigationLog_quantity_chk" CHECK ("waterQuantity" IS NULL OR "waterQuantity" > 0),
  ADD CONSTRAINT "IrrigationLog_quantity_pair_chk" CHECK (("waterQuantity" IS NULL) = ("waterUnitId" IS NULL));

-- ===== MODULE 10 — Pests & diseases =========================================================
ALTER TABLE "DiseaseSymptom"
  ADD CONSTRAINT "DiseaseSymptom_exactly_one_target_chk" CHECK (num_nonnulls("diseaseId", "pestId") = 1);

ALTER TABLE "DiseaseTreatment"
  ADD CONSTRAINT "DiseaseTreatment_exactly_one_target_chk" CHECK (num_nonnulls("diseaseId", "pestId") = 1),
  ADD CONSTRAINT "DiseaseTreatment_dose_pair_chk" CHECK (("doseValue" IS NULL) = ("doseUnitId" IS NULL)),
  ADD CONSTRAINT "DiseaseTreatment_dose_positive_chk" CHECK ("doseValue" IS NULL OR "doseValue" > 0),
  ADD CONSTRAINT "DiseaseTreatment_phi_chk" CHECK ("preHarvestIntervalDays" IS NULL OR "preHarvestIntervalDays" >= 0),
  -- Unverified doses and chemical treatments can never be published as recommendations.
  ADD CONSTRAINT "DiseaseTreatment_published_dose_verified_chk"
    CHECK ("status" <> 'PUBLISHED'
           OR ("treatmentType" <> 'CHEMICAL' AND "doseValue" IS NULL)
           OR ("verificationStatus" = 'EXPERT_VERIFIED' AND "approvedAt" IS NOT NULL)),
  ADD CONSTRAINT "DiseaseTreatment_published_chemical_registered_chk"
    CHECK ("status" <> 'PUBLISHED' OR "treatmentType" <> 'CHEMICAL' OR "regulatoryReference" IS NOT NULL);

ALTER TABLE "CropDiagnosis"
  ADD CONSTRAINT "CropDiagnosis_single_confirmed_result_chk"
    CHECK ("confirmedDiseaseId" IS NULL OR "confirmedPestId" IS NULL),
  ADD CONSTRAINT "CropDiagnosis_confirmed_complete_chk"
    CHECK ("status" <> 'EXPERT_CONFIRMED'
           OR ("confirmedAt" IS NOT NULL AND ("confirmedDiseaseId" IS NOT NULL OR "confirmedPestId" IS NOT NULL)));

ALTER TABLE "DiagnosisAiCandidate"
  ADD CONSTRAINT "DiagnosisAiCandidate_confidence_chk" CHECK ("confidence" BETWEEN 0 AND 1),
  ADD CONSTRAINT "DiagnosisAiCandidate_rank_chk" CHECK ("rank" >= 1),
  ADD CONSTRAINT "DiagnosisAiCandidate_label_chk"
    CHECK (num_nonnulls("diseaseId", "pestId") <= 1 AND num_nonnulls("diseaseId", "pestId", "labelText") >= 1);

-- ===== MODULE 11 — Inputs & expenses ========================================================
ALTER TABLE "InputRecommendation"
  ADD CONSTRAINT "InputRecommendation_target_chk"
    CHECK ("farmInputId" IS NOT NULL OR "nutrientParameterId" IS NOT NULL),
  ADD CONSTRAINT "InputRecommendation_has_quantity_chk"
    CHECK ("quantityMin" IS NOT NULL OR "quantityMax" IS NOT NULL),
  ADD CONSTRAINT "InputRecommendation_nonnegative_chk"
    CHECK (("quantityMin" IS NULL OR "quantityMin" >= 0) AND ("quantityMax" IS NULL OR "quantityMax" >= 0)),
  ADD CONSTRAINT "InputRecommendation_range_chk"
    CHECK ("quantityMin" IS NULL OR "quantityMax" IS NULL OR "quantityMin" <= "quantityMax"),
  ADD CONSTRAINT "InputRecommendation_published_verified_chk"
    CHECK ("status" <> 'PUBLISHED' OR ("sourceId" IS NOT NULL AND "verificationStatus" <> 'UNVERIFIED'));

ALTER TABLE "InputPurchase"
  ADD CONSTRAINT "InputPurchase_quantity_positive_chk" CHECK ("quantity" > 0),
  ADD CONSTRAINT "InputPurchase_amounts_nonnegative_chk"
    CHECK ("totalAmount" >= 0 AND ("unitPrice" IS NULL OR "unitPrice" >= 0)),
  ADD CONSTRAINT "InputPurchase_currency_chk" CHECK ("currency" ~ '^[A-Z]{3}$');

ALTER TABLE "InputApplicationLog"
  ADD CONSTRAINT "InputApplicationLog_quantity_positive_chk" CHECK ("quantity" > 0),
  ADD CONSTRAINT "InputApplicationLog_area_positive_chk" CHECK ("areaCovered" IS NULL OR "areaCovered" > 0),
  ADD CONSTRAINT "InputApplicationLog_area_pair_chk" CHECK (("areaCovered" IS NULL) = ("areaUnitId" IS NULL)),
  ADD CONSTRAINT "InputApplicationLog_product_chk" CHECK ("farmInputId" IS NOT NULL OR "productName" IS NOT NULL);

ALTER TABLE "CropExpense"
  ADD CONSTRAINT "CropExpense_amount_nonnegative_chk" CHECK ("amount" >= 0),
  ADD CONSTRAINT "CropExpense_quantity_positive_chk" CHECK ("quantity" IS NULL OR "quantity" > 0),
  ADD CONSTRAINT "CropExpense_quantity_pair_chk" CHECK (("quantity" IS NULL) = ("unitId" IS NULL)),
  ADD CONSTRAINT "CropExpense_currency_chk" CHECK ("currency" ~ '^[A-Z]{3}$');

-- ===== MODULE 12 — Harvest & sales ==========================================================
ALTER TABLE "HarvestRecord"
  ADD CONSTRAINT "HarvestRecord_number_positive_chk" CHECK ("harvestNumber" >= 1),
  ADD CONSTRAINT "HarvestRecord_quantity_nonnegative_chk" CHECK ("quantity" >= 0),
  ADD CONSTRAINT "HarvestRecord_moisture_chk" CHECK ("moisturePct" IS NULL OR "moisturePct" BETWEEN 0 AND 100),
  ADD CONSTRAINT "HarvestRecord_area_positive_chk" CHECK ("areaHarvested" IS NULL OR "areaHarvested" > 0),
  ADD CONSTRAINT "HarvestRecord_area_pair_chk" CHECK (("areaHarvested" IS NULL) = ("areaUnitId" IS NULL));

ALTER TABLE "SalesRecord"
  ADD CONSTRAINT "SalesRecord_quantity_positive_chk" CHECK ("quantitySold" > 0),
  ADD CONSTRAINT "SalesRecord_amounts_nonnegative_chk"
    CHECK ("pricePerUnit" >= 0 AND "deductions" >= 0),
  -- Revenue arithmetic is enforced, so stored totals can always be trusted.
  ADD CONSTRAINT "SalesRecord_gross_amount_chk" CHECK ("grossAmount" = round("quantitySold" * "pricePerUnit", 2)),
  ADD CONSTRAINT "SalesRecord_net_amount_chk" CHECK ("netAmount" = "grossAmount" - "deductions"),
  ADD CONSTRAINT "SalesRecord_currency_chk" CHECK ("currency" ~ '^[A-Z]{3}$');

-- ===== MODULE 13 — Community ================================================================
ALTER TABLE "PostComment"
  ADD CONSTRAINT "PostComment_not_own_parent_chk" CHECK ("parentCommentId" IS NULL OR "parentCommentId" <> "id");

ALTER TABLE "ExpertConsultation"
  ADD CONSTRAINT "ExpertConsultation_expert_not_farmer_chk" CHECK ("expertId" IS NULL OR "expertId" <> "farmerId");
