# ADR 0007 — Deterministic, data-driven recommendation engine

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

Feature A must recommend crops from the farmer's soil, water, location, weather, soil test and (optionally) budget. It must explain *why* and *why not*, show missing data and confidence, and **never invent** recommendations, yields or profits (requirements §7, §9). At launch, it picks from 6 crops (D6).

## Options considered

| Option | Verdict |
|---|---|
| Large language model generates recommendations | ❌ Violates the "no invented agronomy" rule; not reproducible; hard to audit |
| Trained ML model | ❌ No validated outcome data yet; hard to explain; still needs verified inputs |
| **Rule engine with requirement ranges stored as data** | ✅ Transparent, reproducible, testable; agronomic values stay in the reviewed knowledge base |

## Decision

Implement `packages/recommendation-engine` as a **pure TypeScript** library (no network or database access):

```
evaluate(plotConditions, cropRequirements[], ruleSetVersion) → RecommendationResult
```

- **Inputs:** normalised plot conditions (soil type, soil-test values, water sources and availability, agro-climatic zone, season, climate normals + forecast summary, optional budget) and the **published** requirement records for each crop/variety.
- **Evaluation:** each criterion (soil type, pH, water need vs. availability, season and sowing window, temperature and rainfall ranges, zone recommendation, budget vs. reference cost) produces a result: `suitable | caution | unsuitable | unknown`, with a **reason code** and the **source** of the requirement used.
- **Hard exclusions:** for example, an "unsuitable" result on a criterion that the source marks as mandatory.
- **Ranking:** a transparent weighted score. The weights are stored in a versioned **rule set**, reviewed like content, not hard-coded.
- **Confidence:** based on how many inputs were known vs. `unknown`; missing inputs are listed explicitly.
- **Output values** (investment and yield ranges) are copied from verified reference data, with region, year and source attached, or shown as "Not available". The engine never calculates profit.
- **Reason codes** are translated in the app (kn/hi/en), so explanations are consistent and reviewable.

The API stores every run as a **recommendation run** (inputs, weather snapshot, knowledge version, rule-set version, results) for audit and reproducibility.

## Consequences

- The engine is unit-tested with fixture plots for each launch crop; changing a rule set requires the test suite to pass.
- Because it is pure TypeScript, it can later run **on the device** with downloaded requirement data (weather would still need a network or cached data).
- Quality depends on the completeness of requirement data, which is a Phase 4 content task.
- AI may still help elsewhere (draft translations, OCR of soil cards), always with human review (requirements §9.3).
