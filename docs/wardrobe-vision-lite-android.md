# Wardrobe Vision Lite — Android-first vision model plan

## Goal

Prioritize a small image model that can be bundled with the Wardrobe Android app and run locally. The initial tasks are garment category classification and visible attribute estimation. The model should not require Hugging Face or any network access at inference time.

## Recommended first implementation

- **Architecture candidate:** MobileNetV3-Small or EfficientNet-Lite0.
- **Runtime:** LiteRT / TensorFlow Lite `.tflite` model with int8 quantization.
- **Input:** 224×224 RGB image as an initial baseline.
- **Target model file:** 5–30 MB, measured after conversion; this is a goal, not a guarantee.
- **Initial labels:** top, shirt, trousers, jeans, skirt, dress, jacket, coat, sweater, shoes, bag, accessory, other.
- **Additional attributes:** start with user-editable color and pattern fields; add trained attribute heads only when a suitable labeled dataset exists.
- **Inference:** fully on device; no photo uploads and no model downloads at runtime.

Official Android path: MediaPipe Image Classifier can load a compatible `.tflite` model from app assets. LiteRT is Google's current on-device runtime direction. References:
- https://developers.google.com/edge/litert/overview
- https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/android
- https://developers.google.cn/edge/mediapipe/solutions/vision/image_classifier

## Important limitation

A standard MobileNet/EfficientNet model pretrained on ImageNet does not natively know Wardrobe's custom garment taxonomy reliably. Its original labels are general object categories. We need to fine-tune a compact backbone on a licensed, labeled fashion dataset, then evaluate it on photos not used in training. Do not present generic ImageNet output as accurate garment recognition.

## App integration

The existing mobile app is Expo SDK 52 / React Native 0.76.5. The current app does not include a native vision runtime. A TFLite/MediaPipe native integration likely requires an Expo development build and a compatible native module/config plugin; it will not work in the stock Expo Go client without native support.

Proposed flow:
1. User selects or captures a clothing image.
2. Resize/crop to the model's required input shape.
3. Run the quantized model on-device using LiteRT/MediaPipe.
4. Display top predicted categories and confidence as suggestions.
5. Let the user confirm or edit category/color/pattern before saving the item.
6. Store only the user's chosen attributes and local image URI.

## Training pipeline milestones

1. Choose and document a licensed fashion dataset with category labels.
2. Establish train/validation/test splits by source/product identity to avoid leakage.
3. Fine-tune MobileNetV3-Small or EfficientNet-Lite0 for garment classes.
4. Measure top-1 accuracy, per-class precision/recall, model size, memory and latency on a physical Android phone.
5. Convert to int8 `.tflite`; validate prediction parity after conversion.
6. Add the model under `mobile/assets/models/wardrobe-vision-int8.tflite` and bundle it with the app. Avoid runtime downloads.
7. Integrate with a native runtime using an Expo development build; test on physical devices.
8. Only then advertise offline AI analysis.

## Current status

This file is a plan, not a trained model. No model weights, labeled fashion dataset, conversion, device benchmark, or native inference integration are included yet. The existing app's manual category/color fields remain the reliable fallback.
