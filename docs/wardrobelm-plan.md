# WardrobeLM — plan and implementation status

## Goal

Build a compact fashion-focused language model for Wardrobe, fine-tuned from an existing pretrained model and deployed for browser inference on GitHub Pages. Photo understanding remains a separate vision-model responsibility.

## Honest status

This repository change establishes the training/data pipeline and browser integration contract. It does **not** contain trained WardrobeLM weights, and no fine-tuning or browser inference has been run as part of this commit. Training requires a machine with Python and model-download access. Browser deployment requires exporting and testing compatible model assets separately.

## Base model choice

Start with **HuggingFaceTB/SmolLM2-135M-Instruct** as a practical small base. Its ~135M parameter count is near, but not exactly, the requested ~100M target. Using a smaller arbitrary model architecture would not automatically yield a better fashion assistant. Fine-tune with LoRA first to reduce training memory and produce adapter weights. If the final browser footprint is too large, evaluate quantization and/or a smaller base after measuring quality.

Base model: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct

## Scope

- Inputs: wardrobe items and attributes, occasion, weather/season, dress code, and user style preferences.
- Outputs: concise outfit suggestions grounded in the supplied items; explain the match and identify missing attributes rather than inventing items.
- Vision: separate model extracts visible garment category/color/pattern from uploaded images. Pass its structured result to WardrobeLM.
- Browser: host static assets from this repository/GitHub Pages. No model request should be made to Hugging Face at runtime once the exported assets are deployed.
- Safety/quality: do not infer body measurements, protected traits, or sensitive attributes from clothing photos.

## Repository layout

- `training/data/wardrobelm_train.jsonl`: tiny illustrative seed dataset. Expand and review before serious training.
- `training/train_lora.py`: supervised fine-tuning starter using Transformers + PEFT.
- `training/requirements.txt`: training dependencies.
- `poc/wardrobelm.html`: lightweight integration demo and fallback while model assets are not available.
- `poc/models/wardrobelm/README.md`: required export/hosting contract; model weights intentionally not checked in.

## Training steps

1. Create a clean Python environment and install `training/requirements.txt`.
2. Review/expand the JSONL dataset. Each line is one JSON object with `messages` containing `system`, `user`, and `assistant` turns.
3. Run `python training/train_lora.py --output-dir outputs/wardrobelm-lora`.
4. Evaluate held-out prompts for groundedness, compatibility, repetition, and latency. Do not treat training loss as sufficient validation.
5. Merge the adapter only if desired, then export/quantize using a browser-supported runtime. Test exact tokenizer, chat template, generation settings, and model files.
6. Put only reasonably sized static assets in `poc/models/wardrobelm/`; ensure GitHub Pages can serve each file and check repository size/bandwidth constraints. Do not use Git LFS for files that must be served directly by Pages.
7. Set the model asset URL in the demo and verify browser Network requests all target `jisappu77-coder.github.io` (except the page's ordinary hosting). Never claim offline/self-hosted inference until this is confirmed.

## Run training

```bash
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
# .venv\\Scripts\\Activate.ps1
pip install -r training/requirements.txt
python training/train_lora.py --output-dir outputs/wardrobelm-lora
```

Training requires network access to download the base model the first time. It saves LoRA adapter files locally and does not upload anything automatically.

## Browser model constraints

The base model's standard Hugging Face weights are not directly browser-ready. A browser runtime and a compatible converted/quantized model are required. This starter deliberately does not point to a nonexistent ONNX file or fetch a model from Hugging Face at runtime. The demo currently uses a clearly labelled local heuristic fallback until exported weights are added and tested.

## Definition of done

- Training script completes on a supported environment.
- Held-out evaluation shows useful, grounded recommendations.
- Browser build loads tokenizer and model assets from GitHub Pages only.
- Model inference works on a current desktop browser and a representative mobile browser.
- Loading failures are visible and fallback is clearly labelled; no fake claim that a trained model ran.
