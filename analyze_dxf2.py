#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""提取关键结构数据"""
import ezdxf
from collections import defaultdict

doc = ezdxf.readfile(r'D:\邓杰鹏个人主页\参考图4800.dxf')
msp = doc.modelspace()

all_texts = []
for e in msp:
    etype = e.dxftype()
    txt = None
    try:
        pos = e.dxf.get('insert', (0,0,0))
    except:
        pos = (0,0,0)

    try:
        if etype == 'TEXT':
            txt = e.dxf.text
        elif etype == 'MTEXT':
            txt = e.text
        elif etype == 'DIMENSION':
            txt = e.dxf.get('text', '')
        elif 'TCH' in etype:
            for attr in ['text', 'Text', 'TEXT']:
                try:
                    txt = e.dxf.get(attr, '')
                    if txt and str(txt).strip():
                        break
                except: pass
    except:
        pass

    if txt and str(txt).strip() and str(txt).strip() != ' ':
        try:
            layer = e.dxf.layer
        except:
            layer = '?'
        all_texts.append((layer, pos, str(txt).strip()))

print(f"总文字数: {len(all_texts)}")

# 关键数据筛选
keywords = ['KZ', 'KL', 'JC', '4800', '5400', '板', '楼梯', '柱', '梁', '基础',
            'Φ', '%%13', 'C8', 'C10', 'C12', 'C14', 'C16', 'C18', 'C20', 'C22', 'C25',
            '@', '配筋', '弯矩', '剪力', '轴压',
            '跨度', '截面', 'M=', 'V=', 'As=',
            '2.8', '3.2', '800', '900', '基础尺寸',
            '1F', '2F', '3F', '4F', '5F', '6F',
            '标高', '层高']

print("\n=== 关键结构数据 ===")
for layer, pos, txt in all_texts:
    txt_clean = txt.replace('%%130', 'Φ').replace('%%131', 'Φ').replace('%%132', 'Φ')
    for kw in keywords:
        if kw in txt or kw in txt_clean:
            print(f"  [{layer}] ({pos[0]:.0f},{pos[1]:.0f}) {txt[:120]}")
            break

# 单独列出所有图名和比例
print("\n=== 图纸页码 ===")
for layer, pos, txt in all_texts:
    if '页' in txt or '图' in txt[:2]:
        print(f"  [{layer}] ({pos[0]:.0f},{pos[1]:.0f}) {txt}")
