import re

with open("/Users/surachartlimrattanaphun/Desktop/My Project/EL/src/utils/lessons.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Let's count how many dialogue objects are in Unit 1 and Unit 3
# Unit 1 dialogue block starts at `id: 1` and `dialogue: [`
# Let's find dialogues
dialogue_blocks = re.findall(r'dialogue:\s*\[(.*?)\]', content, re.DOTALL)
print(f"Number of dialogue blocks: {len(dialogue_blocks)}")
for idx, block in enumerate(dialogue_blocks):
    lines = re.findall(r'\{\s*speaker:\s*\'[AB]\'.*?\}', block)
    print(f"Block {idx} has {len(lines)} lines")
