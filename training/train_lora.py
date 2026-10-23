#!/usr/bin/env python3
"""Starter supervised LoRA fine-tuning script for WardrobeLM.

This trains an adapter locally. It does not export a browser-ready model.
"""
import argparse
import json
from pathlib import Path

from datasets import Dataset
from peft import LoraConfig, TaskType, get_peft_model
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
)

BASE_MODEL = "HuggingFaceTB/SmolLM2-135M-Instruct"


def read_examples(path: Path):
    rows = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
            messages = item["messages"]
            if not messages or not any(m.get("role") == "assistant" for m in messages):
                raise ValueError("messages must include an assistant response")
            rows.append({"messages": messages})
        except Exception as exc:
            raise ValueError(f"Invalid JSONL at {path}:{line_no}: {exc}") from exc
    if not rows:
        raise ValueError(f"No training examples found in {path}")
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="training/data/wardrobelm_train.jsonl")
    parser.add_argument("--base-model", default=BASE_MODEL)
    parser.add_argument("--output-dir", default="outputs/wardrobelm-lora")
    parser.add_argument("--epochs", type=float, default=3)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--max-length", type=int, default=768)
    args = parser.parse_args()

    data_path = Path(args.data)
    rows = read_examples(data_path)
    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    model = AutoModelForCausalLM.from_pretrained(args.base_model)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    def format_row(row):
        # Use the base model's native chat template, including its generation tokens.
        text = tokenizer.apply_chat_template(
            row["messages"], tokenize=False, add_generation_prompt=False
        )
        return {"text": text}

    dataset = Dataset.from_list(rows).map(format_row)

    def tokenize(batch):
        return tokenizer(
            batch["text"],
            truncation=True,
            max_length=args.max_length,
            padding="max_length",
        )

    tokenized = dataset.map(tokenize, batched=True, remove_columns=["messages", "text"])
    # For this starter, labels mirror input_ids; padding is ignored by the collator.
    tokenized = tokenized.map(
        lambda row: {"labels": [tok if mask else -100 for tok, mask in zip(row["input_ids"], row["attention_mask"])]}
    )

    lora = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=8,
        lora_alpha=16,
        lora_dropout=0.05,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    )
    model = get_peft_model(model, lora)
    model.print_trainable_parameters()

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=5,
        save_strategy="epoch",
        report_to="none",
        fp16=False,
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized,
        data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
    )
    trainer.train()
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"Saved LoRA adapter and tokenizer to {args.output_dir}")
    print("Note: this is not a merged or browser-ready ONNX export.")


if __name__ == "__main__":
    main()
