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
