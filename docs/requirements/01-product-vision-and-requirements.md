# KrishiSutra — Product Vision & Requirements (Phase 1)

| Item | Value |
|---|---|
| Document | 01 — Product Vision & Requirements |
| Phase | Phase 1: Shared understanding (no application code) |
| Status | Draft — launch decisions recorded (§14.1, §14.3) |
| Last updated | 2026-11-15 |
| UI reference | [`docs/assets/ui-reference-grow-crops.png`](../assets/ui-reference-grow-crops.png) |

> **Purpose of this document.** Establish a shared understanding of what KrishiSutra is, who it serves, what it must do, and what we still need to decide — *before* any database or application work begins. It deliberately does **not** pick a technology stack and does **not** contain agricultural recommendations. All agronomic content must later come from credible, cited sources.

---

## Table of contents

1. [Product vision](#1-product-vision)
2. [Guiding principles](#2-guiding-principles)
3. [Target users & personas](#3-target-users--personas)
4. [End-to-end user journey](#4-end-to-end-user-journey)
5. [Functional requirements](#5-functional-requirements)
6. [Non-functional requirements](#6-non-functional-requirements)
7. [How recommendations and growing procedures interact](#7-how-recommendations-and-growing-procedures-interact)
8. [Conceptual domain model (knowledge vs. farmer data)](#8-conceptual-domain-model-knowledge-vs-farmer-data)
9. [Trust, provenance & the "no invented agronomy" rule](#9-trust-provenance--the-no-invented-agronomy-rule)
10. [External data sources & APIs](#10-external-data-sources--apis)
11. [Missing requirements identified](#11-missing-requirements-identified)
12. [Risks & challenges](#12-risks--challenges)
13. [Suggested improvements that benefit farmers](#13-suggested-improvements-that-benefit-farmers)
14. [Open questions for the product owner](#14-open-questions-for-the-product-owner)
15. [Proposed next phases](#15-proposed-next-phases)
16. [Glossary](#16-glossary)

---

## 1. Product vision

KrishiSutra is a **practical farming assistant**, not an article library. It helps a person answer two questions:

1. **"What should I grow on *my* land?"** — Smart Crop Recommendation (Feature A)
2. **"How exactly do I grow it, step by step?"** — Crop Growing Procedure (Feature B)

It guides the user from crop selection through land preparation, sowing, care, protection, harvest and post-harvest, using real photos, real farm videos, simple animations, audio in regional languages, and clear text — all grounded in **verified agricultural knowledge** from credible institutions (ICAR, State Agricultural Universities, Krishi Vigyan Kendras, government agriculture departments).

**The core idea:** *Agricultural knowledge is shared and reusable; each farmer's land, plan and progress is personal.* Two farmers growing the same crop may get different advice because their soil, water, location, season and budget differ — but the underlying verified knowledge is the same and is never altered arbitrarily.

---

## 2. Guiding principles

| # | Principle | What it means in practice |
|---|---|---|
| P1 | **Verified over generated** | Recommendations, yields, costs, doses and schedules come from a curated, source-cited knowledge base. AI must not invent agronomic facts, yields or profits. |
| P2 | **Transparent uncertainty** | Every output shows what it is based on, what data was missing, and how confident the system is. Verified facts and estimates are visually distinct. |
| P3 | **Explainable** | Every recommendation says *why* (and why not) in plain language. |
| P4 | **Farmer-first UX** | Images over text, large touch targets, regional languages, voice, minimal typing, works on low-end phones and poor networks. |
| P5 | **Knowledge ≠ farmer data** | Reusable crop knowledge is stored separately from each farmer's farms, plots and cultivation records. |
| P6 | **Respect sources** | Every photo, video, animation and text carries attribution and a licence; copyrighted material is used only with permission. |
| P7 | **Privacy by default** | Farm location, soil reports and personal details belong to the farmer and are protected. |
| P8 | **Safety** | Pesticide and chemical guidance is presented only from approved/label-compliant sources, with safety warnings. |

---

## 3. Target users & personas

| Persona | Description | Primary needs | Notes |
|---|---|---|---|
| **Smallholder farmer** | Owns/leases 1–5 acres; may have limited literacy or smartphone experience; regional language speaker | What to grow this season, step-by-step guidance, reminders, cost awareness | Most important persona. Voice + images essential. Often shared phone, intermittent network. |
| **Commercial / larger farmer** | Multiple plots, hired labour, higher investment | Plot-wise planning, cost & yield planning, records | Needs multi-plot management. |
| **Home / terrace gardener** | Grows vegetables, fruits, flowers at home, in pots or small beds | Simple "how to grow" for small spaces | Container/space-based guidance differs from field guidance (no "per acre"). |
| **Beginner / aspiring farmer** | New to farming, possibly urban | Learn basics, low-risk crop choices | Needs more explanation and glossary. |
| **Flower / ornamental grower** | Floriculture interest | Flower crop procedures, market timing | |
| **Agricultural learner** | Students, trainees | Structured, sourced learning content | Values citations and depth. |
| **Content expert / reviewer** *(internal)* | Agronomists, KVK scientists, content team | Author, review and approve knowledge and media | Implied by the "verified information" requirement — see §11. |
| **Platform admin** *(internal)* | Operations team | Manage categories, users, moderation, sources | |

---

## 4. End-to-end user journey

### 4.1 Onboarding (first launch)
1. Choose **language** (e.g., Kannada, Hindi, English, …) — before anything else, with audio prompts.
2. Choose **user type**: Farmer with land / Home gardener / Learner.
3. Optional sign-in (phone number + OTP is typical for the target audience — *to be confirmed*). Browsing knowledge should work **without** sign-in.
4. Grant location permission (optional; manual village/district/state selection as fallback).

### 4.2 Journey A — "What should I grow?" (Recommendation)
1. **Create / select a farm and plot** (name, location, area, unit — acre/hectare/gunta/cent; local units vary by state).
2. **Tell us about your land** — a guided wizard, one question per screen, image-based choices:
   - Soil type (pictures of red, black, sandy, clay, loamy, alluvial, … + "I don't know").
   - Water source(s) (borewell, open well, river, canal, rain-fed, tank, …) and, if known, availability (season-wise, hours/day, reliable or not).
   - Location — auto-filled from GPS or picked from state → district → taluk/block → village.
   - Soil test report — optional: upload photo/PDF of Soil Health Card or lab report, or enter values manually (pH, EC, N, P, K, OC, micronutrients), or skip.
   - Season / planned sowing window (auto-suggested from date and location).
   - Budget — optional.
3. **System fetches** weather (current, forecast, historical normals) and agro-climatic context for the location.
4. **Results screen** — a ranked list of suitable crops, each card showing: crop, category, suitable variety (where known), *why recommended*, soil fit, water need vs. availability, season/weather fit, duration, investment range (if verified data exists), yield range (if verified data exists), risks/limitations, and a **data-completeness / confidence badge** listing missing inputs.
5. User can **compare** 2–3 crops, see **"why not"** for crops they expected, and **save** a recommendation.
6. User taps **"Grow this"** → selects variety → a **personalised crop plan** is created for that plot (Journey B continues, personalised).

### 4.3 Journey B — "How do I grow it?" (Growing Procedure)
1. **Explore categories** (image tiles): Food, Commercial/Cash, Flower, Vegetable, Fruit, Oilseed, Spice, Plantation, Medicinal & Aromatic, Fodder — with subcategories; or **search** by name (incl. local names, voice search).
2. **Select a crop** → crop overview (image, description, duration, seasons, soil, water) and list of **varieties**.
3. **Select a variety** → the **growing procedure** as a visual timeline / step journey (stages differ per crop; e.g., transplanted paddy has a nursery stage, direct-sown crops do not).
4. Tabs per crop (from UI reference): **Overview · Steps · Calendar · Cost · Tips** (+ Pests & Diseases, Yield).
5. **Open a stage** → detailed screen: description, step-by-step instructions, photos, video, animation, audio, materials & equipment, timing/duration, common mistakes, warnings, expert tips, sources. **Previous / Next** navigation and progress ("Step 1 of 6").
6. **Save for offline** (download text + audio + selected media).

### 4.4 Journey C — "Track my crop" (Cultivation record) *(recommended extension; see §11)*
1. From a personalised plan, user sets the **actual sowing date** → the calendar converts "Day 21–30" into real dates.
2. **Reminders** for key activities (irrigation, fertiliser, weeding, spraying, harvest).
3. User **marks activities done**, logs inputs used, costs spent, photos, problems observed, and final harvest quantity and price.
4. Season summary: planned vs. actual cost, yield, and notes for next season.

### 4.5 Journey D — Home gardener
Same as B but filtered to crops suitable for containers/small spaces, with quantities expressed per pot/bed rather than per acre. Recommendation inputs are simplified (sunlight hours, space, container vs. ground, location).

### 4.6 Supporting journeys
- **Pest/disease lookup** from a crop stage or by symptom images.
- **Weather & alerts** (rain, heat, frost, wind) tied to the user's active crops.
- **Market prices** for the crop near the user (see §10).
- **Ask an expert / community** *(future phase)*.

---

## 5. Functional requirements

Priority key: **M** = Must (MVP), **S** = Should, **C** = Could (later).

### 5.1 Feature A — Smart Crop Recommendation

| ID | Requirement | Priority |
|---|---|---|
| A-01 | Capture **soil type** from a configurable list (red, black, sandy, clay, loamy, alluvial, laterite, saline/alkaline, … + "Don't know"), with photos to help identification. | M |
| A-02 | Capture **water sources** (multi-select: borewell, open well, river, canal, tank/pond, rain-fed, drip/sprinkler available, other) and **availability** (season-wise, reliability, approximate quantity if known). | M |
| A-03 | Capture **location** via GPS or hierarchical selection (state → district → block/taluk → village). | M |
| A-04 | Derive **agro-climatic zone** and fetch **current weather, forecast, and historical climate normals** (temperature, rainfall, humidity) for the location. | M |
| A-05 | Determine the **season** (Kharif / Rabi / Zaid / perennial) and sowing window from date + location; allow user override. | M |
| A-06 | Accept **soil-test data**: pH, EC, N, P, K, organic carbon, and optional micronutrients (S, Zn, Fe, Mn, Cu, B); manual entry and upload of Soil Health Card / lab report (photo/PDF). | M (manual) / S (upload + extraction) |
| A-07 | Soil test values must record **units, test date, lab/source**; extracted values must be confirmed by the user before use. | M |
| A-08 | **Budget** is optional (total available investment; optional breakdown: seed, fertiliser, irrigation, labour). | S |
| A-09 | Allow recommendations with **partial data**; explicitly list missing inputs and show their effect on confidence. | M |
| A-10 | Generate a **ranked list of suitable crops** using a transparent, rule/knowledge-based suitability evaluation against verified crop requirements (see §7, §9). | M |
| A-11 | Each recommendation shows: crop name, category, suitable variety (where known), reasons, soil suitability, water requirement vs. availability, weather & season suitability, duration, investment range\*, yield range\*, risks/limitations, sources. *(\*only if verified data exists — otherwise "Not available")* | M |
| A-12 | Visually distinguish **Verified**, **Estimated**, and **Not available** values, with the source and region/year of every number. | M |
| A-13 | Show **"why not"** explanations for crops excluded (e.g., "needs more water than available in Rabi"). | S |
| A-14 | **Compare** 2–3 recommended crops side-by-side. | S |
| A-15 | **Save** recommendation runs to a plot with the exact inputs used (for history and audit). | M |
| A-16 | Recommendation results link directly to the crop/variety **growing procedure** and allow creating a **personalised crop plan**. | M |
| A-17 | Support **filters/preferences**: crop categories of interest, duration limit, intercropping/mixed cropping interest, organic preference. | C |
| A-18 | Show **soil-health suggestions** (e.g., "your pH is outside the range for X; consult KVK for correction") only from verified guidance. | S |

### 5.2 Feature B — Crop Growing Procedure

| ID | Requirement | Priority |
|---|---|---|
| B-01 | Display **crop categories** as image tiles; categories and **subcategories** are dynamic (database-managed). | M |
| B-02 | A crop may belong to **multiple categories** (e.g., sunflower → Oilseed + Commercial). | M |
| B-03 | Search crops by name, **local/regional names**, and (later) voice. | M (text) / S (voice) |
| B-04 | Crop list per category with image, name, short description. | M |
| B-05 | **Crop detail**: image(s), description, duration, suitable seasons, soil requirements, water requirements, varieties. | M |
| B-06 | **Variety list** with variety-specific attributes (duration, region of release/recommendation, notable traits, releasing institution) where known. | M |
| B-07 | A **growing procedure** is defined per crop *and optionally per variety, region, season, or cultivation method* (e.g., transplanted vs. direct-seeded paddy; open field vs. polyhouse; field vs. container). | M |
| B-08 | Procedures consist of an **ordered, crop-specific list of stages**; stages are **not** forced into a fixed template. Stages may overlap or be "throughout" (e.g., pest management). | M |
| B-09 | Stages display as a **visual timeline / step journey** with day ranges (e.g., "Day 8–10"), thumbnails and progress. | M |
| B-10 | **Stage detail** supports: title, description, ordered instructions, photos, videos, animations, audio, materials & equipment (with quantities where verified), timing/duration, common mistakes, warnings, expert tips, sources. | M |
| B-11 | **Previous/Next** stage navigation and "Step X of N". | M |
| B-12 | **Crop calendar** view (Day 0 → harvest) with key activities. | M |
| B-13 | **Cost of cultivation** view (estimated inputs per unit area) — only from verified/attributed data, labelled with region and year. | S |
| B-14 | **Pest & disease guide** per crop: symptoms (images), identification, organic/cultural and chemical management, safety notes. | S |
| B-15 | **Expected yield & market price range** per crop/variety, attributed and dated. | S |
| B-16 | **Bookmark / save** crops and stages; **download for offline**. | M (bookmark) / S (offline) |
| B-17 | Personalisation layer (see §7): when viewed within a farmer's plan, stages show plot-specific notes (e.g., irrigation advice adapted to water source, soil-test-based nutrient notes) while the **standard procedure stays visible and unchanged**. | S |

### 5.3 Educational content & media

| ID | Requirement | Priority |
|---|---|---|
| E-01 | Support content types: text, photos, video, animation, audio, documents (PDF), external links. | M |
| E-02 | Each resource carries: **source/author, licence, attribution text, language, region applicability, review status, reviewer, review date**. | M |
| E-03 | **Audio** narration per stage in each supported language (recorded voice or reviewed text-to-speech). | S |
| E-04 | Videos may be **hosted** (with permission) or **embedded** from the rights-holder's channel; both carry attribution. | M |
| E-05 | Media served in **multiple resolutions**; low-data mode prefers images + audio over video. | S |
| E-06 | Resources reusable across crops/stages (e.g., one "seed treatment" animation used by several crops). | M |
| E-07 | Captions/subtitles for videos where available. | C |

### 5.4 Farms, plots & cultivation records

| ID | Requirement | Priority |
|---|---|---|
| F-01 | A user can own multiple **farms**; a farm has multiple **plots**. | M |
| F-02 | Plot attributes: name, area + unit, location (point or boundary), soil type, water sources, soil tests (history), ownership/lease *(optional)*. | M |
| F-03 | A **cultivation record** links a plot, crop, variety, season, procedure version, planned & actual sowing date. | M (D4) |
| F-04 | Track **activities** (planned vs. done), **inputs & costs**, **observations/photos**, **harvest** quantity and sale price. | M (D4) |
| F-05 | **Reminders/notifications** for planned activities, adjusted to actual sowing date. | M (D4) |
| F-06 | Plot **crop history** (previous crops) — useful for rotation advice later. | C |

### 5.5 Users, language & accessibility

| ID | Requirement | Priority |
|---|---|---|
| U-01 | Browse knowledge **without** an account; account needed to save farms/plans. | M |
| U-02 | Sign-in method suitable for target users (e.g., mobile OTP) — *to be confirmed*. | M |
| U-03 | Full UI **localisation** (start with a defined set of languages — see §14) including numbers, units, dates. | M |
| U-04 | **Voice**: listen to any screen's main content; voice search/input later. | S |
| U-05 | Large text, high contrast, icon + label navigation, minimal typing. | M |
| U-06 | Local measurement units (acre, hectare, gunta, cent, bigha …) with conversions. | M |

### 5.6 Content management & expert workflow *(missing from the brief; essential)*

| ID | Requirement | Priority |
|---|---|---|
| C-01 | Admin/content tool to manage categories, crops, varieties, requirements, procedures, stages, resources, sources. | M |
| C-02 | **Editorial workflow**: Draft → Expert review → Approved → Published → Archived, with reviewer identity and date. | M |
| C-03 | **Versioning** of procedures and requirements; farmers' active plans stay pinned to the version they started with (with "updated guidance available" notices). | M |
| C-04 | Translation workflow per language with review. | M |
| C-05 | Region/season applicability tags on knowledge items. | M |
| C-06 | Audit log of changes to knowledge content. | S |

### 5.7 Other useful components (from UI reference)

| Component | Priority | Notes |
|---|---|---|
| Activity reminders | S | See F-05 |
| Weather & alerts | S | Location- and crop-aware |
| Soil health check | S | Soil test entry + interpretation from verified ranges |
| Input recommendations | C | Fertiliser/seed guidance strictly from verified dose tables |
| Market price | S | From official market data (see §10) |
| Expert support (chat) | C | Needs expert staffing/partners |
| Farmer community | C | Needs moderation policy |

---

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| **Accuracy & trust** | 100 % of published agronomic facts traceable to a source; no unsourced numbers shown to users. |
| **Usability** | Usable by first-time smartphone users; core flows completable with minimal reading; tested with real farmers. |
| **Localisation** | All UI strings externalised; RTL not required initially (Indian scripts are LTR, except Urdu — confirm). Proper fonts for Indic scripts. |
| **Performance** | Fast start and navigation on low-end Android devices and 2G/3G networks; lazy media loading; small app size. |
| **Offline** | Downloaded crop guides (text, images, audio) usable offline; farmer record entries queue offline and sync later; clear conflict handling. |
| **Availability** | Knowledge browsing should remain available even if weather/market APIs fail (graceful degradation with "last updated" timestamps). |
| **Scalability** | Support growth to many users and many crops/languages without schema redesign (dynamic categories, multilingual content). |
| **Security** | Encrypted transport and storage of personal data; role-based access for admin/experts; secure file uploads. |
| **Privacy & compliance** | Comply with India's **Digital Personal Data Protection Act, 2023**; explicit consent for location and soil data; data export/deletion on request; no sale of farmer data. |
| **Content licensing** | Licence and attribution stored for every media item; takedown process. |
| **Maintainability** | Knowledge base and recommendation rules editable by experts without code changes. |
| **Observability** | Logging of recommendation inputs/outputs (anonymised) to audit and improve rules. |
| **Accessibility** | Large tap targets, readable font sizes, screen-reader labels, audio alternatives. |
| **Cost awareness** | Media hosting/streaming and TTS costs must be budgeted; prefer efficient formats. |

---

## 7. How recommendations and growing procedures interact

```
          ┌───────────────────────── SHARED KNOWLEDGE (verified, reusable) ─────────────────────────┐
          │  Categories ─< Crop >─ Varieties ── Crop/Variety Requirements (soil, water, climate,     │
          │                         │           season, region, duration, cost & yield refs)          │
          │                         └── Growing Procedures (per crop/variety/method/region)           │
          │                                  └── Stages ── Educational Resources ── Sources            │
          └──────────────────────────────────────────────────────────────────────────────────────────┘
                    ▲ reads                                   ▲ reads
                    │                                         │
  Farmer inputs ──► RECOMMENDATION ENGINE ──► Ranked crops ──► "Grow this" ──► PERSONALISED CROP PLAN
  (plot soil,       (match plot conditions     + reasons        (choose          (procedure version +
   water, soil       against requirements;     + gaps           variety)          plot-specific notes +
   test, location,   explain; flag missing      + confidence                      real dates + reminders)
   weather, budget)  data)                                                               │
                                                                                         ▼
                                                                         CULTIVATION RECORD (actuals)
```

1. **Same knowledge, two entry points.** Feature B lets anyone browse procedures directly; Feature A *selects* crops from the same knowledge base. There is one source of truth for crop requirements and procedures.
2. **Recommendation = matching, not generation.** The engine compares the plot's conditions with each crop/variety's *verified requirement ranges* (soil types, pH range, water need, temperature/rainfall ranges, season, region recommendations) and scores suitability. Each criterion contributes an explainable reason ("Suitable: black soil ✓", "Caution: needs assured irrigation; you selected rain-fed").
3. **Missing data lowers confidence, not correctness.** If soil test is missing, the engine uses only soil type and location, says so, and suggests getting a Soil Health Card test.
4. **Plan = standard procedure + overlay.** When a farmer chooses a crop, a *personalised plan* references the standard procedure version and adds plot-specific **overlays** (notes, adjusted reminders, applicable alternatives) drawn from verified conditional guidance — e.g., "for sandy soil, irrigate more frequently as per [source]". The standard instructions are never silently rewritten; overlays are clearly labelled as personalised.
5. **Actuals feed back.** Cultivation records (actual dates, inputs, yields) stay with the farmer; aggregated and anonymised (with consent) they can later help validate estimates — never overriding verified sources automatically.

---

## 8. Conceptual domain model (knowledge vs. farmer data)

This is a conceptual model to guide the database design phase — not a schema.

### 8.1 Shared agricultural knowledge (reusable by all farmers)

| Concept | Description | Key relationships |
|---|---|---|
| **Crop Category** | Food, Cash, Flower, Vegetable, Fruit, Oilseed, Spice, Plantation, Medicinal & Aromatic, Fodder…; hierarchical (subcategories) | Many-to-many with Crop |
| **Crop** | Species-level crop (e.g., Paddy/Rice) with scientific name, local names, description, images | Has many Varieties, Requirements, Procedures |
| **Crop Variety** | Released variety/hybrid with duration, traits, recommended regions/seasons, releasing institution | Belongs to Crop; may override requirements |
| **Crop Requirement** | Verified suitability ranges: soil types, pH, water need, climate (temp/rain/humidity), season, agro-climatic zones, duration | Belongs to Crop or Variety; scoped by region/season; has Sources |
| **Reference Economics** | Cost of cultivation, yield ranges, price ranges — always with region, year, unit, source | Belongs to Crop/Variety; scoped by region/year |
| **Growing Procedure** | A cultivation method for a crop (e.g., transplanted paddy, SRI, direct seeded; field vs. container); versioned | Belongs to Crop (optionally Variety/region/season); has ordered Stages |
| **Growing Stage** | Crop-specific step with day range, instructions, materials, mistakes, warnings, tips | Belongs to Procedure; links to Resources |
| **Educational Resource** | Photo, video, animation, audio, document; language; licence; attribution | Reusable across Stages/Crops; has Source |
| **Pest / Disease** | Name, symptoms, images, management options | Many-to-many with Crop & Stage |
| **Source** | Institution/publication/URL, date, licence | Referenced by any knowledge item |
| **Location reference** | State/district/block/village, agro-climatic zone | Used by requirements & farms |

### 8.2 Individual farmer data (private, owned by the farmer)

| Concept | Description |
|---|---|
| **User / Farmer Profile** | Identity, language, user type, consent settings |
| **Farm** | A farmer's farm with location |
| **Plot** | A specific land parcel within a farm: area, soil type, water sources |
| **Soil Test** | A dated soil test result for a plot (values, units, lab, uploaded file) |
| **Recommendation Run** | Snapshot of inputs, weather data used, ranked results, knowledge version, confidence |
| **Crop Plan** | Farmer's chosen crop/variety/procedure version for a plot & season, with personalised overlays |
| **Cultivation Record** | Actual execution: dates, activities done, inputs, costs, observations, photos, harvest & sale |
| **Bookmarks / Downloads / Reminders** | Personal preferences and offline packages |

**Rule:** farmer data may *reference* knowledge (by ID + version) but never *modify* it.

---

## 9. Trust, provenance & the "no invented agronomy" rule

1. **Every agronomic fact has provenance**: source, region applicability, date, reviewer, review date.
2. **Three visible labels**:
   - **Verified** — from an approved source, expert-reviewed.
   - **Estimate** — derived/calculated from verified data (e.g., cost scaled to the user's plot area), with the method shown.
   - **Not available** — shown honestly instead of guessing.
3. **Role of AI (if used at all)** — restricted to non-agronomic assistance: translation drafts (reviewed by humans), text-to-speech, extracting values from an uploaded soil card (user-confirmed), summarising *existing verified* content in simpler words (reviewed), and search. AI must **not** produce crop recommendations, doses, yields, costs or profits on its own.
4. **Regional validity** — guidance (varieties, doses, sowing windows) is region-specific in India; content must be tagged by state/agro-climatic zone and shown only where applicable, or clearly marked "general".
5. **Pesticide safety** — chemical recommendations only from approved sources, with label-compliance and safety warnings; prefer showing integrated pest management first.
6. **Disclaimer & escalation** — advise contacting the local KVK / agriculture officer / Kisan Call Centre for critical decisions.

---

## 10. External data sources & APIs

> Availability, licensing and API access of each source must be **verified** in the next phase; several government sources offer data portals rather than formal APIs.

### 10.1 Weather & climate
| Source | Use | Notes |
|---|---|---|
| **India Meteorological Department (IMD)** | Official forecasts, district-level agromet advisories, warnings | Access terms to be confirmed |
| **Open-Meteo** | Current/forecast weather, historical data (free API) | Good fallback; check commercial-use terms |
| **NASA POWER** | Long-term historical climate normals (temp, rainfall, solar) | Free, global |
| Commercial providers (OpenWeather, Tomorrow.io, etc.) | Forecasts | Paid tiers; evaluate cost |

### 10.2 Soil
| Source | Use |
|---|---|
| **Soil Health Card portal** (Govt. of India) | Farmer soil test reports; format reference for upload/extraction |
| **ICAR-NBSS&LUP** | Soil maps / soil series, agro-ecological regions |
| **ISRIC SoilGrids** | Global soil property estimates (only as low-confidence fallback, clearly labelled) |

### 10.3 Crop knowledge (primary content sources)
| Source | Use |
|---|---|
| **ICAR institutes** (e.g., crop-specific institutes) | Package of practices, varieties, pest management |
| **State Agricultural Universities** (e.g., UAS Bengaluru/Dharwad, TNAU Agritech Portal, PAU, etc.) | State-specific package of practices, varieties, crop calendars |
| **Krishi Vigyan Kendras (KVKs)** | Local practices, demonstration content, expert review |
| **State agriculture & horticulture departments** | Crop calendars, schemes, advisories |
| **Central Insecticides Board & Registration Committee (CIB&RC)** | Registered pesticides & approved uses |
| **Seed variety release notifications / seed portals** | Official variety information |

### 10.4 Economics & markets
| Source | Use |
|---|---|
| **Cost of Cultivation studies (DES, Ministry of Agriculture) / CACP reports** | Verified cost and yield references by state |
| **AGMARKNET** / **data.gov.in** | Daily mandi prices |
| **e-NAM** | Market prices / trade data |
| **MSP announcements** | Minimum support prices |

### 10.5 Location, language & other
| Source | Use |
|---|---|
| **Local Government Directory (LGD)** codes | Standard state/district/block/village identifiers |
| Maps/geocoding provider (e.g., OpenStreetMap-based, or commercial) | Reverse geocoding GPS → village |
| **Bhashini** (Govt. of India language platform) | Translation, speech-to-text, text-to-speech for Indian languages |
| Other TTS/STT providers | Alternatives for voice features |
| **ICAR / DD Kisan / KVK / SAU video channels** | Demonstration videos — **only with permission/embedding as allowed** |
| SMS / push / WhatsApp providers | Reminders & alerts (later) |

---

## 11. Missing requirements identified

| # | Gap | Why it matters | Proposed handling |
|---|---|---|---|
| G1 | **Content authoring & expert review workflow** not specified | "Verified information" needs a process and people | Add CMS + review workflow (§5.6); identify expert partners |
| G2 | **Knowledge versioning** | Guidance changes; active plans must remain consistent | Version procedures/requirements; pin plans to versions |
| G3 | **Region-specificity of guidance** | Varieties, doses and sowing windows differ by state/zone | Tag all knowledge by region/zone/season |
| G4 | **Cultivation method variants** | Same crop grown differently (transplanted vs. direct-seeded, organic vs. conventional, open field vs. protected, field vs. container) | Multiple procedures per crop |
| G5 | **Home-gardening scale** | Per-acre guidance meaningless for pots | Separate container/small-space procedures and units |
| G6 | **Units & local land measures** | Acre/hectare/gunta/cent/bigha vary | Unit conversion layer |
| G7 | **Authentication & identity** | Who owns farm data; shared phones | Decide sign-in method; support multiple profiles per device? |
| G8 | **Privacy, consent & data rights** | Location + land data are sensitive | DPDP Act compliance, consent screens, deletion |
| G9 | **Recommendation methodology** not defined | Must be explainable and verifiable | Rule/knowledge-based scoring designed with agronomists (next phase) |
| G10 | **Crop rotation / previous crop** | Affects suitability and pest risk | Capture previous crop on plot (later) |
| G11 | **Market/demand risk** | A "suitable" crop may be unprofitable if prices crash | Show market price trends as information, not prediction |
| G12 | **Pesticide regulatory compliance** | Legal & safety risk | Only CIB&RC-approved uses; warnings |
| G13 | **Media storage, licensing & takedown** | Copyright and cost | Licence metadata, permissions log, takedown process |
| G14 | **Analytics & feedback** | Need to know if advice helps | In-app feedback ("Was this useful?"), outcome tracking with consent |
| G15 | **Notifications channel** | Many farmers rely on SMS/WhatsApp more than push | Decide channels |
| G16 | **Platform & distribution** | Android-first? Web? | To be decided (§14) |
| G17 | **Language list & launch region** | Drives content effort | To be decided (§14) |
| G18 | **Disclaimer / liability** | Advice affects livelihoods | Terms of use, disclaimers, escalation to experts |

---

## 12. Risks & challenges

| Risk | Impact | Mitigation |
|---|---|---|
| **Content volume** — hundreds of crops × varieties × regions × languages × media | Very high effort | Launch with a small set of crops for one region; scale with templates and partners |
| **Getting verified data** in structured form (much is in PDFs/booklets) | Slow start | Content team + expert review; start with SAU package-of-practices for launch region |
| **Expert availability** for review | Bottleneck | Partner with KVKs/SAUs/agri colleges; paid reviewers |
| **Video rights** | Legal | Embed from official channels where allowed; obtain written permission; produce own videos with KVK partners |
| **Data gaps** (no soil test, unknown water quantity) | Low-confidence recommendations | Honest confidence labels; guide users to Soil Health Card testing |
| **Weather API reliability/cost** | Degraded experience | Caching, fallback provider, timestamps |
| **Low literacy & digital skills** | Adoption | Voice-first, image-first; field testing with farmers |
| **Connectivity** | Unusable app | Offline packages, small media, SMS fallback |
| **Over-trust in app advice** | Crop loss | Clear disclaimers; risks shown on every recommendation; expert escalation |
| **Translation quality** for technical terms | Misunderstanding | Human-reviewed translations; local terminology glossary |
| **Scope creep** (market, community, chat) | Delayed MVP | Phase the roadmap (§15) |

---

## 13. Suggested improvements that benefit farmers

1. **"Why / Why not" explanations** for every recommendation and exclusion — builds trust and teaches.
2. **Data-completeness meter** — "Add a soil test to improve accuracy" nudges with a link to how to get a Soil Health Card.
3. **Season-aware home screen** — "It's Rabi sowing time in your district: crops suitable for your plot".
4. **Real-date crop calendar** — convert "Day 21–30" into actual dates from the farmer's sowing date, with reminders.
5. **Weather-linked advisories** — e.g., "Rain expected tomorrow — consider postponing spraying" sourced from IMD agromet advisories or verified rules.
6. **Photo-based soil type helper** — reference photos and simple field tests to identify soil type (verified guidance).
7. **Low-data mode** — audio + images instead of video; download over Wi-Fi.
8. **Local names & voice search** — farmers search "ragi" or "ಜೋಳ", not scientific names.
9. **Offline "crop pack"** — one tap downloads the full guide for a chosen crop in the chosen language.
10. **Simple record-keeping** — season cost & yield summary helps loan applications and next-season decisions.
11. **Government scheme pointers** — show relevant official schemes (subsidies, insurance like PMFBY) as links, not advice.
12. **Nearest help** — show the nearest KVK / agriculture office / Kisan Call Centre for escalation.
13. **Feedback loop** — "Did this step work for you?" to flag unclear or problematic content for expert review.
14. **Family/shared-device profiles** — one phone used by multiple family members.

---

## 14. Open questions for the product owner

### 14.1 Decisions recorded (2026-11-15)

| # | Topic | Decision | Implications |
|---|---|---|---|
| D1 | Launch region | **Karnataka** | Primary content sources: UAS Bengaluru, UAS Dharwad, UAHS Shivamogga, UHS Bagalkot, Karnataka KVKs, Karnataka Dept. of Agriculture/Horticulture. Karnataka's agro-climatic zones become the first region tags. Other states are added later through the same region tagging. |
| D2 | Languages at launch | **Kannada, Hindi, English** | Every UI string, crop name (with local names), stage text and audio narration is needed in 3 languages. Translations need human review. Indic font support is needed for Kannada and Devanagari. |
| D3 | Platform | **Cross-platform app (Android + iOS) and web** | Choose a stack in Phase 2 that shares code across mobile and web. Offline-first behaviour is required on mobile; the web can be online-first. The backend API is shared. |
| D4 | MVP scope | **Feature A + Feature B + crop tracking (Journey C)** | Requirements F-03, F-04 and F-05 (crop plan, cultivation record, reminders) move from **S** to **M**. The MVP crop list should stay small so content quality is achievable. |
| D5 | Expert partners | **Not yet** | Content starts from public, citable sources (SAU package-of-practices, ICAR publications). It is published with the status **"Source-cited — pending expert review"**, shown to users as a distinct label (in addition to Verified / Estimate / Not available). Finding a KVK or SAU review partner is an early project task. |
| D6 | Launch crops | **Paddy, Maize, Tomato, Chilli, Groundnut, Onion** | See §14.3. |

### 14.3 Launch crop set (D6)

| Crop | Initial categories (multi-category allowed) | Content notes for Phase 4 |
|---|---|---|
| Paddy (Rice) | Food Crops → Cereals | Likely needs more than one procedure (for example transplanted and direct-seeded), each with its own stages. A nursery stage applies only to transplanted paddy. |
| Maize | Food Crops → Cereals; Fodder Crops | Also grown for fodder. Confirm with sources whether a separate fodder procedure is needed. |
| Tomato | Vegetable Crops | Nursery + transplanting. Good candidate for a home-garden (container) procedure. |
| Chilli | Vegetable Crops; Spice Crops | Green chilli and dry chilli differ at harvest and post-harvest. A good test case for multi-category crops. |
| Groundnut | Oilseed Crops; Commercial / Cash Crops | Direct-sown. Post-harvest drying and storage are important stages. |
| Onion | Vegetable Crops | Several raising methods exist. Model each as a procedure only where a source documents it. |

**Rules for this set:**
- Every procedure, variety, sowing window, input quantity, cost and yield must come from a citable Karnataka source (UAS Bengaluru/Dharwad, UAHS Shivamogga, UHS Bagalkot, KVKs, state departments) or ICAR. Nothing is filled in from general knowledge.
- Varieties are limited to ones that Karnataka sources recommend.
- The recommendation engine (Feature A) chooses only from these 6 crops at launch. Results must say this clearly (for example: "Showing suitable crops from the 6 currently supported"). This avoids implying that no other crop fits the plot.
- Content load at launch: 6 crops × their procedures × 3 languages (kn/hi/en), plus audio and media for each stage.

### 14.4 Still open

1. ~~**Launch region**~~ — decided (D1).
2. ~~**Languages at launch**~~ — decided (D2).
3. ~~**Platform**~~ — decided (D3). Any specific technology preferences or constraints still welcome.
4. ~~**MVP scope**~~ — decided (D4).
5. ~~**Launch crop list**~~ — decided (D6).
6. ~~**Content & expert partners**~~ — decided (D5).
7. **Media** — Do you plan to shoot your own videos/photos, use partner content, or embed official channels?
8. **Sign-in** — Mobile OTP acceptable? Should browsing work without login?
9. **Cultivation tracking (Journey C)** — In MVP or later?
10. **Community / expert chat / market prices** — Later phases?
11. **Business model** — Free? Government/NGO partnership? Affects hosting, TTS and content budgets.
12. **Hosting / budget constraints** — Any preferred cloud provider or cost ceiling?

---

## 15. Proposed next phases

| Phase | Output |
|---|---|
| **1. Vision & requirements** *(this document)* | Shared understanding, open questions answered |
| **2. Architecture & technology decisions** | Cross-platform stack (mobile + web), backend, hosting, offline strategy, ADRs |
| **3. Domain & database design** | Schema for knowledge vs. farmer data, versioning, localisation (kn/hi/en), provenance |
| **4. Content pipeline** | CMS, review workflow, seed content for launch crops from Karnataka sources |
| **5–7. MVP build** *(single MVP release per D4)* | Feature B (guide), Feature A (recommendations), personalised plans & crop tracking |
| **8. Field testing** | Usability testing with Karnataka farmers; iterate |
| **9. Extensions** | Market prices, pest diagnosis, community, expert chat |

---

## 16. Glossary

| Term | Meaning |
|---|---|
| **Kharif / Rabi / Zaid** | Indian cropping seasons (monsoon / winter / summer) |
| **KVK** | Krishi Vigyan Kendra — district-level farm science centre |
| **ICAR** | Indian Council of Agricultural Research |
| **SAU** | State Agricultural University |
| **Package of Practices (PoP)** | Official recommended cultivation practices for a crop/region |
| **Soil Health Card (SHC)** | Government soil test report given to farmers |
| **Agro-climatic zone** | Region with similar climate/soil used for agricultural planning |
| **Procedure** | A crop's cultivation method, made of ordered stages |
| **Stage** | One step in a procedure (e.g., land preparation) |
| **Overlay** | Plot-specific, clearly labelled notes layered on a standard procedure |
| **Recommendation run** | One saved execution of the recommendation engine with its inputs and outputs |
