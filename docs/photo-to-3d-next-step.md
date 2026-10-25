# Wardrobe Photo-to-3D: Next Step

## Goal
Upgrade `poc/photo-to-3d.html` from a photo-textured plane plus a generic back shape into a garment-shaped 3D mesh that can be rotated in the browser.

## Phase 1 — Improve the browser-only POC (next implementation)
- Use an image segmentation step to isolate the garment from the background.
- Extract a silhouette/alpha mask and create a triangulated front mesh from the garment contour.
- Generate an approximate back surface and side walls, with depth controlled by garment type and width.
- Use the photo as a texture on the front and a coordinated solid/derived texture on the back.
- Add garment type selection (dress, shirt, jacket, skirt), silhouette controls, and a visible low-confidence warning.
- Keep image processing local where possible; show clear loading/error states and release object URLs/textures when replaced.
- Test with multiple image sizes, transparent PNGs, plain and busy backgrounds, mobile touch controls, and no-WebGL fallback.

## Phase 2 — Real single-image reconstruction
A single 2D photo does not contain enough information to recover the exact back, depth, fabric, or hidden folds. For a more realistic model, integrate a dedicated image-to-3D model/service or a supported local inference model. Keep this as a separate adapter so the viewer does not depend on one vendor.

The reconstruction adapter should return a standard 3D asset (prefer GLB/glTF) and metadata. The viewer should validate file size/type, show progress, handle failed jobs, and let the user delete the generated asset.

## Phase 3 — Production integration
- Shared garment metadata schema for web and Expo mobile.
- Durable local asset storage; optional sync only with explicit consent.
- Asset compression/LOD, caching, and performance budgets for mobile.
- Privacy notice for any remote reconstruction service; photos must not be uploaded unless the user chooses that feature.
- Tests for rendering, asset loading, and cleanup; accessibility and release checks.

## Definition of done for the next POC
1. Upload a garment photo and see an approximate garment-shaped mesh, not only a flat photo card.
2. Rotate the mesh to see front, sides, and a generated back approximation.
3. Change garment type and adjust depth/shape.
4. See a warning that the back and depth are estimated.
5. Handle unsupported files and WebGL errors without a blank screen.

## Honesty about fidelity
The first contour-based mesh is an approximation. It is useful to validate interaction and workflow, but it is not a physically accurate scan, cloth simulation, or virtual try-on model. High-fidelity reconstruction requires multi-view images or an image-to-3D model.


## Local AI implementation decision (Android-first)

### Current state
- The GitHub Pages POC runs browser-side background removal and garment classification.
- The current rotatable photo mesh is **not** a full image-to-3D reconstruction model.
- The page now includes a browser WebGPU capability check and links to an open-source WebGPU image-to-3D implementation. It does not download or execute that model yet.
- No cloud generation API or secret key is used.

### Why the full model is not bundled into GitHub Pages
The open-source SF3D WebGPU port documents a model weight file of roughly 2.1 GB and demonstrates inference on a high-end desktop GPU. Committing those weights to the repository is not appropriate, and successful inference on Android cannot be assumed. The browser must download model weights separately and a compatible GPU/browser must have enough memory. This is local inference after download, but it is not guaranteed to work offline on the first visit.

### Recommended integration path
1. Keep GitHub Pages as the lightweight mobile UI and Three.js GLB viewer.
2. Integrate a WebGPU reconstruction adapter only after validating its model license, mobile support, model file hosting/cache strategy, and peak memory on representative Android devices.
3. Keep model weights out of Git history; load versioned weights from a user-selected local file or a documented static asset host, with explicit download size and consent.
4. Generate a GLB locally, validate it, then load it into the existing viewer. Do not substitute a depth-displaced image plane and label it as full 3D reconstruction.
5. If the device is unsupported, retain the current preview with a clear approximation warning rather than uploading the photo to a cloud service.

### Android acceptance tests before enabling generation
- Recent Chrome on at least one mid-range and one high-end Android device.
- WebGPU adapter available and model weights loaded without tab reload or browser termination.
- Peak memory measured during inference, not just model download size.
- Generated GLB rotates with coherent sides/back and exports successfully.
- Airplane-mode behavior documented separately for first run and cached subsequent runs.
- Network inspection confirms that the uploaded photo is not sent to an inference API.

### Current page change
The page includes a “Check device support” action. This reports secure-context/WebGPU adapter availability and the browser's exposed device-memory estimate. It is only a capability probe; it does not imply the reconstruction model is installed or that a device can run it.
