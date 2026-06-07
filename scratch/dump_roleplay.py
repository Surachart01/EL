import docx

doc = docx.Document("/Users/surachartlimrattanaphun/Desktop/My Project/EL/data/Word-Sentences-RolePlay Unit1-5.docx")
table3 = doc.tables[2]

current_unit = ""
current_topic = ""
for i, row in enumerate(table3.rows):
    if i == 0:
        continue
    cells = [cell.text.strip().replace('\n', ' ') for cell in row.cells]
    if len(cells) < 3:
        continue
    unit = cells[0] if cells[0] else current_unit
    topic = cells[1] if cells[1] else current_topic
    roleplay = cells[2]
    
    if unit:
        current_unit = unit
    if topic:
        current_topic = topic
        
    print(f"[{current_unit}] [{current_topic}] {roleplay}")
