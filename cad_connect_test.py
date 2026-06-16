#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""简化的COM连接测试"""
import pythoncom, win32com.client, sys

pythoncom.CoInitialize()

# 天正 = AutoCAD内核，先试标准ProgID
try:
    app = win32com.client.GetActiveObject("AutoCAD.Application")
    print(f"连接成功!")
    print(f"版本: {app.Version}")
    print(f"标题: {app.Caption}")

    docs = app.Documents
    print(f"\n打开文档数: {docs.Count}")
    for i in range(docs.Count):
        d = docs.Item(i)
        print(f"  [{i}] {d.Name}  (只读={d.ReadOnly})")

    doc = app.ActiveDocument
    print(f"\n当前活动文档: {doc.Name}")

    # 列出图层
    print(f"\n图层列表 (前20):")
    for i, layer in enumerate(doc.Layers):
        if i >= 20: break
        print(f"  {layer.Name} (color={layer.Color}, lw={layer.Lineweight})")

    # 列出文字对象
    print(f"\n文字对象 (前30):")
    count = 0
    for entity in doc.ModelSpace:
        if entity.EntityName == 'AcDbText' or entity.EntityName == 'AcDbMText':
            try:
                txt = entity.TextString
                pos = entity.InsertionPoint
                print(f"  [{entity.Handle}] ({pos[0]:.0f},{pos[1]:.0f}) {entity.Layer}: {txt[:80]}")
            except:
                print(f"  [{entity.Handle}] (读取失败)")
            count += 1
            if count >= 30: break

    print(f"\nDone.")

except Exception as e:
    print(f"连接失败: {e}")
    print("\n请确认天正已启动并打开图纸")
    sys.exit(1)
