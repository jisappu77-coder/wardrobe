# Wardrobe production feasibility study

**Prepared:** 23 October 2026  
**Decision:** Proceed, with an offline-first scope and staged on-device AI rollout.  
**Target:** Production web application plus Android and iOS apps.

## 1. Executive summary

Wardrobe is feasible to build on the existing repository, but the present code must be treated as a foundation rather than a production release. The web app is a single large HTML file with inline CSS/JavaScript and a CDN-loaded Three.js scene. The Expo app is a single-file React Native implementation with AsyncStorage-based local persistence and a placeholder 3D screen. The repository already contains a small pure-JavaScript outfit recommendation engine, but it is not yet integrated into the app screens or covered by tests.

The recommended product is an offline-first wardrobe and outfit planner with optional sign-in and sync. Outfit ranking must work locally on all target platforms. A generative model can be added as an optional explanation/refinement layer after device benchmarks. Requiring an LLM for normal app operation would make startup, storage footprint, browser compatibility and support materially worse.

**Overall feasibility**
- Digital closet, search, filters, favourites and outfit builder: **High**
- Reliable local persistence and photo management: **High**, with a deliberate storage migration
- Web 3D wardrobe: **High**
- Cross-platform mobile 3D wardrobe: **Medium**; requires native-device profiling and a renderer integration choice
- Rule-based on-device outfit recommendations: **High**
- Generative LLM running locally in every mobile web browser: **Low as a universal requirement; medium as an optional capability on supported devices**
- Optional user accounts and cross-device sync: **High**, with careful authorization and migration testing
- Full production release: **Feasible**, contingent on device access, builds, QA and store approval

## 2. What exists today

Repository inspection shows:
- `index.html` contains the web interface, data, UI events and Three.js code together.
- The web interface starts with sample garments and loads Three.js from a CDN. This means first-load 3D currently depends on network access to that CDN.
- No `localStorage` use was found in the web source. The web closet and saved looks therefore need persistence before being treated as user data.
- `mobile/App.js` contains the mobile interface and AsyncStorage persistence for garment metadata, favourites, active outfit and saved looks.
- Mobile photos are represented by image URIs. Long-term photo durability and migration/recovery after app updates must be tested.
- `mobile/package.json` uses Expo SDK 52, React Native 0.76.5 and React 18.3.1. As of this study, Expo SDK 58 is the current release; the project needs a controlled SDK upgrade and dependency validation.
- `src/local-stylist.js` is an initial pure-JavaScript ranking implementation. It is not yet integrated or tested. Its scoring and category coverage need unit tests and refinement using realistic wardrobe fixtures.
- An initial GitHub Actions workflow and web syntax check have been added, but a green workflow run has not been confirmed in this study.

## 3. Product scope and release boundary

### Production MVP

1. Closet: add/edit/delete garments, photo import, category, colour, brand, tags, favourites, search and filters.
2. Outfit studio: create, edit, save, duplicate and delete outfits; occasion and optional weather constraints.
3. Local data: dependable persistence, schema versioning, import/export or backup, and no data loss on app restart.
4. 3D closet: rotate, zoom, reset, select garments and show a clear 2D/fallback state if graphics are unavailable.
5. Local stylist: deterministic recommendations from owned pieces, with explanations and no invented garment IDs.
6. Cross-platform delivery: responsive web/PWA, Android and iOS builds, accessible controls, crash/error reporting and release test suite.
7. Privacy and control: understandable photo permissions, explicit sync choice, deletion/export, and disclosure before downloading optional model files.

### Post-MVP / gated features

- Generative explanations from a compact local LLM
- Automatic photo classification, background removal or body/fit analysis
- Weather API, calendar and shopping integrations
- Social sharing and public profiles

These features should not delay a reliable closet, outfit studio or baseline stylist. Body-image or fit claims should not be made without separate accuracy, privacy and safety review.

## 4. Local AI feasibility

### Recommended architecture: hybrid, offline-first

**Layer A — always-available stylist.** Run deterministic JavaScript locally on web and mobile. Rank valid clothing combinations with explicit factors such as garment category coverage, user preferences, colour compatibility, occasion, repeat/wear balance and weather when the user enables it. This layer works offline after the user's wardrobe is available, uses little memory, is fast, and is easy to test.

**Layer B — optional on-device language model.** Use a compact quantized instruct model only to explain recommendations, map natural-language preferences to structured constraints, or rerank a small candidate set. Do not ask the model to invent wardrobe inventory or make the final choice without validating its output against stored garment IDs.

**Web runtime.** Benchmark Transformers.js with WebGPU and quantized model weights first; keep the rule engine as fallback. Hugging Face documents browser inference on CPU/WASM or WebGPU and supports quantized data types. WebGPU support varies by browser/device; current Transformers.js documentation reports it is not universal. WebLLM also requires WebGPU for local inference. Therefore model support must be detected at runtime, and the app must remain fully useful without it.

**Native runtime.** Select the inference runtime only after building a proof on the actual Expo/React Native target. LiteRT documents support for Android, iOS and web, but a shared web/native implementation is not automatically a drop-in single package; packaging, model format, native bindings, and acceleration must be validated. A native runtime may require a custom development build. Expo says Expo Go cannot host arbitrary native modules that are not already bundled, so production development should move to development builds.

**Model candidate policy.** Benchmark a small model family such as SmolLM2 135M/360M or Qwen2.5 0.5B Instruct as candidates, not as preselected production dependencies. SmolLM2 offers 135M and 360M variants described for on-device usage; Qwen2.5-0.5B is Apache 2.0. Before selection, record the exact converted artifact, quantization, licence, download size, memory peak, cold start, first-token latency and output quality. A model's parameter count does not guarantee the downloaded package is small: tokenizer, weights, runtime and temporary buffers all add overhead.

### AI release gates

Do not enable the optional model by default until all are true:
- It loads only after the user opts into AI or opens the stylist.
- The model download size and storage use are shown before download; progress, cancel and delete controls work.
- A low-memory Android phone and representative iPhone pass measured latency/memory tests.
- Supported mobile browsers pass model initialization and offline re-open tests.
- Unsupported browsers use the rule engine with no blocking error.
- Outputs are schema-validated and only reference valid closet IDs.
- No closet photos or user details are sent to a model server during local inference.
- Model and runtime licences are reviewed for the intended distribution.

## 5. Technical architecture recommendation

### Client applications
- Web: modern componentized JavaScript/TypeScript app; ship a PWA where feasible. Host static app assets separately from user data services.
- Mobile: Expo + React Native, upgraded from SDK 52 to a currently supported stable SDK after compatibility checks. Use custom development builds for modules requiring native code.
- Shared domain package: one canonical garment/outfit schema, validation, recommendation engine, migration code and test fixtures shared where practical.
- 3D: keep data and interaction contracts platform-independent; adapt the rendering layer per platform rather than sharing one fragile UI implementation. Web Three.js can remain the web renderer; mobile choice must be proven on-device.
- Local storage: browser IndexedDB for web metadata plus durable image blobs and explicit quota/error handling; mobile database/file storage rather than relying on image-picker temporary URIs. AsyncStorage can remain suitable for small settings but should not be the main photo repository.
- Cloud sync: optional authentication plus database and private object storage. If Supabase is selected, enable row-level security for every user-facing table and restrictive object policies; do not ship service-role secrets in client code. Keep local-first edits and define conflict resolution.
- CI: lint/type checks, unit tests, web script/build checks, Expo diagnostics, security/dependency checks and release build jobs.

### Data model
- `Garment`: id, owner/local profile, name, category, colour, brand, tags, image reference, favourite, created/updated timestamps, optional wear metadata.
- `Outfit`: id, title, occasion, ordered garment IDs, notes, created/updated timestamps.
- `Preference`: liked colours/categories, excluded items, comfort/style goals, recommendation settings.
- `SyncMetadata`: schema version, remote ID, last synced timestamp, conflict status.
- `AISettings`: model preference, downloaded model/version, consent, last-use diagnostic metrics without wardrobe content.

Every persisted object needs an ID, validation, versioned migration and defined deletion behavior. Image references must not rely on temporary object URLs or unverified temporary picker URIs.

## 6. Risks and mitigations

| Risk | Severity | Mitigation / release gate |
|---|---|---|
| Existing monolithic code causes regressions | High | Split by feature incrementally; add tests before large refactors |
| Web data disappears on refresh | High | Implement IndexedDB persistence and reload/recovery tests |
| Mobile image references expire | High | Copy photos into app-managed storage, validate migrations and backups |
| LLM too large/slow on low-end phones | High | Rules engine remains default; benchmark compact quantized candidates |
| WebGPU unavailable or memory-limited | High | Runtime detection, cancelable model load and fallback |
| Native AI package incompatible with Expo | High | Spike with development build before selecting runtime |
| Cloud sync leaks or mixes users' data | High | RLS, private storage, authorization tests and deletion verification |
| 3D assets or CDN fail | Medium | Local/static asset strategy where practical and accessible fallback |
| App-store submission blocks release | Medium | Check store rules, privacy disclosures and platform SDK requirements early |
| Scope expands before core is stable | High | MVP/post-MVP boundary and signed-off exit criteria per phase |

## 7. Security, privacy and compliance

- Apply OWASP MASVS storage, network, authentication and privacy practices to the mobile apps.
- Default to local-only data; account and cloud sync are optional and clearly explained.
- No embedded provider secrets in web or mobile bundles.
- Restrict cloud tables and photo objects per authenticated user; test unauthenticated and cross-user attempts.
- Use TLS, short-lived signed URLs where appropriate, backup/deletion workflows and data export.
- Explain whether a local model is downloaded, where it is stored and how to remove it.
- Do not log garment image content, private outfit notes, tokens or full recommendation prompts.
- Confirm privacy policy, data retention, analytics/diagnostics consent and applicable jurisdictional requirements before store submission.

## 8. Estimates and cost model

Assumptions: one experienced full-time developer, access to at least one Android device and one iPhone or test service, no custom-trained foundation model, no major brand/design change, and product owner feedback within a few days.

| Workstream | Estimate |
|---|---:|
| Audit, SDK upgrade, build pipeline and code boundaries | 1–2 weeks |
| Shared domain/data model, migrations and persistence | 1–2 weeks |
| Complete closet and outfit workflows | 1–2 weeks |
| Web/mobile 3D implementation and device profiling | 1–2 weeks |
| Local stylist integration, tests and model runtime benchmark | 1–2 weeks |
| Optional account, cloud sync, backup and security work | 1–2 weeks |
| QA, accessibility, store readiness and release fixes | 2–3 weeks |

Estimated total: **9–15 calendar weeks** for one experienced developer, with some tasks overlapping. This is a planning range rather than a commitment; production AI inference and 3D device integration are the largest uncertainties. A more basic offline-first release without account/cloud sync or a generative model could ship earlier.

Cost categories:
- Developer time (dominant cost)
- Apple Developer and Google Play accounts, if publishing
- Build/distribution service and device testing
- Optional backend/database/object storage and image delivery
- Model-file hosting/download bandwidth if using optional browser model downloads
- Monitoring and domain costs

Local inference has no per-request model API charge, but does not eliminate model-hosting bandwidth, testing, native build, battery, device-memory or support costs. Exact cash estimates should wait until the service plan, user counts, asset volumes and publishing locations are known.

## 9. Decision and recommendation

**Proceed using a staged production plan.** Build the stable offline core before making a generative model mandatory. Use web plus native mobile with shared domain logic, but do not pretend that browser WebGPU and native inference are identical environments. Build small vertical slices, test each on actual devices, and add cloud sync only with strong per-user security controls.

The first milestone is not a redesign. It is a reproducible clean build and test baseline, followed by durable web/mobile data storage and tests. Then implement the complete closet and outfit workflows; after that stabilize 3D and benchmark optional on-device generation.

## 10. Technical references

- Expo SDK versions and platform support: https://docs.expo.dev/versions/latest/ and https://expo.dev/changelog/sdk-58
- Expo development builds vs Expo Go: https://docs.expo.dev/develop/development-builds/faq/
- Transformers.js browser inference and quantization: https://huggingface.co/docs/transformers.js/index and https://huggingface.co/docs/transformers.js/guides/webgpu
- WebLLM local inference and browser requirements: https://webllm.io/docs/guides/local-inference/ and https://webllm.io/docs/faq/
- LiteRT cross-platform on-device inference: https://developers.google.com/edge/litert/overview
- SmolLM2 model sizes: https://github.com/huggingface/smollm/blob/main/text/README.md
- Qwen2.5 model size and licences: https://qwenlm.github.io/blog/qwen2.5-llm/
- Three.js WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer.html
- OWASP MASVS storage/security standard: https://mas.owasp.org/MASVS/05-MASVS-STORAGE/
- Supabase row-level security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
