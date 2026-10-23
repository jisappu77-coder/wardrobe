# Wardrobe production delivery plan

This roadmap is based on the feasibility study in [docs/feasibility-study.md](./feasibility-study.md). It is an implementation plan, not a claim that features are already complete.

## Product release targets

- **Web:** responsive production app and installable PWA where supported.
- **Android:** store-ready build and tested local/offline workflows.
- **iOS:** App Store-ready build and tested local/offline workflows.
- **AI:** guaranteed deterministic local recommendations; optional small on-device LLM enabled only on benchmarked devices/runtimes.

## Milestones

### M0 — Reproducible engineering baseline (week 1–2)
- [ ] Pin dependencies and commit lockfiles.
- [ ] Upgrade Expo SDK 52 to an explicitly chosen supported stable SDK; validate each step with Expo diagnostics.
- [ ] Make the CI workflow parse web JavaScript, run unit tests, validate mobile dependencies and build web.
- [ ] Split web source into maintainable modules without changing user-visible behaviour.
- [ ] Capture current web and native baseline screenshots and test scripts.
- **Exit:** clean install and repeatable green CI; working web and mobile dev builds.

### M1 — Shared domain model and durable storage (week 2–4)
- [ ] Define and validate Garment, Outfit, Preference and SchemaVersion.
- [ ] Add migration tests and fixture data.
- [ ] Web: store structured data in IndexedDB; photos as persistent blobs with safe URL lifecycle.
- [ ] Mobile: store imported photos inside app-managed file storage; persist IDs/metadata in a suitable local database.
- [ ] Add JSON export/import, storage error handling and recovery UX.
- **Exit:** add/edit/delete/favourite/restart/reload/export/import all pass on web and mobile.

### M2 — Complete closet and outfit workflows (week 3–5)
- [ ] Add/edit/delete garments on both platforms.
- [ ] Validate categories, colours, user-defined tags and search.
- [ ] Save, edit, duplicate and delete outfit combinations.
- [ ] Ensure saved outfits handle garments that were deleted.
- [ ] Add accessibility and empty/loading/error states.
- **Exit:** all acceptance tests pass with at least 100 sample garments and real photo files.

### M3 — 3D wardrobe (week 4–7)
- [ ] Define a renderer-independent garment selection/scene state.
- [ ] Web: local or reliably versioned Three.js dependency; check WebGL capability and provide fallback.
- [ ] Mobile: benchmark candidate 3D integration in an Expo development build.
- [ ] Implement touch rotation, zoom, reset, garment selection and connection to real wardrobe items.
- [ ] Profile low/mid-range Android, representative iPhone and mobile browsers.
- **Exit:** no blank scene; fallback works; gestures and selection pass; target frame-time and memory budget documented.

### M4 — Local AI stylist (week 5–8)
- [ ] Add unit tests and improve current recommendation scoring.
- [ ] Add occasion, preferences and valid-item-ID constraints.
- [ ] Add deterministic explanations and AI capability/settings UI.
- [ ] Benchmark browser model candidates (WebGPU and fallback), including model download and cold-start.
- [ ] Spike native model runtime using dev builds; compare LiteRT-LM versus a maintained llama.cpp-compatible option.
- [ ] Enable optional LLM only for device/runtimes that pass performance and quality gates.
- **Exit:** baseline recommender works offline everywhere; optional LLM can be downloaded/canceled/deleted, never blocks closet use and passes output validation.

### M5 — Identity and optional cloud sync (week 7–10)
- [ ] Decide sign-in and backend provider.
- [ ] Configure per-user data ownership and row-level security.
- [ ] Use private object storage and upload size/type limits for photos.
- [ ] Add sync status, retry, conflict handling and local-first behavior.
- [ ] Test account deletion, data export and cross-user isolation.
- **Exit:** two devices for one account converge correctly; different accounts cannot read each other's records or photos.

### M6 — Release hardening (week 9–15)
- [ ] End-to-end smoke test for web, Android and iOS.
- [ ] Test offline startup, bad network, storage full, malformed imports and image failures.
- [ ] Add crash/error capture and privacy-conscious diagnostics.
- [ ] Review licences for all assets/models/dependencies.
- [ ] Prepare privacy policy, store metadata, screenshots, app icon and onboarding.
- [ ] Produce release candidates and perform real-device regression.
- **Exit:** no known critical/high defects; builds reproducible; privacy/security and store checklists approved.

## Cross-platform acceptance gate

Every release must:
1. Pass unit tests and CI.
2. Keep user data after restart and app update.
3. Work offline for core closet/outfit operations.
4. Show meaningful errors and fallbacks instead of blank screens.
5. Never call cloud AI or send photos for local recommendations.
6. Never recommend item IDs that are not present.
7. Pass accessibility checks for essential controls.
8. Pass at least one physical Android and one physical iOS test before store submission.

## Delivery rules

- Build one vertical slice at a time.
- Keep demo/sample data separable from the user's actual closet.
- Keep web, mobile and domain packages independently testable.
- Do not enable a feature merely because its screen renders.
- No production release until the corresponding exit criteria have evidence.
