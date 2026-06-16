#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""分析参考图4800 DXF 结构 - 防御天正自定义实体"""
import ezdxf
from collections import Counter

doc = ezdxf.readfile(r'D:\邓杰鹏个人主页\参考图4800.dxf')
msp = doc.modelspace()

layer_counter = Counter()
type_counter = Counter()
texts = []
dims = []

for e in msp:
    # 安全获取 layer
    try:
        layer = e.dxf.layer
        layer_counter[layer] += 1
    except:
        layer_counter['(unknown)'] += 1
        layer = '(unknown)'

    etype = e.dxftype()
    type_counter[etype] += 1

    # 文字提取
    if etype == 'TEXT':
        try:
            txt = e.dxf.text
            pos = e.dxf.insert
            if txt and txt.strip():
                texts.append((layer, pos, txt[:150]))
        except: pass
    elif etype == 'MTEXT':
        try:
            txt = e.text if hasattr(e, 'text') else ''
            pos = e.dxf.insert
            if txt and txt.strip():
                texts.append((layer, pos, str(txt)[:150]))
        except: pass
    elif etype == 'DIMENSION':
        try:
            txt = e.dxf.text if e.dxf.hasattr('text') else ''
            pos = e.dxf.defpoint if e.dxf.hasattr('defpoint') else (0,0,0)
            if txt and txt.strip():
                texts.append((layer, pos, f'[DIM] {txt[:80]}'))
        except: pass
    elif 'TCH' in etype or 'TD' in etype:
        # 天正自定义实体，尝试提取文本
        try:
            for attr_name in ['text', 'Text', 'TEXT', 'content', 'Content']:
                try:
                    txt = e.dxf.get(attr_name, '')
                    if txt and str(txt).strip():
                        try:
                            pos = e.dxf.insert
                        except:
                            pos = (0,0,0)
                        texts.append((layer, pos, f'[{etype}] {str(txt)[:150]}'))
                        break
                except: pass
        except: pass

print(f"总实体数: ~{len(list(msp))}")
print(f"\n=== 图层 (共{len(layer_counter)}个) ===")
for layer, count in layer_counter.most_common(30):
    print(f"  {layer}: {count}")

print(f"\n=== 实体类型 ===")
for etype, count in type_counter.most_common(30):
    print(f"  {etype}: {count}")

print(f"\n=== 文字/标注内容 (共{len(texts)}条, 显示200条) ===")
for layer, pos, txt in texts[:200]:
    x, y = pos[0], pos[1]
    print(f"  [{layer}] ({x:.0f},{y:.0f}) {txt}")
