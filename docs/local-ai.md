# Wardrobe local AI plan

## Decision

Use a hybrid, offline-first stylist. Do not require a hosted LLM for core outfit recommendations. Keep the model small enough to be an optional enhancement on supported phones and browsers, with a deterministic rules-based stylist as the always-available fallback.

## Runtime architecture

1. **Core stylist (always available):** a small TypeScript/JavaScript recommendation engine scores wardrobe items and outfit combinations using category coverage, colour harmony, occasion, weather when available, wear frequency, and user preferences. Runs locally in web, iOS, and Android; no network calls.
2. **Optional on-device language model:** evaluate a compact instruct model in a mobile/web-compatible runtime, with quantized weights and WebGPU/WASM fallback where supported. The model explains and refines suggestions, but never blocks core functionality.
3. **Shared feature contract:** input is normalized wardrobe metadata, selected occasion, optional weather and user preferences. Output is a structured list of garment IDs, score, short rationale, and missing-category notes. Validate output against a schema and only reference existing wardrobe IDs.
4. **Privacy:** keep garment photos and closet data on-device by default. Do not upload personal data for local recommendations. Model weights may be downloaded on first use with explicit notice, progress, cancel and storage controls.
5. **Graceful degradation:** detect runtime capability, memory, WebGPU/WASM support and available storage. If local LLM cannot run, use the rules engine without a confusing error.
6. **Performance:** lazy-load the model only when AI features are opened, cache downloaded weights, provide a low-memory mode, and allow users to disable the model or remove its files.

## Candidate runtimes and model approach

- Web: benchmark WebLLM/WebGPU first for compatible browsers; keep a WASM-capable route such as Transformers.js where feasible. Do not assume WebGPU exists on every mobile browser.
- React Native: benchmark an on-device llama.cpp-based runtime or another actively maintained mobile inference package against the app's Expo/native build constraints. Native inference may require a custom development build rather than Expo Go.
- Candidate model family: start with a 0.5B–1.5B instruct model, quantized to 4-bit where supported, after checking license, actual download size, context requirements and platform compatibility. Treat model choice as a benchmark decision, not a promise that every device can run it.

## Acceptance tests

- Offline rule-based outfit suggestions work on web and mobile.
- No network request is required to rank outfits once the closet is available.
- Every recommendation references only existing item IDs.
- AI model is lazy-loaded, cancellable and can be removed.
- Web app remains usable without WebGPU and without downloading model weights.
- Test on at least one low-memory Android device and representative iOS hardware before choosing the default model.
- Record cold-start time, memory use, download size and recommendation latency.

## Implementation order

1. Implement and unit-test the deterministic local stylist.
2. Define the shared typed input/output schema.
3. Add an AI settings screen and runtime capability detection.
4. Benchmark small quantized models on web and native devices.
5. Enable the optional model only on configurations that meet performance and memory targets.
