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

## Static/source gates already passed
- Core-native V7 bundle excludes legacy job overlay from the canonical module list.
- Build gate rejects customer-facing strings:
  - `Nu avem încă detalii suficiente pe vehicul`
  - `NECONFIRMAT PE VEHICUL`
- `verify-thinkcar-job-evidence-model.mjs` validates evidence semantics for Volkswagen Passat 2003 and prevents generic brake/battery/transmission text from being treated as exact function proof.
- Recommendation policy is technical/evidence first.
- P0420 catalog entry and Engineering WPForms transport are present in canonical V7 source.

## Isolated live QA harness
A production-external QA runner was created only in this public mirror. It is NOT loaded by `/selector-thinkcar/`.

Commits:
- `02f01535a6b2baa9b25a145fdf450ce3b1682a1f` — initial isolated runner
- `01c1e106db475b8d45588ae472e8211e4129acce` — do not wait for iframe load
- `127d11b12d527bda90324a5b4f7603dee7552d48` — expose per-job progress in title
- `af80c9e6b53a1b84846425705924b7d48d7551a2` — wait for full V7 bootstrap before clicks
- `f0f6f3ba0d1b1ef3f85d84b96635a0c13fcf194f` — expose bootstrap readiness markers in title (latest)

Temporary WordPress QA page:
- ID: 10926
- slug: `/thinkcar-v7-live-qa-temp/`
- This page exists only to load the GitHub QA runner and iframe the live selector same-origin.

## Opera observations
- Opera connector is live enough to list tabs and inspect some accessibility trees, but it intermittently drops `tab-content` with `Browser not connected` while `list-tabs` still works.
- Inline script execution on the temporary page was proven (`QA INLINE LOADED`).
- jsDelivr execution from the public GitHub mirror was proven (`QA CDN LOADED`).
- Runner `127d11...` reached `QA JOB 1/12 · Date live`, proving real DOM setup and the first programmatic button click attempt started.
- Runner `af80c9...` reached `QA INIT · THINKCAR V7` and remained there while waiting for full bootstrap markers.
- The latest diagnostic runner `f0f6f3...` could not be loaded into the temporary WordPress page because WPVibe hit its free-plan daily fair-use limit before the final update.

## Current blocker
WPVibe returned a daily fair-use limit and would not allow the temporary QA page to be updated to the latest diagnostic runner. Therefore the live Opera suite cannot yet truthfully be marked complete.

Do not claim completion until the following live checks pass in Opera against the production selector:
1. Volkswagen / Passat / 2003 identified.
2. All 12 `Alege o lucrare` buttons execute and reach a terminal result.
3. Forbidden strings are absent from all customer-facing results.
4. Recommendations appear only according to evidence/recommendation policy.
5. Symptom flow reaches a terminal analysis/result.
6. P0420 renders the expected catalyst explanation.
7. Engineering submit returns a confirmed successful WPForms submission.
8. Temporary QA page 10926 is trashed after verification.
