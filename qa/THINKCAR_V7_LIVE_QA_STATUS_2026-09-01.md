# THINKCAR V7 live QA status — 2026-09-01

## Production deployment
- WordPress page: 10709 (`/selector-thinkcar/`)
- Public mirror manifest: `deploy/thinkcar-current.json`
- Release: `V7-job-evidence-core-native-2026-09-01`
- Mirror commit pinned by WordPress: `f342c9229ec994c1639c0d08623624772a5ccad4`
- Canonical source: `CartlineAI/Monetization`
- Canonical source artifact: `ddd1761c43c8b590cad389b39b804b1d546b4285`
- WordPress revision before/around deployment: 10904; previous layered state preserved in revision 10894.
- WordPress object cache was flushed successfully.
- Fresh Opera read of `wp-json/wp/v2/pages/10709?context=view&_fields=id,modified,content&cb=20260901-0746` confirmed `modified=2026-09-01T03:41:53` and exactly one production script: `deploy/thinkcar-mvp.js` pinned to mirror commit `f342c9229ec994c1639c0d08623624772a5ccad4`.
- An older Opera REST tab still showed the layered 2026-08-31 content; that tab was stale and must not be used as deployment evidence.

## Static/source gates already passed
- Core-native V7 bundle excludes legacy job overlay from the canonical module list.
- Build gate rejects customer-facing strings:
  - `Nu avem încă detalii suficiente pe vehicul`
  - `NECONFIRMAT PE VEHICUL`
- `verify-thinkcar-job-evidence-model.mjs` validates evidence semantics for Volkswagen Passat 2003 and prevents generic brake/battery/transmission text from being treated as exact function proof.
- Recommendation policy is technical/evidence first.
- P0420 catalog entry and Engineering WPForms transport are present in canonical V7 source.

## Live THINKCAR provider evidence verified in Opera
Direct producer endpoint checks were run in Opera against Volkswagen Passat 2003.

### Live Data
Query: `getModelPage` with `modelName=VW`, `model=PASSAT`, `modelYear=2003`, `function=Live Data`.
Result: `appCode=S0000`, success, total `21`. Returned rows include Engine Electronics, Transmission Electronics, Brake Electronics, Instrument Cluster, Anti-Theft Immobilizer and other ECUs. This proves the upstream THINKCAR vehicle-function endpoint is responsive and the QA stall is not caused by a general provider outage.

### Special Functions
Query: same vehicle with `function=Special Functions`.
Result: `appCode=S0000`, success, total `21`. Returned rows are mostly ECU/system names with `subFunction=null`; examples include:
- `01 Engine Electronics`
- `02 Transmission Electronics`
- `03 Brake Electronics`
- `25 Anti-Theft Immobilizer`
- `FF01 Skoda Engine Electronics` (cross-brand row in producer data)

Evidence implication under V7:
- Generic `Brake Electronics` must NOT prove EPB/brake reset.
- Generic `Transmission Electronics` must NOT prove gearbox relearn/adaptation.
- Generic engine/system rows must not prove battery, DPF, TPMS, coding, clutch, etc.
- `25 Anti-Theft Immobilizer` is an explicit semantic signal for the IMMO job and may upgrade that job when product evidence also passes.
- The live-fixes cross-brand filter remains necessary because THINKCAR returned `FF01 Skoda Engine Electronics` inside a VW Passat result set.

## Job evidence architecture verified
`thinkcar/job/thinkcar-job-map.js` defines exactly 12 jobs:
- direct vehicle functions: `live_data`, `active_test`
- service-module jobs: `oil_reset`, `brake_reset`, `battery`, `dpf`, `tpms`, `coding`, `immo`, `ev`, `gearbox`, `clutch`

Service-module confirmation uses exact producer module/evidence terms rather than broad ECU names. Recommendation candidates are commercial preference order only AFTER product evidence passes.

## Isolated live QA harness
A production-external QA runner exists only in this public mirror. It is NOT loaded by `/selector-thinkcar/`.

Commits:
- `02f01535a6b2baa9b25a145fdf450ce3b1682a1f` — initial isolated runner
- `01c1e106db475b8d45588ae472e8211e4129acce` — do not wait for iframe load
- `127d11b12d527bda90324a5b4f7603dee7552d48` — expose per-job progress in title
- `af80c9e6b53a1b84846425705924b7d48d7551a2` — wait for full V7 bootstrap before clicks
- `f0f6f3ba0d1b1ef3f85d84b96635a0c13fcf194f` — expose bootstrap readiness markers in title
- `9d6c9e9955d21d8c71244d58211d78502264bc23` — current staged runner: core bootstrap no longer blocks on DTC/Engineering, validates actual VW/Passat/2003 field values, reports detailed bootstrap bits, runs DTC and Engineering as separate readiness phases, and uses longer per-job provider timeout.

Temporary WordPress QA page:
- ID: 10926
- slug: `/thinkcar-v7-live-qa-temp/`
- Last confirmed public REST state was pinned to runner commit `af80c9e6b53a1b84846425705924b7d48d7551a2`.
- This page exists only to load the GitHub QA runner and iframe the live selector same-origin.
- It must be repinned to current runner commit `9d6c9e9955d21d8c71244d58211d78502264bc23` once WPVibe write access is available.

## Opera observations
- Opera connector intermittently drops `tab-content` with `Browser not connected` while navigation/list-tabs may still work.
- Inline script execution on the temporary page was proven (`QA INLINE LOADED`).
- jsDelivr execution from the public GitHub mirror was proven (`QA CDN LOADED`).
- Runner `127d11...` reached `QA JOB 1/12 · Date live`, proving real DOM setup and the first programmatic button click attempt started, but it was launched before full UI readiness.
- Runner `af80c9...` reached `QA INIT · THINKCAR V7` and remained waiting for full bootstrap markers in the iframe.
- Direct THINKCAR API checks prove the upstream provider itself is responsive for the test vehicle.
- Opera connector is currently reachable again; WPVibe write availability remains the gate for repinning temporary page 10926.

## Current engineering conclusion
No production code change is justified yet. Static/source gates and direct provider evidence are consistent; the unresolved failure is in live browser QA readiness/transport. The current GitHub runner has been hardened specifically to isolate that path without contaminating production.

## Remaining mandatory live gates
Do not claim completion until all of these pass in Opera against the production selector:
1. Repin temporary page 10926 to QA runner `9d6c9e9955d21d8c71244d58211d78502264bc23` using WPVibe.
2. Volkswagen / Passat / 2003 is actually selected and retained in the live DOM.
3. Exactly 12 `Alege o lucrare` buttons are present and each reaches a terminal result.
4. Forbidden strings remain absent after all 12 customer-facing results.
5. Recommendation presence/absence follows evidence policy for each job.
6. Symptom flow reaches a terminal analysis/result.
7. P0420 renders the expected catalyst explanation.
8. Engineering submit returns a confirmed successful WPForms submission.
9. Capture the final QA JSON/status from Opera.
10. Trash temporary QA page 10926 after verification.
11. If a live gate exposes a real product defect, fix it first in `CartlineAI/Monetization`, rebuild/mirror, then update production through WPVibe; do not patch production ad hoc.
