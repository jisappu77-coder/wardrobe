# Self-hosted Wardrobe AI model

The Photo to 3D prototype is configured to load model assets only from this GitHub Pages site. It does **not** fall back to Hugging Face.

## Required directory

Place the compatible Transformers.js model files here, preserving the model repository's file names:

`poc/models/Xenova/clip-vit-base-patch32/`

The model must include all files required by Transformers.js for the `zero-shot-image-classification` pipeline, including the compatible ONNX model weights and model/tokenizer/preprocessor configuration files. Do not upload just a model weight file; the pipeline needs the matching supporting files too.

## Important hosting limits

GitHub Pages is static hosting. Each published file must be below GitHub's 100 MB file limit, and the site should stay within GitHub Pages size and bandwidth limits. If a required model file exceeds the limit, do not use Git LFS as a workaround for Pages; choose a smaller compatible quantized model or host the model assets on a static file host designed for large files.

## How the app is configured

In `poc/photo-to-3d.html`, Transformers.js is loaded from jsDelivr, but model assets are configured to load from:

`/wardrobe/poc/models/`

Remote model loading is disabled. The expected model ID is `Xenova/clip-vit-base-patch32`, so its assets resolve beneath the directory above. If model assets are missing or named incorrectly, AI analysis will fail rather than downloading them from Hugging Face.

After uploading the model files, deploy GitHub Pages and open:

`https://jisappu77-coder.github.io/wardrobe/poc/photo-to-3d.html`

Use the browser Network panel to verify model requests come from `jisappu77-coder.github.io`. The Transformers.js JavaScript library itself is still loaded from jsDelivr; only the model assets are self-hosted in this configuration.