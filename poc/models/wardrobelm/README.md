# WardrobeLM browser model assets

This directory intentionally contains no model weights yet.

After training and evaluation, add a **browser-compatible, tested export** here. Do not put a standard PyTorch checkpoint here and assume GitHub Pages can run it.

Requirements before enabling real model inference:
- compatible runtime and model format (for example, ONNX with a tested WebAssembly/WebGPU runtime)
- tokenizer files and model config matching the exported weights
- quantization selected and measured for quality, memory and download size
- all assets served from the same GitHub Pages origin
- no Hugging Face model URLs in the browser Network panel

Keep each file within GitHub Pages and repository constraints. Git LFS pointers are not usable model weights when served as ordinary Pages files.
