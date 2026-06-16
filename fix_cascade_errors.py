#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复T39(表6-11 活载固端弯矩)的级联错误"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document

DOC = r'C:\Users\邓杰鹏\Desktop\毕设\5400版本\邓杰鹏计算书_5400修正版.docx'
doc = Document(DOC)

# 中跨参数 (这些不受L1变化影响)
L2 = 2.4
f_tri = 0.625
q_roof = 0.5
q_floor = 2.0

# 中跨等效均布活载
q_mid_roof = f_tri * 2 * (L2/2 * q_roof)   # 0.75
q_mid_floor = f_tri * 2 * (L2/2 * q_floor)  # 3.00

# 固端弯矩
FEM_mid_roof = q_mid_roof * L2**2 / 12    # 0.36
FEM_mid_floor = q_mid_floor * L2**2 / 12   # 1.44

print(f"中跨屋面活载: q={q_mid_roof:.2f}, FEM={FEM_mid_roof:.2f}")
print(f"中跨楼面活载: q={q_mid_floor:.2f}, FEM={FEM_mid_floor:.2f}")

# 修复T39
t = doc.tables[39]

# R4: 中跨 屋面层
t.rows[4].cells[2].text = f'{L2:.2f}'
t.rows[4].cells[3].text = f'{q_mid_roof:.2f}'
t.rows[4].cells[4].text = f'-{q_mid_roof:.2f}×{L2:.1f}²/12=-{FEM_mid_roof:.2f}'
t.rows[4].cells[5].text = f'{FEM_mid_roof:.2f}'

# R5: 中跨 楼面层
t.rows[5].cells[2].text = f'{L2:.2f}'
t.rows[5].cells[3].text = f'{q_mid_floor:.2f}'
t.rows[5].cells[4].text = f'-{q_mid_floor:.2f}×{L2:.1f}²/12=-{FEM_mid_floor:.2f}'
t.rows[5].cells[5].text = f'{FEM_mid_floor:.2f}'

doc.save(DOC)
review = DOC.replace('修正版', '审阅版')
doc.save(review)
print(f"\nT39 修复完成!")
print(f"修正版: {DOC}")
