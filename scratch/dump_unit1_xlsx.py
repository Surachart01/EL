import openpyxl

wb = openpyxl.load_workbook("/Users/surachartlimrattanaphun/Desktop/My Project/EL/data/Word-Sentences-RolePlay_Unit1-5.xlsx")
sheet = wb["Unit1 RolePlay"]
for row_idx in range(1, sheet.max_row + 1):
    vals = [cell.value for cell in sheet[row_idx]]
    print(f"Row {row_idx}: {vals[:3]}")
