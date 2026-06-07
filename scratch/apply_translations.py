import re

# Read lessons.ts
with open("/Users/surachartlimrattanaphun/Desktop/My Project/EL/src/utils/lessons.ts", "r", encoding="utf-8") as f:
    content = f.read()

block0_trans = [
    "อรุณสวัสดิ์ครับ/ค่ะ!",
    "อรุณสวัสดิ์ครับ/ค่ะ!",
    "เธอชื่ออะไรเหรอ?",
    "ฉันชื่อธนภพจ้า",
    "เธอชื่อเล่นว่าอะไรเหรอ?",
    "ชื่อเล่นของฉันคือภพจ้า",
    "เธออายุเท่าไหร่เหรอ?",
    "ฉันอายุแปดขวบจ้า",
    "เธอสบายดีไหม?",
    "สบายดีมากเลยจ้า",
    "เธอเดินทางมาโรงเรียนยังไงเหรอ?",
    "ฉันมาโรงเรียนด้วยรถยนต์จ้า",
    "ทานอาหารเช้าหรือยังเอ่ย?",
    "ทานแล้วครับ/ค่ะ",
    "เธอเรียนอยู่ชั้นไหนเหรอ?",
    "ฉันเรียนอยู่ชั้นประถมศึกษาปีที่ 2 จ้า",
    "วันนี้คือวันอะไรเหรอ?",
    "วันนี้คือวันจันทร์จ้า",
    "เธอเดินทางมาโรงเรียนยังไงเหรอ?",
    "ฉันมาโรงเรียนด้วยรถยนต์จ้า",
    "วันนี้ในห้องเรียนของเธอมีคนอยู่กี่คนเหรอ?",
    "ในห้องของฉันมี 31 คนจ้า",
    "พร้อมเต้นหรือยังเอ่ย?",
    "พร้อมแล้วครับ/ค่ะ!",
    "โอเค ตอนนี้พอแค่นี้ก่อน เดินเข้าห้องเรียนได้เลยจ้า",
    "ขอบพระคุณคุณครูครับ/ค่ะ",
    "นี่คืออะไรเหรอ?",
    "นี่คือนมจ้า",
    "เธอสะกดคำนี้ได้ไหม?",
    "เอ็ม-ไอ-แอล-เค",
    "ช่วยตัดถุงนมให้ฉันหน่อยได้ไหมครับ/ค่ะ",
    "ได้เลยแน่นอนจ้า",
    "นมสีอะไรเหรอ?",
    "มันคือสีขาวจ้า",
    "เธอชอบกินนมไหม?",
    "ชอบครับ/ชอบค่ะ",
    "ขอหลอดดูดน้ำหน่อยได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "สวัสดีตอนเช้าครับ/ค่ะ คุณครู",
    "สวัสดีตอนเช้าจ้า นักเรียนทุกคน",
    "สบายดีกันไหมเอ่ย?",
    "สบายดีมากเลยครับ/ค่ะ แล้วคุณครูล่ะครับ/ค่ะ?",
    "ครูก็มีความสุขดีมากเหมือนกัน ขอบใจมากจ้า เชิญนั่งลงได้เลย",
    "ขอบคุณครับ/ขอบคุณค่ะ คุณครู",
    "วันนี้ใครขาดเรียนบ้างเอ่ย?",
    "ปิงขาดเรียนวันนี้จ้า",
    "วันนี้เธอรู้สึกดีขึ้นหรือยัง ภู?",
    "วันนี้ฉันรู้สึกดีมากเลย ขอบคุณนะ",
    "วันนี้คือวันอะไรเหรอ?",
    "วันนี้คือวันจันทร์จ้า",
    "แล้ววันพรุ่งนี้ล่ะจะเป็นวันอะไร?",
    "วันพรุ่งนี้จะเป็นวันอังคารจ้า",
    "คำถามสุดท้าย วันเมื่อวานคือวันอะไร?",
    "วันเมื่อวานคือวันอาทิตย์จ้า",
    "วันนี้วันที่เท่าไหร่เหรอ?",
    "วันนี้คือวันจันทร์ที่ 6 กรกฎาคม ค.ศ. 2026 จ้า",
    "วันนี้สภาพอากาศเป็นยังไงบ้างเหรอ?",
    "วันนี้มีแดดจัดจ้า",
    "มาเริ่มบทเรียนวันนี้กันเถอะ",
    "พวกเราพร้อมเรียนรู้แล้วจ้า",
    "พร้อมหรือยังเอ่ย?",
    "พร้อมแล้วครับ/ค่ะ!",
    "ครูคิดว่าพวกเราพร้อมจะเริ่มกันได้แล้วนะ",
    "แน่นอนเลยจ้า",
    "ขออนุญาตเข้าห้องเรียนได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า เข้ามาได้เลย",
    "ขออนุญาตออกไปข้างนอกได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "ขออนุญาตไปห้องน้ำได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "ขอใบงานหน่อยได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า นี่จ้า",
    "ฉันขอเสนอความคิดเห็นหน่อยได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "ขอพักสักครู่ได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "ขออนุญาตครับ/ค่ะ คุณครู",
    "มีอะไรเหรอจ๊ะ?",
    "ช่วยพูดซ้ำอีกรอบได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "ขอพักสักครู่ได้ไหมครับ/ค่ะ?",
    "ได้แน่นอนเลยจ้า",
    "พร้อมกินข้าวเที่ยงหรือยังเอ่ย?",
    "พร้อมแล้วครับ/ค่ะ!",
    "นี่คืออะไรเหรอ?",
    "มันคือข้าวผัดจ้า",
    "เธอชอบข้าวผัดไหม?",
    "ชอบครับ/ค่ะ",
    "อาหารโปรดของเธอคืออะไรเหรอ?",
    "อาหารโปรดของฉันคือซุปไก่จ้า",
    "ผลไม้โปรดของเธอคืออะไรเหรอ?",
    "ผลไม้โปรดของฉันคือแตงโมจ้า",
    "เธอสะกดคำนี้ได้ไหม?",
    "ได้เลย ดับเบิ้ลยู-เอ-ที-อี-อาร์-เอ็ม-อี-แอล-โอ-เอ็น",
    "พร้อมกินข้าวเที่ยงหรือยังเอ่ย?",
    "พร้อมแล้วครับ/ค่ะ!",
    "พร้อมกลับบ้านหรือยังเอ่ย?",
    "พร้อมแล้วครับ/ค่ะ!",
    "วันนี้สนุกไหมเอ่ย?",
    "สนุกมากเลยครับ/ค่ะ แน่นอนอยู่แล้ว!",
    "ช่วยเข้าแถวหน่อยได้ไหมครับ/ค่ะ?",
    "ได้เลยครับ/ค่ะ",
    "ยกมือขึ้นเมื่อผู้ปกครองมารับนะจ๊ะ",
    "ผู้ปกครองของฉันมาถึงแล้วครับ/ค่ะ!",
    "ผู้ปกครองมารับฉันแล้ว ขออนุญาตกลับบ้านได้ไหมครับ/ค่ะ?",
    "ได้เลยจ้า",
    "สวัสดีตอนบ่ายครับ/ค่ะแม่ ดีใจที่ได้เจอนะครับ/ค่ะ"
]

block2_trans = [
    "เธออาศัยอยู่ที่ไหนเหรอ บี?",
    "ฉันอาศัยอยู่ในจังหวัดตรังจ้า",
    "เธอเป็นคนไทยหรือเปล่า?",
    "ใช่แล้ว ฉันเป็นคนไทย แล้วเธอล่ะ?",
    "ครอบครัวของฉันเป็นคนจีนจ้า",
    "เพื่อนของเธอเป็นชาวมุสลิมใช่ไหม?",
    "ใช่แล้วจ้า เธอรักครอบครัวของเธอมากเลย",
    "ดอกไม้สีม่วงนั่นคือดอกอะไรเหรอ?",
    "มันคือดอกศรีตรังจ้า สวยงามมากเลย!",
    "ดูนั่นสิ! ต้นยางพาราเยอะแยะเลย",
    "ว้าว! คุณปู่ของฉันมีสวนยางพาราด้วยแหละ",
    "พระยารัษฎาฯ คือใครเหรอ?",
    "ท่านเคยเป็นผู้ว่าราชการเมืองตรังที่ยิ่งใหญ่จ้า",
    "เธอชอบหมูย่างเมืองตรังไหม?",
    "ชอบมากเลยจ้า อร่อยมาก ๆ!",
    "เช้านี้มากินติ่มซำกันเถอะ",
    "เป็นความคิดที่ดีเลย! ฉันชอบติ่มซำมาก",
    "เค้กเมืองตรังชิ้นนี้สำหรับเธอนะ",
    "ขอบคุณนะ! ฉันชอบกินเค้กหวาน ๆ จ้า",
    "หอนาฬิกาตั้งอยู่ที่ไหนเหรอ?",
    "อยู่ในเมืองตรังจ้า มันใหญ่โตมากเลย!",
    "เธอรู้จักเกาะกระดานไหม?",
    "รู้จักสิ! ทะเลที่นั่นสวยงามมากเลยล่ะ",
    "ไปเที่ยวถ้ำมรกตกันเถอะ",
    "มันน่ากลัวไหมอะ?",
    "ไม่หรอก มันเป็นถ้ำที่สวยงามมากเลย!",
    "ฉันชอบน้ำตกโตนเตะจ้า",
    "ฉันก็ชอบเหมือนกัน! น้ำเย็นเจี๊ยบเลย",
    "งานวิวาห์ใต้สมุทรคืออะไรเหรอ?",
    "มันคือเทศกาลที่มีชื่อเสียงของเมืองตรังจ้า คนเขาแต่งงานกันใต้ท้องทะเลน่ะ!",
    "นั่นอะไรอยู่ในสายลมเหรอ?",
    "มันคือกังหันลมลูกลมจ้า มันหมุน ติ้ว ติ้ว ติ้ว เลย!"
]

# Find dialogue: [ ... ] occurrences
# We will replace them one by one
# Using re.finditer to find all dialogue: [ ]
# Note that we only replace block 0 and block 2

# We find all matches of dialogue: [ ... ]
pattern = re.compile(r'(dialogue:\s*\[)(.*?)(\],)', re.DOTALL)
matches = list(pattern.finditer(content))

print(f"Found {len(matches)} dialogue blocks.")

# Block 0 (Unit 1)
m0 = matches[0]
dialogue_str0 = m0.group(2)
lines0 = re.findall(r'\{\s*speaker:\s*\'[AB]\'.*?\}', dialogue_str0)
new_lines0 = []
for idx, line in enumerate(lines0):
    trans = block0_trans[idx]
    # Replace translation: '' or translation: ""
    new_line = re.sub(r"translation:\s*'[^']*'", f"translation: '{trans}'", line)
    new_line = re.sub(r'translation:\s*"[^"]*"', f"translation: '{trans}'", new_line)
    new_lines0.append(new_line)

new_dialogue_str0 = dialogue_str0
for old, new in zip(lines0, new_lines0):
    new_dialogue_str0 = new_dialogue_str0.replace(old, new)

# Block 2 (Unit 3)
m2 = matches[2]
dialogue_str2 = m2.group(2)
lines2 = re.findall(r'\{\s*speaker:\s*\'[AB]\'.*?\}', dialogue_str2)
new_lines2 = []
for idx, line in enumerate(lines2):
    trans = block2_trans[idx]
    new_line = re.sub(r"translation:\s*'[^']*'", f"translation: '{trans}'", line)
    new_line = re.sub(r'translation:\s*"[^"]*"', f"translation: '{trans}'", new_line)
    new_lines2.append(new_line)

new_dialogue_str2 = dialogue_str2
for old, new in zip(lines2, new_lines2):
    new_dialogue_str2 = new_dialogue_str2.replace(old, new)

# Apply replacements in reverse order of matches to keep character indices valid
# Wait, we can construct the new file content directly using string manipulation or regex substitution.
# Let's replace by content slices.
parts = []
last_pos = 0

# Sort matches by start position
matches_to_replace = [(0, new_dialogue_str0), (2, new_dialogue_str2)]
# To be clean, we can replace them sequentially
current_content = content

# Replace block 2 first since it starts later
m2_start, m2_end = matches[2].span(2)
current_content = current_content[:m2_start] + new_dialogue_str2 + current_content[m2_end:]

# Replace block 0 second (indices of block 0 are still same because block 2 is after block 0)
# But wait, to be safe, let's find matches again on the modified content, or just replace block 0 first since we have its start/end.
# Let's re-run the match search on current_content:
matches_refreshed = list(pattern.finditer(current_content))
m0_start, m0_end = matches_refreshed[0].span(2)
current_content = current_content[:m0_start] + new_dialogue_str0 + current_content[m0_end:]

with open("/Users/surachartlimrattanaphun/Desktop/My Project/EL/src/utils/lessons.ts", "w", encoding="utf-8") as f:
    f.write(current_content)

print("Translations successfully applied to lessons.ts!")
