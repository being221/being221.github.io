# 结构施工图 DXF 生成 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从5400计算书数据生成6张结构施工图DXF文件

**Architecture:** 单脚本 `generate_dxf.py`，含公共模块(图层/标题栏/轴线) + 6个图纸函数。每个函数创建独立DXF文件，输出到 `dxf_output/`

**Tech Stack:** Python 3 + ezdxf 1.4.3, R2010 DXF格式, TTF字体(simhei.ttf)

---

## 数据常量

```python
# 截面
B_EDGE, H_EDGE = 5400, 2400  # AB/CD跨度, BC跨度
B_LONG = 6900  # 纵向跨度
COL = 500  # 柱
BEAM_EDGE = (250, 500)  # 边跨梁
BEAM_MID = (250, 400)   # 中跨梁
H_SLAB = 120  # 板厚
N_FLOORS, N_BAYS = 6, 7

# 基础
JC1_SIZE = (2800, 3200, 800)  # 边柱独基 b×l×h
JC2_H = 900  # 中柱联合基础高

# 材料
C30, HRB400 = 'C30', 'HRB400'
FC, FT, FY = 14.3, 1.43, 360

# 1F 梁内力设计值 (表8-4~8-6)
KL1_M_LEFT, KL1_M_MID, KL1_M_RIGHT = -125.25, 136.90, -116.71  # kN·m
KL1_V = 214.71  # kN
KL2_M_LEFT, KL2_M_MID, KL2_M_RIGHT = -93.96, 8.64, -93.96
KL2_V = 145.19

# 梁配筋
KL1_REBAR_TOP, KL1_REBAR_BOT = '5C16', '2C16'
KL1_STIRRUP = 'C8@100/200(2)'
KL2_REBAR_TOP, KL2_REBAR_BOT = '5C16', '2C16'
KL2_STIRRUP = 'C8@100/200(2)'

# 柱配筋 (表8-7~12)
COL_FLOORS_REBAR = {
    6: ('4C18', '4C18'),
    5: ('4C20', '4C20'),
    4: ('4C22', '4C22'),
    3: ('4C22', '4C22'),
    2: ('4C22', '4C22'),
    1: ('4C25', '4C25'),
}
COL_STIRRUP = 'C8@100/200'

# A板 (表9-3~4)
A_PLATE = {'lx': 3.45, 'ly': 5.4, 'lam': 1.57, 'h': 120}
A_MOMENT = {'sup_s': -8.28, 'sup_l': -5.51, 'mid_s': 4.50, 'mid_l': 2.22}  # kN·m/m
A_REBAR = 'C8@200'

# 楼梯 (第10章)
STAIR_STEP = (167, 280)  # 踏步
STAIR_H = 100  # 梯段板厚
STAIR_HORIZ = 2240  # 水平跨度
STAIR_PLATFORM = (1600, 3000)  # 平台板
STAIR_BEAM = (200, 400)  # 梯梁
```

---

### Task 1: 创建项目结构与公共模块

**Files:**
- Create: `generate_dxf.py`

- [ ] **Step 1: 创建脚本框架和公共函数**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成结构施工图DXF文件 — 5400跨度版本"""
import ezdxf
from ezdxf import bbox
from ezdxf.enums import TextEntityAlignment
from ezdxf.math import Vec3
import math, os

OUTPUT = os.path.join(os.path.dirname(__file__), 'dxf_output')
os.makedirs(OUTPUT, exist_ok=True)

# ========== 数据常量 (见上表) ==========
# ... (完整数据贴在这里)
```

- [ ] **Step 2: 实现图层设置函数**

```python
def setup_layers(doc):
    """创建标准图层"""
    layers = {
        'AXIS': {'color': 1, 'linetype': 'CENTER', 'lineweight': 13},    # 红, 点划线, 0.13
        'COLUMN': {'color': 7, 'linetype': 'CONTINUOUS', 'lineweight': 35},
        'BEAM': {'color': 7, 'linetype': 'CONTINUOUS', 'lineweight': 35},
        'SLAB': {'color': 7, 'linetype': 'CONTINUOUS', 'lineweight': 25},
        'DIM': {'color': 3, 'linetype': 'CONTINUOUS', 'lineweight': 13}, # 绿
        'TEXT': {'color': 7, 'linetype': 'CONTINUOUS', 'lineweight': 18},
        'TITLE': {'color': 7, 'linetype': 'CONTINUOUS', 'lineweight': 25},
        'REBAR': {'color': 1, 'linetype': 'CONTINUOUS', 'lineweight': 25}, # 红
        'HATCH': {'color': 8, 'linetype': 'CONTINUOUS', 'lineweight': 13},
    }
    for name, props in layers.items():
        layer = doc.layers.new(name)
        layer.color = props['color']
        layer.linetype = props['linetype']
        layer.lineweight = props['lineweight']
    return doc.layers
```

- [ ] **Step 3: 实现文字样式和标注样式**

```python
def setup_styles(doc):
    """文字样式和标注样式"""
    doc.styles.new('GB-STANDARD', dxfattribs={'font': 'simhei.ttf'})
    dimstyle = doc.dimstyles.new('GB-DIM')
    dimstyle.dxf.dimasz = 2.5
    dimstyle.dxf.dimtxt = 3.0
    dimstyle.dxf.dimexe = 2.0
    dimstyle.dxf.dimexo = 1.0
    dimstyle.dxf.dimtxsty = 'GB-STANDARD'
    return doc
```

- [ ] **Step 4: A2/A3 图框和标题栏函数**

```python
def make_title_block(msp, width, height, dwg_num, dwg_name, scale='1:100'):
    """A2(594×420)或A3(420×297)标准图框"""
    # 外框
    msp.add_lwpolyline([(0,0), (width,0), (width,height), (0,height), (0,0)], dxfattribs={'layer': 'TITLE'})
    # 内框 (留装订边25mm)
    msp.add_lwpolyline([(25,10), (width-10,10), (width-10,height-10), (25,height-10), (25,10)],
                       dxfattribs={'layer': 'TITLE'})
    # 标题栏 (右下角 180×56)
    y_tb = 10 + 56
    msp.add_lwpolyline([(width-190, 10), (width-190, y_tb), (width-10, y_tb)], dxfattribs={'layer': 'TITLE'})
    # 标题栏分割线
    for x in [width-190, width-160, width-120, width-80]:
        msp.add_line((x, 10), (x, y_tb), dxfattribs={'layer': 'TITLE'})
    for y in [10, 28, 42]:
        msp.add_line((width-190, y), (width-10, y), dxfattribs={'layer': 'TITLE'})
    # 标题栏文字
    msp.add_text(dwg_name, dxfattribs={'layer': 'TITLE', 'height': 5}).set_placement(
        (width-100, 19), align=TextEntityAlignment.MIDDLE_CENTER)
    msp.add_text(dwg_num, dxfattribs={'layer': 'TITLE', 'height': 3}).set_placement(
        (width-175, 22), align=TextEntityAlignment.MIDDLE_CENTER)
```

- [ ] **Step 5: 提交**

```bash
git add generate_dxf.py && git commit -m "feat: DXF生成框架——图层/样式/标题栏公共模块"
```

---

### Task 2: 图纸1 — 结构设计总说明 (A3)

**Files:**
- Modify: `generate_dxf.py` (追加函数)

- [ ] **Step 1: 实现表格和说明文字绘制**

```python
def draw_sheet_01():
    """结构设计总说明 — A3横 420×297"""
    doc = ezdxf.new('R2010')
    setup_layers(doc)
    setup_styles(doc)
    msp = doc.modelspace()
    W, H = 420, 297
    make_title_block(msp, W, H, '01', '结构设计总说明', '—')

    text = msp.add_text
    t = lambda x, y, s, h=4, **kw: text(s, dxfattribs={'layer': 'TEXT', 'height': h, **kw}).set_placement((x, y))

    # 标题
    t(W/2, H-30, '结构设计总说明', h=8, align=TextEntityAlignment.MIDDLE_CENTER)

    # 工程概况
    y = H-50
    t(35, y, '一、工程概况', h=5)
    items = [
        '工程名称：河北省邢台市天一苑3栋', '结构类型：6层RC框架，3跨×7榀',
        'AB/CD轴跨度：5400mm  BC轴跨度：2400mm  纵向跨度：6900mm',
        '层高：1F=4.0m, 2F~6F=3.0m, 总高=19.0m, 总宽=13.2m',
        '抗震：7度(0.15g), II类场地, Tg=0.35s, 三级抗震',
        '设计年限：50年  耐火等级：二级  结构安全等级：二级',
    ]
    for item in items:
        y -= 8
        t(45, y, item, h=3.5)

    # 材料表
    y -= 15
    t(35, y, '二、材料', h=5)
    y -= 8
    t(45, y, '混凝土：C30 (fc=14.3MPa, ft=1.43MPa) — 梁、板、柱、基础', h=3.5)
    y -= 7
    t(45, y, '钢筋：HRB400 (fy=fyv=360MPa) — 纵向钢筋及箍筋', h=3.5)
    y -= 7
    t(45, y, '墙体：240mm加气混凝土砌块(容重7.5kN/m³)', h=3.5)

    # 截面表
    y -= 15
    t(35, y, '三、构件截面尺寸', h=5)
    sections = [
        '框架柱：500×500mm (全楼统一)', '边跨框架梁KL1：250×500mm',
        '中跨框架梁KL2：250×400mm', '纵向框架梁：250×550mm',
        '次梁：200×400mm', '楼面板/屋面板：120mm',
    ]
    for s in sections:
        y -= 8
        t(45, y, s, h=3.5)

    # 荷载表
    y -= 15
    t(35, y, '四、荷载取值', h=5)
    loads = [
        '屋面恒载4.96kN/m²  楼面恒载4.2kN/m²', '楼面活载2.0kN/m²  走廊2.0kN/m²  屋面0.5kN/m²  楼梯间3.5kN/m²',
        '基本风压0.30kN/m²  基本雪压0.35kN/m²', '外墙自重2.50kN/m²  内墙自重2.48kN/m²  女儿墙5.02kN/m²',
    ]
    for s in loads:
        y -= 8
        t(45, y, s, h=3.5)

    # 规范依据
    y -= 15
    t(35, y, '五、设计依据', h=5)
    codes = ['GB50068-2018, GB55001-2021, GB55008-2021',
             'GB50009-2012(荷载), GB/T50011-2010(抗震2024版), GB/T50010-2010(混凝土2024版)',
             'GB50007-2011(地基基础)']
    for s in codes:
        y -= 8
        t(45, y, s, h=3.5)

    filepath = os.path.join(OUTPUT, '01-结构设计总说明.dxf')
    doc.saveas(filepath)
    print(f'✓ {filepath}')
```

- [ ] **Step 2: 测试生成并验证**

```bash
python generate_dxf.py
# 验证: 天正打开 dxf_output/01-结构设计总说明.dxf，检查图框、文字内容
```

- [ ] **Step 3: 提交**

```bash
git add generate_dxf.py && git commit -m "feat: 图纸01-结构设计总说明"
```

---

### Task 3: 图纸2 — 基础平面布置图+详图 (A2)

**Files:**
- Modify: `generate_dxf.py` (追加函数)

- [ ] **Step 1: 实现基础平面+详图**

```python
def draw_sheet_02():
    """基础平面布置图+详图 — A2横 594×420"""
    doc = ezdxf.new('R2010')
    setup_layers(doc)
    setup_styles(doc)
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '02', '基础平面布置图及详图', '1:100/1:30')

    # ===== 左半: 基础平面布置 =====
    # 轴线 (A=60, D=510, 间距150)
    xA, xB, xC, xD = 40, 265, 325, 550
    y1, y2, y3 = 300, 200, 100  # 3列
    span_labels = [(xA, 'A'), (xB, 'B'), (xC, 'C'), (xD, 'D')]

    for x, label in span_labels:
        msp.add_line((x, 30), (x, 320), dxfattribs={'layer': 'AXIS'})
        # 轴号圈
        msp.add_circle((x, 15), 6, dxfattribs={'layer': 'TITLE'})
        msp.add_text(label, dxfattribs={'layer': 'TITLE', 'height': 4}).set_placement(
            (x, 15), align=TextEntityAlignment.MIDDLE_CENTER)

    # 跨度标注
    for sx, ex, txt in [(xA+15, xB-15, '5400'), (xB+15, xC-15, '2400'), (xC+15, xD-15, '5400')]:
        msp.add_text(txt, dxfattribs={'layer': 'DIM', 'height': 3.5, 'color': 1}).set_placement(
            ((sx+ex)/2, 18))

    # JC-1 边柱基础
    jc1_w, jc1_h = 65, 80  # 1:100比例 65mm=6.5m (含基础宽度)
    for cy in [y1, y2, y3]:
        msp.add_lwpolyline([(xA-20, cy-40), (xA+45, cy-40), (xA+45, cy+40), (xA-20, cy+40), (xA-20, cy-40)],
                           dxfattribs={'layer': 'HATCH', 'color': 1})
        msp.add_text('JC-1\n2.8×3.2\nh=800', dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement(
            (xA+12, cy-5), align=TextEntityAlignment.MIDDLE_CENTER)

    # JC-2 中柱联合基础
    for cy in [y1, y2, y3]:
        msp.add_lwpolyline([(xB-15, cy-45), (xC+15, cy-45), (xC+15, cy+45), (xB-15, cy+45), (xB-15, cy-45)],
                           dxfattribs={'layer': 'HATCH', 'color': 5})
        msp.add_text('JC-2 联合基础\nh=900', dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement(
            ((xB+xC)/2, cy-5), align=TextEntityAlignment.MIDDLE_CENTER)

    # ===== 右半: 基础详图 (JC-1剖面 + JC-2剖面) =====
    # JC-1 剖面 (上)
    base_x = 380
    # 柱
    msp.add_lwpolyline([(base_x+20, 280), (base_x+50, 280), (base_x+50, 350), (base_x+20, 350), (base_x+20, 280)],
                       dxfattribs={'layer': 'COLUMN', 'color': 1})
    msp.add_text('500×500', dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement(
        (base_x+35, 305), align=TextEntityAlignment.MIDDLE_CENTER)
    # 基础梯形
    msp.add_lwpolyline([(base_x-10, 280), (base_x+80, 280), (base_x+60, 200), (base_x+10, 200), (base_x-10, 280)],
                       dxfattribs={'layer': 'HATCH', 'color': 1})
    # 标注
    msp.add_text('3200', dxfattribs={'layer': 'DIM', 'height': 2.5}).set_placement((base_x+35, 285))
    msp.add_text('2800', dxfattribs={'layer': 'DIM', 'height': 2.5}).set_placement((base_x+35, 195))
    msp.add_text('800', dxfattribs={'layer': 'DIM', 'height': 2.5}).set_placement((base_x+85, 240))
    msp.add_text('JC-1 边柱独立基础 1-1剖面', dxfattribs={'layer': 'TEXT', 'height': 4}).set_placement(
        (base_x+35, 360), align=TextEntityAlignment.MIDDLE_CENTER)
    # 配筋说明
    rebar_texts = ['配筋：', '底板双向 C14@150', '柱插筋 4C25', 'C30混凝土, 100厚C15垫层']
    for i, rt in enumerate(rebar_texts):
        msp.add_text(rt, dxfattribs={'layer': 'REBAR', 'height': 2.5}).set_placement((base_x-10, 185-i*8))

    # JC-2 剖面 (下)
    base_x2 = 480
    msp.add_text('JC-2 中柱联合基础 2-2剖面', dxfattribs={'layer': 'TEXT', 'height': 4}).set_placement(
        (base_x2+40, 360), align=TextEntityAlignment.MIDDLE_CENTER)
    # 两柱
    msp.add_lwpolyline([(base_x2, 280), (base_x2+25, 280), (base_x2+25, 340), (base_x2, 340), (base_x2, 280)],
                       dxfattribs={'layer': 'COLUMN', 'color': 5})
    msp.add_lwpolyline([(base_x2+55, 280), (base_x2+80, 280), (base_x2+80, 340), (base_x2+55, 340), (base_x2+55, 280)],
                       dxfattribs={'layer': 'COLUMN', 'color': 5})
    # 联合底板
    msp.add_lwpolyline([(base_x2-10, 280), (base_x2+90, 280), (base_x2+80, 200), (base_x2, 200), (base_x2-10, 280)],
                       dxfattribs={'layer': 'HATCH', 'color': 5})
    msp.add_text('900', dxfattribs={'layer': 'DIM', 'height': 2.5}).set_placement((base_x2+95, 240))
    rebar2 = ['配筋：', '底板双向 C14@150', '顶面双向 C12@200', '柱插筋 4C25', 'C30, C15垫层']
    for i, rt in enumerate(rebar2):
        msp.add_text(rt, dxfattribs={'layer': 'REBAR', 'height': 2.5}).set_placement((base_x2, 185-i*8))

    # 图例
    msp.add_lwpolyline([(290, 55), (305, 55), (305, 63), (290, 63), (290, 55)],
                       dxfattribs={'layer': 'HATCH', 'color': 1})
    msp.add_text('JC-1 边柱独立基础', dxfattribs={'layer': 'TEXT', 'height': 2.5}).set_placement((310, 56))
    msp.add_lwpolyline([(290, 42), (305, 42), (305, 50), (290, 50), (290, 42)],
                       dxfattribs={'layer': 'HATCH', 'color': 5})
    msp.add_text('JC-2 中柱联合基础', dxfattribs={'layer': 'TEXT', 'height': 2.5}).set_placement((310, 43))

    filepath = os.path.join(OUTPUT, '02-基础平面+详图.dxf')
    doc.saveas(filepath)
    print(f'✓ {filepath}')
```

- [ ] **Step 2: 提交**

```bash
git add generate_dxf.py && git commit -m "feat: 图纸02-基础平面+详图"
```

---

### Task 4: 图纸3 — 柱平面配筋图 (A2)

**Files:**
- Modify: `generate_dxf.py` (追加函数)

- [ ] **Step 1: 实现柱配筋图**

```python
def draw_sheet_03():
    """柱平面配筋图 — A2横 594×420"""
    doc = ezdxf.new('R2010')
    setup_layers(doc)
    setup_styles(doc)
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '03', '柱平面配筋图', '1:100')

    # 轴线 (同前, 向上偏移)
    xA, xB, xC, xD = 40, 265, 325, 550

    # 1F 平面 (上半)
    y_1f = 350
    for x, label in [(xA, 'A'), (xB, 'B'), (xC, 'C'), (xD, 'D')]:
        msp.add_line((x, y_1f-200), (x, y_1f), dxfattribs={'layer': 'AXIS'})
    for y in [y_1f-20, y_1f-110]:
        msp.add_line((xA-10, y), (xD+10, y), dxfattribs={'layer': 'AXIS'})

    # 跨度标注
    for sx, ex, txt in [(xA, xB, '5400'), (xB, xC, '2400'), (xC, xD, '5400')]:
        msp.add_text(txt, dxfattribs={'layer': 'DIM', 'height': 3, 'color': 1}).set_placement(
            ((sx+ex)/2, y_1f+5))

    # 1F柱 KZ-A~D
    col_data_1f = [
        (xA, 'KZ-A', 1), (xB, 'KZ-B', 5), (xC, 'KZ-C', 5), (xD, 'KZ-D', 1)
    ]
    for cx, clabel, color in col_data_1f:
        for row_y in [y_1f-30, y_1f-120]:
            msp.add_lwpolyline([(cx-18, row_y-25), (cx+18, row_y-25), (cx+18, row_y+25),
                                (cx-18, row_y+25), (cx-18, row_y-25)], dxfattribs={'layer': 'COLUMN', 'color': color})
            msp.add_text(f'{clabel}\n500×500\n4C25+C8@100/200',
                        dxfattribs={'layer': 'TEXT', 'height': 2.5}).set_placement(
                (cx, row_y-3), align=TextEntityAlignment.MIDDLE_CENTER)

    # 柱配筋表 (下半)
    y_tbl = 180
    msp.add_text('柱配筋表 (16G101-1 平法)', dxfattribs={'layer': 'TEXT', 'height': 4}).set_placement((W/2, y_tbl),
                                                                                     align=TextEntityAlignment.MIDDLE_CENTER)
    # 表头
    y_tbl -= 10
    cols = [(50, '楼层'), (130, '边柱KZ-A/D'), (280, '中柱KZ-B/C'), (420, '轴压比(边/中)')]
    for cx, ch in cols:
        msp.add_text(ch, dxfattribs={'layer': 'TITLE', 'height': 3}).set_placement((cx, y_tbl))

    # 表数据
    tbl_data = [
        ('6F', '4C18 C8@100/200', '4C18 C8@100/200', '0.06/0.07'),
        ('5F', '4C20 C8@100/200', '4C20 C8@100/200', '0.13/0.16'),
        ('4F', '4C22 C8@100/200', '4C22 C8@100/200', '0.20/0.25'),
        ('3F', '4C22 C8@100/200', '4C22 C8@100/200', '0.28/0.34'),
        ('2F', '4C22 C8@100/200', '4C22 C8@100/200', '0.36/0.43'),
        ('1F', '4C25 C8@100/200', '4C25 C8@100/200', '0.44/0.52'),
    ]
    for row_data in tbl_data:
        y_tbl -= 8
        for i, (cx, _) in enumerate(cols):
            msp.add_text(row_data[i], dxfattribs={'layer': 'TEXT', 'height': 2.5}).set_placement((cx, y_tbl))

    filepath = os.path.join(OUTPUT, '03-柱配筋图.dxf')
    doc.saveas(filepath)
    print(f'✓ {filepath}')
```

- [ ] **Step 2: 提交**

```bash
git add generate_dxf.py && git commit -m "feat: 图纸03-柱配筋图"
```

---

### Task 5: 图纸4-6 批量实现 + 主函数

剩余3张图纸(梁配筋图、板配筋图、楼梯详图)实现模式相同，在单个任务中完成。

**Files:**
- Modify: `generate_dxf.py` (追加3个函数 + main)

- [ ] **Step 1: 实现梁配筋图 (A2)**

```python
def draw_sheet_04():
    """梁平面配筋图 — A2横 594×420"""
    doc = ezdxf.new('R2010')
    setup_layers(doc)
    setup_styles(doc)
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '04', '梁平面配筋图', '1:100')

    xA, xB, xC, xD = 40, 265, 325, 550
    y_1f = 350

    # 轴线
    for x, label in [(xA, 'A'), (xB, 'B'), (xC, 'C'), (xD, 'D')]:
        msp.add_line((x, y_1f-200), (x, y_1f), dxfattribs={'layer': 'AXIS'})
        msp.add_circle((x, y_1f+10), 6, dxfattribs={'layer': 'TITLE'})
        msp.add_text(label, dxfattribs={'layer': 'TITLE', 'height': 4}).set_placement(
            (x, y_1f+10), align=TextEntityAlignment.MIDDLE_CENTER)

    for y_row in [y_1f-30, y_1f-120]:
        msp.add_line((xA-10, y_row), (xD+10, y_row), dxfattribs={'layer': 'AXIS'})

    # 梁
    beam_y_vals = [y_1f-20, y_1f-110]
    for by in beam_y_vals:
        # KL1 边跨
        msp.add_line((xA, by-3), (xB, by-3), dxfattribs={'layer': 'BEAM'})
        msp.add_line((xA, by+3), (xB, by+3), dxfattribs={'layer': 'BEAM'})
        msp.add_line((xC, by-3), (xD, by-3), dxfattribs={'layer': 'BEAM'})
        msp.add_line((xC, by+3), (xD, by+3), dxfattribs={'layer': 'BEAM'})
        # KL2 中跨
        msp.add_line((xB, by-2), (xC, by-2), dxfattribs={'layer': 'BEAM'})
        msp.add_line((xB, by+2), (xC, by+2), dxfattribs={'layer': 'BEAM'})

    # KL1 平法标注
    bm = (xA + xB) / 2
    msp.add_text('KL1(1)250×500', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 1}).set_placement((bm, y_1f-10))
    msp.add_text('5C16;2C16', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 1}).set_placement((bm, y_1f-17))
    msp.add_text('C8@100/200(2)', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 1}).set_placement((bm, y_1f-24))
    msp.add_text('G2C12', dxfattribs={'layer': 'TEXT', 'height': 2.5, 'color': 8}).set_placement((bm, y_1f-31))

    # CD轴KL1
    bm2 = (xC + xD) / 2
    msp.add_text('KL1(1)250×500', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 1}).set_placement((bm2, y_1f-10))
    msp.add_text('5C16;2C16', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 1}).set_placement((bm2, y_1f-17))
    msp.add_text('C8@100/200(2)', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 1}).set_placement((bm2, y_1f-24))

    # KL2 标注
    bm3 = (xB + xC) / 2
    msp.add_text('KL2(1)250×400', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 5}).set_placement((bm3, y_1f-10))
    msp.add_text('5C16;2C16', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 5}).set_placement((bm3, y_1f-17))
    msp.add_text('C8@100/200(2)', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 5}).set_placement((bm3, y_1f-24))

    # 梁截面内力表 (下半)
    y_note = 180
    msp.add_text('1F 梁截面内力设计值 (5400版本)', dxfattribs={'layer': 'TEXT', 'height': 5}).set_placement((W/2, y_note),
                                                                                          align=TextEntityAlignment.MIDDLE_CENTER)
    notes = [
        '边跨KL1: M左=-125.25  M中=136.90  M右=-116.71 kN·m   V=214.71kN',
        '中跨KL2: M左=-93.96   M中=8.64    M右=-93.96 kN·m   V=145.19kN',
        '箍筋: KL1=C8@100/200(2)加密区750  KL2=C8@100/200(2)加密区600',
        '数据来源: 表8-5(正截面) 表8-6(斜截面) [5400版本]',
    ]
    for i, note in enumerate(notes):
        msp.add_text(note, dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement((50, y_note - 15 - i*10))

    filepath = os.path.join(OUTPUT, '04-梁配筋图.dxf')
    doc.saveas(filepath)
    print(f'✓ {filepath}')
```

- [ ] **Step 2: 实现板配筋图 (A2)**

```python
def draw_sheet_05():
    """板平面配筋图 — A2横 594×420"""
    doc = ezdxf.new('R2010')
    setup_layers(doc)
    setup_styles(doc)
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '05', '板平面配筋图', '1:100')

    xA, xB, xC, xD = 40, 265, 325, 550
    y_top = 350

    # 轴线
    for x, label in [(xA, 'A'), (xB, 'B'), (xC, 'C'), (xD, 'D')]:
        msp.add_line((x, 50), (x, y_top), dxfattribs={'layer': 'AXIS'})
        msp.add_circle((x, y_top+10), 6, dxfattribs={'layer': 'TITLE'})
        msp.add_text(label, dxfattribs={'layer': 'TITLE', 'height': 4}).set_placement((x, y_top+10),
                                                                                       align=TextEntityAlignment.MIDDLE_CENTER)
    for y_row in [y_top-20, y_top-110, 230, 140]:
        msp.add_line((xA-10, y_row), (xD+10, y_row), dxfattribs={'layer': 'AXIS'})

    # A板 (AB跨+CD跨, 5.4×3.45)
    for row_y in [y_top-30, 240, 150]:
        msp.add_lwpolyline([(xA+2, row_y-42), (xB-2, row_y-42), (xB-2, row_y+42),
                            (xA+2, row_y+42), (xA+2, row_y-42)], dxfattribs={'layer': 'SLAB'})
        msp.add_text('A板\n5.4×3.45 λ=1.57\nC8@200双向', dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement(
            ((xA+xB)/2, row_y), align=TextEntityAlignment.MIDDLE_CENTER)

        msp.add_lwpolyline([(xC+2, row_y-42), (xD-2, row_y-42), (xD-2, row_y+42),
                            (xC+2, row_y+42), (xC+2, row_y-42)], dxfattribs={'layer': 'SLAB'})
        msp.add_text('A板\n5.4×3.45 λ=1.57\nC8@200双向', dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement(
            ((xC+xD)/2, row_y), align=TextEntityAlignment.MIDDLE_CENTER)

    # B板 (BC跨, 6.9×2.4)
    for row_y in [y_top-30, 240, 150]:
        msp.add_lwpolyline([(xB+2, row_y-35), (xC-2, row_y-35), (xC-2, row_y+35),
                            (xB+2, row_y+35), (xB+2, row_y-35)], dxfattribs={'layer': 'SLAB', 'color': 5})
        msp.add_text('B板\n6.9×2.4\nC8@200双向', dxfattribs={'layer': 'TEXT', 'height': 3, 'color': 5}).set_placement(
            ((xB+xC)/2, row_y), align=TextEntityAlignment.MIDDLE_CENTER)

    # 板配筋信息 (底部)
    y_info = 35
    msp.add_text('A板: 短跨弯矩=-8.28/4.50kN·m/m  长跨弯矩=-5.51/2.22kN·m/m  λ=1.57  C8@200(As=251mm²)',
                 dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement((30, y_info))
    msp.add_text('B板: λ=2.88  C8@200双向  支座附加筋C8@200  板厚120  C30+HRB400  来源: 表9-3~9-4',
                 dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement((30, y_info-8))

    filepath = os.path.join(OUTPUT, '05-板配筋图.dxf')
    doc.saveas(filepath)
    print(f'✓ {filepath}')
```

- [ ] **Step 3: 实现楼梯详图 (A3)**

```python
def draw_sheet_06():
    """楼梯详图 — A3竖 297×420"""
    doc = ezdxf.new('R2010')
    setup_layers(doc)
    setup_styles(doc)
    msp = doc.modelspace()
    W, H = 297, 420
    make_title_block(msp, W, H, '06', '楼梯详图', '1:50')

    # ===== 上半: 楼梯平面图 =====
    y_plan = 390
    msp.add_text('楼梯标准层平面图', dxfattribs={'layer': 'TEXT', 'height': 5}).set_placement(
        (W/2, y_plan), align=TextEntityAlignment.MIDDLE_CENTER)

    # 梯段1
    stair_l, stair_w = 90, 120
    msp.add_lwpolyline([(20, y_plan-20), (20+stair_l, y_plan-20), (20+stair_l, y_plan-20-stair_w),
                        (20, y_plan-20-stair_w), (20, y_plan-20)], dxfattribs={'layer': 'HATCH'})
    msp.add_text('上 ↑', dxfattribs={'layer': 'TEXT', 'height': 3.5}).set_placement(
        (20+stair_l/2, y_plan-20-stair_w/2), align=TextEntityAlignment.MIDDLE_CENTER)

    # 踏步线
    for i in range(6):
        y_step = y_plan - 20 - i * 20
        msp.add_line((20, y_step), (20+stair_l, y_step), dxfattribs={'layer': 'TEXT'})

    # 休息平台
    msp.add_lwpolyline([(20+stair_l, y_plan-20), (20+stair_l+60, y_plan-20),
                        (20+stair_l+60, y_plan-20-stair_w), (20+stair_l, y_plan-20-stair_w),
                        (20+stair_l, y_plan-20)], dxfattribs={'layer': 'SLAB'})
    msp.add_text('休息平台\n1600×3000', dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement(
        (20+stair_l+30, y_plan-20-stair_w/2), align=TextEntityAlignment.MIDDLE_CENTER)

    # 梯段2
    msp.add_lwpolyline([(20+stair_l+60, y_plan-20), (20+stair_l+60+80, y_plan-20),
                        (20+stair_l+60+80, y_plan-20-stair_w), (20+stair_l+60, y_plan-20-stair_w),
                        (20+stair_l+60, y_plan-20)], dxfattribs={'layer': 'HATCH'})
    msp.add_text('下 ↓', dxfattribs={'layer': 'TEXT', 'height': 3.5}).set_placement(
        (20+stair_l+60+40, y_plan-20-stair_w/2), align=TextEntityAlignment.MIDDLE_CENTER)

    for i in range(6):
        y_step = y_plan - 20 - i * 20
        msp.add_line((20+stair_l+60, y_step), (20+stair_l+60+80, y_step), dxfattribs={'layer': 'TEXT'})

    # 梯梁
    for tx, tw in [(20, stair_l), (20+stair_l+60, 80)]:
        msp.add_line((tx, y_plan-17), (tx+tw, y_plan-17), dxfattribs={'layer': 'BEAM', 'color': 1})
        msp.add_line((tx, y_plan-17-stair_w-3), (tx+tw, y_plan-17-stair_w-3), dxfattribs={'layer': 'BEAM', 'color': 1})

    # ===== 下半: 楼梯参数和配筋表 =====
    y_info = y_plan - 20 - stair_w - 30
    params = [
        '楼梯设计参数：',
        '板式楼梯  中间层  层高3000mm',
        '踏步: 167×280mm  梯段板厚: 100mm',
        '水平跨度: 2240mm (8步)  斜向跨度: 2696mm',
        '平台板厚: 100mm  平台净跨: 1600mm',
        '梯梁: 200×400mm  梯梁跨度: 3000mm',
        '活载: 3.5kN/m²',
        '',
        '配筋：',
        '梯段板: C8@200 (跨中)  平台板: C8@200 双向',
        '梯梁: 2C16(底)+2C16(顶)  梯梁箍筋: C8@200',
        'C30混凝土, HRB400钢筋',
    ]
    for param in params:
        msp.add_text(param, dxfattribs={'layer': 'TEXT', 'height': 3}).set_placement((20, y_info))
        y_info -= 8

    filepath = os.path.join(OUTPUT, '06-楼梯详图.dxf')
    doc.saveas(filepath)
    print(f'✓ {filepath}')
```

- [ ] **Step 4: 实现主函数**

```python
def main():
    print('生成结构施工图DXF...')
    draw_sheet_01()
    draw_sheet_02()
    draw_sheet_03()
    draw_sheet_04()
    draw_sheet_05()
    draw_sheet_06()
    print(f'\n全部完成! 共6张图纸 → {OUTPUT}')

if __name__ == '__main__':
    main()
```

- [ ] **Step 5: 运行完整脚本验证**

```bash
python generate_dxf.py
# 预期: dxf_output/ 下生成6个dxf文件
# 验证: 天正逐个打开, 检查图框/文字/轴线/标注
```

- [ ] **Step 6: 提交**

```bash
git add generate_dxf.py && git commit -m "feat: 图纸04-06 + 主函数 — 全部6张结构施工图完成"
```
