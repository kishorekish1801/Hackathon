# AquaWatch AI - Smart Engine: Judge Q&A & Technical Architecture

### Hackathon Role: Member 3 (Smart Engine Only)
**Project**: AquaWatch AI  
**Theme**: Smart Water Management  
**Branch**: `feature/smart-engine`  

---

## 1. How does categorisation work?
- **Approach**: Transparent, weighted n-gram phrase matching and keyword scoring over normalized text.
- **Why not a complex ML / Deep Learning model?**: With minimal domain training data during a hackathon, training an uncalibrated neural model would cause unpredictable hallucinations and overfit. Instead, a deterministic rule-weighted scoring model guarantees 100% explainability, instant execution latency (<2ms), zero cloud dependency, and rock-solid reliability for municipal dispatch.
- **Workflow**:
  1. Citizen text is normalized (lowercased, punctuation handled, unicode normalized).
  2. The text is passed through `language_service` which maps bilingual Tamil/Tanglish phrases to normalized concepts.
  3. High-signal phrases (e.g. `"pipeline burst"`, `"main line burst"`, `"water tank is overflowing"`) receive primary weights (7–10 points).
  4. Contextual keywords (e.g. `"burst"`, `"clogged"`, `"muddy"`) provide supporting signals (2–4 points).
  5. Disambiguation rules distinguish subtle differences (e.g., distinguishing a major burst in `DAMAGED_PIPELINE` from a localized joint seep in `PIPE_LEAK`, or distinguishing an unattended open faucet in `PUBLIC_WATER_WASTAGE` from a broken fixture in `BROKEN_TAP`).
  6. **Safe Fallback**: If the description is empty, `None`, or fails to reach the match threshold (3 points), it safely returns `"OTHER"`.

---

## 2. How is priority determined?
Priority is **never** based solely on the citizen's personal rating, because citizens often under-report or over-exaggerate emergencies. Instead, it computes an objective multi-factor score:

$$\text{Total Score} = \text{Severity Rating Pts} + \text{Category Risk Pts} + \text{Keyword Pts} + \text{Proximity Density Pts}$$

1. **Citizen Severity Rating (1 to 5)**:
   - 1: 10 pts, 2: 20 pts, 3: 30 pts, 4: 40 pts, 5: 50 pts
2. **Category Base Risk**:
   - `DAMAGED_PIPELINE`: +25 pts (high volume infrastructure destruction / road flooding)
   - `WATER_CONTAMINATION`: +25 pts (immediate public health / disease outbreak hazard)
   - `DRAINAGE_PROBLEM`: +15 pts (sanitation vector, dengue/cholera risk)
   - `NO_WATER_SUPPLY`: +15 pts (community water deprivation)
   - `TANK_OVERFLOW`: +10 pts (continuous untreated loss)
   - `PIPE_LEAK` / `PUBLIC_WATER_WASTAGE` / `BROKEN_TAP`: +5 pts (localized fixture loss)
   - `OTHER`: 0 pts
3. **Critical Severity Keywords**:
   - Emergency (`"burst"`, `"flooding"`, `"explosion"`): +20 pts
   - Health Hazard (`"poison"`, `"toxic"`, `"foul"`, `"sewage"`): +20 pts
   - High Impact Public Areas (`"hospital"`, `"school"`, `"highway"`, `"market"`): +25 pts
   - Volume (`"gushing"`, `"continuous"`): +10 pts
   - Mitigating factors (`"slowly"`, `"minor"`, `"small"`, `"dripping"`): -10 pts
4. **Nearby Incident Concentration**:
   - 0 reports: 0 pts
   - 1–2 reports: +10 pts
   - 3–4 reports: +25 pts
   - 5–9 reports: +35 pts
   - 10+ reports: +45 pts
5. **Threshold Mapping**:
   - $\ge 70$: **CRITICAL**
   - $\ge 50$: **HIGH**
   - $\ge 30$: **MEDIUM**
   - $< 30$: **LOW**

---

## 3. How does location segregation work?
- **Haversine Great-Circle Formula**:
  Earth radius $R = 6,371,000$ meters:
  $$\Delta\phi = \text{radians}(\text{lat}_2 - \text{lat}_1), \quad \Delta\lambda = \text{radians}(\text{lon}_2 - \text{lon}_1)$$
  $$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
  $$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
  $$d = R \cdot c$$
- **Proximity Threshold**:
  Reports within **500 meters** are automatically identified as physically related incidents.
- **Hotspot Clustering**:
  `group_reports_by_location()` performs spatial density clustering without requiring heavy external GIS libraries:
  - Groups interconnected nearby incidents.
  - Computes the geographical centroid (`center_latitude`, `center_longitude`).
  - Summarizes `report_count` and `critical_count` to give municipal officers an immediate visual heatmap of urgent clusters.

---

## 4. Why do multiple reports increase urgency?
1. **Independent Verification**: In citizen reporting systems, single reports may be false alarms, prank submissions, or minor personal grievances. When multiple independent users submit reports from different devices within a 500m radius, the probability of a genuine, critical event approaches 100%.
2. **Cascading Failure Indication**: A burst underground main pipeline or backed-up drainage trunk line affects dozens of nearby streets simultaneously. A sudden spike in local density confirms an escalating, widespread infrastructure failure rather than an isolated tap drip.
3. **Public Exposure**: More complaints in a dense geographic radius directly indicate that more citizens, schools, hospitals, or commercial areas are actively impacted.

---

## 5. Why don't we estimate litres of wasted water?
1. **Physical Impossibility Without Sensor Telemetry**: Water loss rate ($Q = A \cdot v = A \sqrt{2g \Delta H}$) strictly requires knowing pipe diameter, water line pressure (bar/psi), fracture geometry, and discharge duration.
2. **False Precision Misleads Dispatchers**: Providing an uncalibrated estimate (e.g. *"2,430 Litres Lost"*) based solely on a citizen's text description gives emergency response teams a false illusion of scientific measurement, which could distort resource dispatching.
3. **Hackathon Pragmatism**: The team agreed to prioritize actionable, reliable signals (Category & Urgency Priority) rather than speculative numbers.

---

## 6. Why don't we display AI confidence?
1. **Decision Paralysis for Municipal Operators**: When a municipal worker sees `"Priority: CRITICAL | Confidence: 63%"`, they hesitate over whether to dispatch an emergency repair crew or wait.
2. **Accountability & Explainability**: In civic administration, every decision must be auditable. Rather than an opaque confidence score, our engine provides a deterministic, inspectable breakdown (`get_priority_breakdown()`) showing exactly which rules and multipliers triggered the classification.

---

## 7. How could this become more advanced later?
1. **IoT Sensor Fusion**: Ingest real-time SCADA telemetry, acoustic leak detection sensors, and pressure transducer data to correlate citizen tickets with actual line pressure drops.
2. **Computer Vision Verification**: Train a lightweight CNN/Vision Transformer on incident images to detect pipe fractures, dirty water discoloration, or water level rise.
3. **Fine-Tuned Domain LLM**: Fine-tune a quantized local SLM (such as Gemma 2B or Llama 3 8B) on municipal civic grievance datasets for nuance extraction, sarcasm detection, and sentiment analysis.
4. **Automated Dispatch Routing**: Connect to municipal GIS shapefiles to identify the exact water valve IDs to shut down and automatically route the nearest repair van.

---

## 8. How would multilingual support work?
- **Current Lightweight Implementation**:
  `language_service.py` provides bidirectional normalization for **Tamil (Unicode Script)** and **Tanglish (phonetic Tamil in Latin script)** (e.g., *"thanni varala"* -> `no water supply`, *"saakadai adaippu"* -> `drainage blocked`).
- **Production Architecture for 22 Indian Official Languages**:
  1. Integrate a dedicated Indian language tokenization pipeline such as AI4Bharat's **IndicBERT** or **IndicTrans2** running on an on-premise inference server.
  2. Support voice-to-text input using Whisper or Bhashini ASR so illiterate or rural citizens can record complaints in regional dialects.
  3. Normalize all regional grievance transcripts to standardized municipal category taxonomies before dispatching.
