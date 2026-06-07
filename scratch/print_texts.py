import re

with open("/Users/surachartlimrattanaphun/Desktop/My Project/EL/src/utils/lessons.ts", "r", encoding="utf-8") as f:
    content = f.read()

dialogue_blocks = re.findall(r'dialogue:\s*\[(.*?)\]', content, re.DOTALL)

print("--- BLOCK 0 (Unit 1) ---")
block0_lines = re.findall(r'\{\s*speaker:\s*\'[AB]\'.*?\}', dialogue_blocks[0])
for idx, line in enumerate(block0_lines):
    # Extract text field
    text_match = re.search(r"text:\s*'([^']+)'", line)
    if not text_match:
        text_match = re.search(r'text:\s*"([^"]+)"', line)
    text = text_match.group(1) if text_match else "ERROR"
    print(f"{idx}: {text}")

print("\n--- BLOCK 2 (Unit 3) ---")
block2_lines = re.findall(r'\{\s*speaker:\s*\'[AB]\'.*?\}', dialogue_blocks[2])
for idx, line in enumerate(block2_lines):
    # Extract text field
    text_match = re.search(r"text:\s*'([^']+)'", line)
    if not text_match:
        text_match = re.search(r'text:\s*"([^"]+)"', line)
    text = text_match.group(1) if text_match else "ERROR"
    print(f"{idx}: {text}")
