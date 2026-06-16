#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成结构施工图DXF文件 — 5400跨度版本
河北省邢台市天一苑3栋 6层RC框架结构
数据来源: 计算书 5400 修正版
"""
import ezdxf
from ezdxf.enums import TextEntityAlignment
from ezdxf.math import Vec3
import os, math

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dxf_output')
os.makedirs(OUTPUT, exist_ok=True)

# ============================================================
# 数据常量 (5400版本计算书)
# ============================================================

# 截面尺寸
COL = 500  # 柱 500×500
BEAM_EDGE_B, BEAM_EDGE_H = 250, 500  # 边跨梁
BEAM_MID_B, BEAM_MID_H = 250, 400    # 中跨梁
H_SLAB = 120  # 板厚

# 跨度
SPAN_EDGE, SPAN_MID, SPAN_LONG = 5400, 2400, 6900
FLOORS = 6
LAYER_1F, LAYER_STD = 4.0, 3.0
TOTAL_H = 19.0
TOTAL_W = SPAN_EDGE + SPAN_MID + SPAN_EDGE  # 13200

# 材料
FC, FT = 14.3, 1.43
FY, FYV = 360, 360
MAT_CONC, MAT_REBAR = 'C30', 'HRB400'

# 基础 (第11章)
JC1_B, JC1_L, JC1_H = 2800, 3200, 800  # 边柱独基
JC2_H = 900  # 中柱联合基础

# 1F 梁内力设计值 (表8-4~8-6)
KL1_M_LEFT, KL1_M_MID, KL1_M_RIGHT = -125.25, 136.90, -116.71
KL1_V = 214.71
KL2_M_LEFT, KL2_M_MID, KL2_M_RIGHT = -93.96, 8.64, -93.96
KL2_V = 145.19

# 梁配筋
KL1_TOP, KL1_BOT, KL1_STIRRUP = '5C16', '2C16', 'C8@100/200(2)'
KL2_TOP, KL2_BOT, KL2_STIRRUP = '5C16', '2C16', 'C8@100/200(2)'
KL_GIRDER = 'G2C12'

# 柱配筋 (表8-7~12)
COL_FLOORS_EDGE = {6: '4C18', 5: '4C20', 4: '4C22', 3: '4C22', 2: '4C22', 1: '4C25'}
COL_FLOORS_MID  = {6: '4C18', 5: '4C20', 4: '4C22', 3: '4C22', 2: '4C22', 1: '4C25'}
COL_STIRRUP = 'C8@100/200'
COL_AXIAL = {  # (边/中) 轴压比
    6: (0.06, 0.07), 5: (0.13, 0.16), 4: (0.20, 0.25),
    3: (0.28, 0.34), 2: (0.36, 0.43), 1: (0.44, 0.52)
}

# A板 (表9-3~4) 5.4×3.45 λ=1.57
A_LX, A_LY, A_LAM = 3.45, 5.4, 1.57
A_M_SUP_S, A_M_SUP_L = -8.28, -5.51  # 支座弯矩
A_M_MID_S, A_M_MID_L = 4.50, 2.22      # 跨中弯矩
A_REBAR = 'C8@200'

# 楼梯 (第10章)
STAIR_RISE, STAIR_GOING = 167, 280
STAIR_H = 100  # 梯段板厚
STAIR_HORIZ = 2240
STAIR_SLOPE = 2696
STAIR_PLAT_W, STAIR_PLAT_L = 1600, 3000
STAIR_BEAM_B, STAIR_BEAM_H = 200, 400

# ============================================================
# 公共函数
# ============================================================

def create_doc():
    """创建DXF文档并设置图层/样式"""
    doc = ezdxf.new('R2010')
    _setup_layers(doc)
    _setup_styles(doc)
    return doc

def _setup_layers(doc):
    layers_def = {
        'AXIS':   {'color': 1, 'linetype': 'CENTER',      'lw': 13},
        'COLUMN': {'color': 7, 'linetype': 'CONTINUOUS',   'lw': 35},
        'BEAM':   {'color': 7, 'linetype': 'CONTINUOUS',   'lw': 35},
        'SLAB':   {'color': 7, 'linetype': 'CONTINUOUS',   'lw': 25},
        'DIM':    {'color': 3, 'linetype': 'CONTINUOUS',   'lw': 13},
        'TEXT':   {'color': 7, 'linetype': 'CONTINUOUS',   'lw': 18},
        'TITLE':  {'color': 7, 'linetype': 'CONTINUOUS',   'lw': 25},
        'REBAR':  {'color': 1, 'linetype': 'CONTINUOUS',   'lw': 25},
        'HATCH':  {'color': 8, 'linetype': 'CONTINUOUS',   'lw': 13},
        'THIN':   {'color': 8, 'linetype': 'CONTINUOUS',   'lw': 5},
    }
    for name, props in layers_def.items():
        layer = doc.layers.new(name)
        layer.color = props['color']
        if props['linetype'] in doc.linetypes:
            layer.linetype = props['linetype']
        else:
            layer.linetype = 'CONTINUOUS'
        layer.dxf.lineweight = props['lw']

def _setup_styles(doc):
    doc.styles.new('GB', dxfattribs={'font': 'simhei.ttf', 'width': 0.7})

def make_title_block(msp, w, h, dwg_num, dwg_name, scale='1:100'):
    """标准图框 + 标题栏 (GB/T 50001)"""
    L = 'TITLE'
    # 外框
    msp.add_lwpolyline([(0,0),(w,0),(w,h),(0,h),(0,0)], dxfattribs={'layer': L})
    # 内框 (装订边25mm, 其他10mm)
    msp.add_lwpolyline([(25,10),(w-10,10),(w-10,h-10),(25,h-10),(25,10)], dxfattribs={'layer': L})

    # 标题栏 180×56 右下角
    tx0, ty0 = w - 190, 10
    tb_h = 56
    # 外框
    msp.add_lwpolyline([(tx0, ty0), (w-10, ty0), (w-10, ty0+tb_h), (tx0, ty0+tb_h), (tx0, ty0)],
                       dxfattribs={'layer': L})
    # 竖线
    for xx in [tx0+30, tx0+70, tx0+110]:
        msp.add_line((xx, ty0), (xx, ty0+tb_h), dxfattribs={'layer': 'THIN'})
    # 横线
    for yy in [ty0+18, ty0+32]:
        msp.add_line((tx0, yy), (w-10, yy), dxfattribs={'layer': 'THIN'})

    # 标题栏文字
    T = lambda x, y, s, h=3.5, a=TextEntityAlignment.MIDDLE_CENTER: \
        msp.add_text(s, dxfattribs={'layer': L, 'height': h}).set_placement((x, y), align=a)

    T(tx0+15, ty0+9, '审核', 3)
    T(tx0+50, ty0+9, '设计', 3)
    T(tx0+90, ty0+9, '比例', 3)
    T(tx0+130, ty0+9, '日期', 3)
    T(tx0+150, ty0+9, '2025.06', 3)
    T(tx0+15, ty0+25, '图号', 3)
    T(tx0+50, ty0+25, dwg_num, 4)
    T(tx0+90, ty0+25, scale, 3)
    T(tx0+130, ty0+25, '版次', 3)
    T(tx0+150, ty0+25, 'A', 3)
    T(tx0+100, ty0+44, dwg_name, 4.5)

def T(msp, x, y, s, h=3.5, layer='TEXT', color=None, align=TextEntityAlignment.LEFT):
    """快捷文字 (默认左对齐)"""
    attrs = {'layer': layer, 'height': h}
    if color is not None:
        attrs['color'] = color
    entity = msp.add_text(s, dxfattribs=attrs)
    if align == TextEntityAlignment.LEFT:
        entity.dxf.insert = (x, y)
    else:
        entity.set_placement((x, y), align=align)
    return entity

def TC(msp, x, y, s, h=3.5, layer='TEXT', color=None):
    """快捷文字 (居中对齐)"""
    return T(msp, x, y, s, h, layer, color, align=TextEntityAlignment.MIDDLE_CENTER)

def draw_axis_grid(msp, xA, xB, xC, xD, y_top, y_bot, labels=True):
    """绘制轴线网格 A-B-C-D (横向) + 纵轴"""
    for x, lb in [(xA,'A'),(xB,'B'),(xC,'C'),(xD,'D')]:
        msp.add_line((x, y_bot), (x, y_top), dxfattribs={'layer': 'AXIS'})
        if labels:
            msp.add_circle((x, y_top+10), 6, dxfattribs={'layer': 'TITLE'})
            TC(msp, x, y_top+10, lb, 4, 'TITLE')
    # 跨度标注
    for sx, ex, txt in [(xA,xB,'5400'), (xB,xC,'2400'), (xC,xD,'5400')]:
        TC(msp, (sx+ex)/2, y_top+18, txt, 3, 'DIM')

def draw_col_symbol(msp, cx, cy, label, color=7):
    """柱符号：36×50矩形 + 平法标注"""
    msp.add_lwpolyline([(cx-18,cy-25),(cx+18,cy-25),(cx+18,cy+25),(cx-18,cy+25),(cx-18,cy-25)],
                       dxfattribs={'layer': 'COLUMN', 'color': color})
    TC(msp, cx, cy, label, 2.5, 'TEXT', color)

# ============================================================
# 图纸01: 结构设计总说明 (A3横 420×297)
# ============================================================

def draw_sheet_01():
    doc = create_doc()
    msp = doc.modelspace()
    W, H = 420, 297
    make_title_block(msp, W, H, '01', '结构设计总说明', '—')
    L = 'TEXT'

    TC(msp, W/2, H-30, '结构设计总说明', 7, L)

    y = H - 50
    sections = [
        ('一、工程概况', 5, [
            '工程名称：河北省邢台市天一苑3栋',
            '结构类型：6层RC框架结构，3跨×7榀，一字型布局',
            'AB/CD轴跨度：5400mm     BC轴跨度：2400mm     纵向跨度：6900mm',
            '层高：1F=4.0m(含1m嵌固端), 2F~6F=3.0m, 总高=19.0m, 总宽=13.2m',
            '抗震设防：7度(0.15g), 第一组, Ⅱ类场地, Tg=0.35s, 三级抗震等级',
            '设计使用年限：50年  耐火等级：二级  结构安全等级：二级',
            '基础形式：柱下独立基础(边柱)+联合基础(中柱), 持力层粉质黏土 fak=180kPa',
        ]),
        ('二、材料', 5, [
            '混凝土：C30 (fc=14.3MPa, ft=1.43MPa) — 梁、板、柱、基础',
            '钢筋：HRB400 (fy=fyv=360MPa) — 纵向受力钢筋及箍筋',
            '墙体：240mm厚加气混凝土砌块 (容重7.5kN/m³)',
        ]),
        ('三、构件截面尺寸', 5, [
            '框架柱：500×500mm (边柱、中柱统一)',
            '横向边跨框架梁(KL1)：250×500mm    横向中跨框架梁(KL2)：250×400mm',
            '纵向框架梁：250×550mm    次梁：200×400mm',
            '楼面板/屋面板厚度：120mm',
        ]),
        ('四、荷载取值', 5, [
            '屋面恒载：4.96kN/m²    楼面恒载：4.2kN/m²',
            '楼面活载：2.0kN/m²    走廊：2.0kN/m²    上人屋面：0.5kN/m²    楼梯间：3.5kN/m²',
            '基本风压：0.30kN/m² (50年重现期)    基本雪压：0.35kN/m²',
            '外墙自重：2.50kN/m²    内墙自重：2.48kN/m²    女儿墙：5.02kN/m²',
            '结构阻尼比：0.05    特征周期Tg=0.35s',
        ]),
        ('五、设计依据', 5, [
            'GB50068-2018 建筑结构可靠性设计统一标准',
            'GB55001-2021 工程结构通用规范    GB55008-2021 混凝土结构通用规范',
            'GB50009-2012 建筑结构荷载规范    GB/T50011-2010 建筑抗震设计规范(2024年版)',
            'GB/T50010-2010 混凝土结构设计规范(2024年版)    GB50007-2011 建筑地基基础设计规范',
            '16G101-1 混凝土结构施工图平面整体表示方法制图规则和构造详图',
        ]),
        ('六、5400跨度变更说明', 5, [
            'AB/CD轴边跨由4800→5400mm：梯形等效荷载系数0.789→0.829',
            '边跨梁线刚度减小约11%, D值略降, 梁端弯矩增大20~40%',
            '底层柱轴力增大, 基础底面加大。自振周期T₁=0.61→0.56s',
            'FEK=2289kN, D_std_total=544658, D_1st_total=413908',
        ]),
    ]

    for title, title_h, items in sections:
        y -= 8
        T(msp, 35, y, title, title_h, L)
        y -= 8
        for item in items:
            T(msp, 45, y, item, 3, L)
            y -= 7
        y -= 3

    filepath = os.path.join(OUTPUT, '01-结构设计总说明.dxf')
    doc.saveas(filepath)
    print(f'OK {filepath}')
    return filepath

# ============================================================
# 图纸02: 基础平面布置图+详图 (A2横 594×420)
# ============================================================

def draw_sheet_02():
    doc = create_doc()
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '02', '基础平面布置图及详图', '1:100/1:30')

    # 轴线坐标
    xA, xB, xC, xD = 40, 270, 330, 560
    y1, y2, y3 = 320, 210, 100

    # === 左半: 基础平面布置 ===
    draw_axis_grid(msp, xA, xB, xC, xD, y1+20, y3-30, labels=True)

    # 纵向线
    for yy in [y1, y2, y3]:
        msp.add_line((xA-15, yy), (xD+15, yy), dxfattribs={'layer': 'AXIS'})
        msp.add_circle((xA-15, yy), 5, dxfattribs={'layer': 'TITLE'})
        TC(msp, xA-15, yy, str({y1:1,y2:2,y3:3}[yy]), 3.5, 'TITLE')

    # JC-1 边柱基础 (A轴和D轴)
    for cx in [xA, xD]:
        for yy in [y1, y2, y3]:
            msp.add_lwpolyline([
                (cx-35,yy-45),(cx+35,yy-45),(cx+35,yy+45),(cx-35,yy+45),(cx-35,yy-45)
            ], dxfattribs={'layer': 'HATCH', 'color': 1})
            TC(msp, cx, yy, 'JC-1', 3, 'TEXT', 1)
            TC(msp, cx, yy-10, '2.8x3.2', 2.5, 'TEXT', 1)
            TC(msp, cx, yy-18, 'h=800', 2, 'TEXT', 8)

    # JC-2 中柱联合基础 (B-C轴)
    mid_x = (xB + xC) / 2
    for yy in [y1, y2, y3]:
        msp.add_lwpolyline([
            (xB-20,yy-50),(xC+20,yy-50),(xC+20,yy+50),(xB-20,yy+50),(xB-20,yy-50)
        ], dxfattribs={'layer': 'HATCH', 'color': 5})
        TC(msp, mid_x, yy, 'JC-2 联合基础', 3, 'TEXT', 5)
        TC(msp, mid_x, yy-10, 'h=900', 2.5, 'TEXT', 8)

    # 图例
    y_leg = 40
    msp.add_lwpolyline([(30,y_leg-5),(45,y_leg-5),(45,y_leg+5),(30,y_leg+5),(30,y_leg-5)],
                       dxfattribs={'layer': 'HATCH', 'color': 1})
    T(msp, 52, y_leg, 'JC-1 边柱独立基础', 2.5, 'TEXT')
    msp.add_lwpolyline([(30,y_leg-18),(45,y_leg-18),(45,y_leg-8),(30,y_leg-8),(30,y_leg-18)],
                       dxfattribs={'layer': 'HATCH', 'color': 5})
    T(msp, 52, y_leg-13, 'JC-2 中柱联合基础', 2.5, 'TEXT')

    # 说明
    T(msp, 160, 40, '基础说明：', 3, 'TEXT')
    T(msp, 160, 33, '1. C30混凝土, HRB400钢筋, 100厚C15素混凝土垫层', 2.5, 'TEXT')
    T(msp, 160, 27, '2. 基础底面标高：-2.000m（持力层为粉质黏土, fak=180kPa）', 2.5, 'TEXT')
    T(msp, 160, 21, '3. 保护层厚度：基础底板40mm, 柱35mm', 2.5, 'TEXT')
    T(msp, 160, 15, '4. 数据来源：第11章 表11-1 基础内力设计值', 2.5, 'TEXT', 8)

    # === 右半: 基础详图 ===
    # JC-1 剖面 (上)
    bx1 = 390
    TC(msp, bx1+45, 370, 'JC-1 边柱独立基础 1-1剖面', 4, 'TITLE')
    # 基础底板
    msp.add_lwpolyline([
        (bx1-10,300),(bx1+100,300),(bx1+80,200),(bx1+20,200),(bx1-10,300)
    ], dxfattribs={'layer': 'HATCH', 'color': 1})
    # 柱
    msp.add_lwpolyline([
        (bx1+15,300),(bx1+75,300),(bx1+75,360),(bx1+15,360),(bx1+15,300)
    ], dxfattribs={'layer': 'COLUMN', 'color': 1})
    TC(msp, bx1+45, 320, 'KZ-A/D', 3, 'TEXT', 1)
    TC(msp, bx1+45, 313, '500x500', 2.5, 'TEXT', 1)
    # 尺寸标注
    TC(msp, bx1+45, 295, '3200', 2.5, 'DIM')
    TC(msp, bx1+45, 195, '2800', 2.5, 'DIM')
    T(msp, bx1+105, 250, '800', 2.5, 'DIM')
    # 配筋
    y_rb = 185
    for rb in ['配筋：', '底板双向 C14@150', '柱插筋 4C25', 'C30, C15垫层']:
        T(msp, bx1-5, y_rb, rb, 2.5, 'REBAR', 1)
        y_rb -= 8

    # JC-2 剖面 (下)
    bx2 = 480
    TC(msp, bx2+55, 370, 'JC-2 中柱联合基础 2-2剖面', 4, 'TITLE')
    # 基础底板
    msp.add_lwpolyline([
        (bx2-10,300),(bx2+120,300),(bx2+105,200),(bx2+15,200),(bx2-10,300)
    ], dxfattribs={'layer': 'HATCH', 'color': 5})
    # 两柱 B+C
    for cx_off in [5, 75]:
        msp.add_lwpolyline([
            (bx2+cx_off,300),(bx2+cx_off+30,300),(bx2+cx_off+30,350),(bx2+cx_off,350),(bx2+cx_off,300)
        ], dxfattribs={'layer': 'COLUMN', 'color': 5})
    TC(msp, bx2+20, 315, 'KZ-B', 2.5, 'TEXT', 5)
    TC(msp, bx2+90, 315, 'KZ-C', 2.5, 'TEXT', 5)
    # 尺寸
    T(msp, bx2+128, 250, '900', 2.5, 'DIM', 5)
    y_rb = 185
    for rb in ['配筋：', '底板双向 C14@150', '顶面双向 C12@200', '柱插筋 4C25', 'C30, C15垫层']:
        T(msp, bx2, y_rb, rb, 2.5, 'REBAR', 5)
        y_rb -= 8

    filepath = os.path.join(OUTPUT, '02-基础平面+详图.dxf')
    doc.saveas(filepath)
    print(f'OK {filepath}')
    return filepath

# ============================================================
# 图纸03: 柱平面配筋图 (A2横 594×420)
# ============================================================

def draw_sheet_03():
    doc = create_doc()
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '03', '柱平面配筋图 (2F-6F)', '1:100')

    xA, xB, xC, xD = 40, 270, 330, 560
    y1, y2 = 345, 245

    # 轴线
    draw_axis_grid(msp, xA, xB, xC, xD, y1+20, y2-20, labels=True)
    for yy in [y1, y2]:
        msp.add_line((xA-15, yy), (xD+15, yy), dxfattribs={'layer': 'AXIS'})

    # 2F-6F柱 (上行)
    TC(msp, 100, y1+30, '2F | 标准层', 3.5, 'TEXT')
    for cx, lb, cl in [(xA,'KZ-A',1),(xB,'KZ-B',5),(xC,'KZ-C',5),(xD,'KZ-D',1)]:
        draw_col_symbol(msp, cx, y1, f'{lb}\n500x500\n4C22+{COL_STIRRUP}', cl)

    # 1F柱 (下行)
    TC(msp, 100, y2+30, '1F | 底层', 3.5, color=1)
    for cx, lb, cl in [(xA,'KZ-A',1),(xB,'KZ-B',5),(xC,'KZ-C',5),(xD,'KZ-D',1)]:
        draw_col_symbol(msp, cx, y2, f'{lb}\n500x500\n4C25+{COL_STIRRUP}', cl)

    # 图例
    msp.add_lwpolyline([(460, y2+5),(475,y2+5),(475,y2+20),(460,y2+20),(460,y2+5)],
                       dxfattribs={'layer': 'COLUMN', 'color': 1})
    T(msp, 480, y2+10, '边柱 KZ-A/D (红色)', 2.5, 'TEXT', 1)
    msp.add_lwpolyline([(460, y2-18),(475,y2-18),(475,y2-3),(460,y2-3),(460,y2-18)],
                       dxfattribs={'layer': 'COLUMN', 'color': 5})
    T(msp, 480, y2-10, '中柱 KZ-B/C (蓝色)', 2.5, 'TEXT', 5)

    # === 柱配筋表 ===
    y_tbl = 185
    TC(msp, W/2, y_tbl, '柱配筋表 (16G101-1 平法表示)', 4.5, 'TITLE')
    y_tbl -= 12
    # 表头
    col_heads = [('楼层', 40), ('边柱 KZ-A/D', 160), ('中柱 KZ-B/C', 330), ('轴压比 (边/中)', 480)]
    for ch, cx_h in col_heads:
        T(msp, cx_h, y_tbl, ch, 3, 'TITLE')
    y_tbl -= 3
    msp.add_line((25, y_tbl-2), (570, y_tbl-2), dxfattribs={'layer': 'THIN'})

    # 表行
    for fl in [6, 5, 4, 3, 2, 1]:
        y_tbl -= 10
        edge_rb = COL_FLOORS_EDGE[fl]
        mid_rb = COL_FLOORS_MID[fl]
        ax_e, ax_m = COL_AXIAL[fl]
        color = 1 if fl == 1 else 7
        T(msp, 40,  y_tbl, f'{fl}F',  3, 'TEXT', color)
        T(msp, 160, y_tbl, f'{edge_rb}  {COL_STIRRUP}', 3, 'TEXT', color)
        T(msp, 330, y_tbl, f'{mid_rb}  {COL_STIRRUP}',  3, 'TEXT', color)
        T(msp, 480, y_tbl, f'{ax_e:.2f}/{ax_m:.2f}',     3, 'TEXT', color)

    # 注
    y_tbl -= 18
    T(msp, 30, y_tbl, '注：', 3, 'TEXT', 1)
    T(msp, 50, y_tbl, '1. 柱截面500x500 C30 HRB400 保护层厚度20mm', 2.5, 'TEXT', 8)
    y_tbl -= 7
    T(msp, 50, y_tbl, '2. 柱纵筋对称配置, 每角1根; 箍筋加密区: 柱端500mm, C8@100', 2.5, 'TEXT', 8)
    y_tbl -= 7
    T(msp, 50, y_tbl, '3. 轴压比限值0.85(三级抗震), 最大0.52 < 0.85 满足', 2.5, 'TEXT', 8)
    y_tbl -= 7
    T(msp, 50, y_tbl, '4. 数据来源：表8-7(轴压比) 表8-9~11(柱配筋) [5400版本]', 2.5, 'TEXT', 8)

    filepath = os.path.join(OUTPUT, '03-柱配筋图.dxf')
    doc.saveas(filepath)
    print(f'OK {filepath}')
    return filepath

# ============================================================
# 图纸04: 梁平面配筋图 (A2横 594×420)
# ============================================================

def draw_sheet_04():
    doc = create_doc()
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '04', '梁平面配筋图', '1:100')

    xA, xB, xC, xD = 40, 270, 330, 560
    y1, y2 = 345, 245

    # 轴线
    draw_axis_grid(msp, xA, xB, xC, xD, y1+20, y2-20, labels=True)
    for yy in [y1, y2]:
        msp.add_line((xA-15, yy), (xD+15, yy), dxfattribs={'layer': 'AXIS'})
    # 轴号
    for i, yy in enumerate([y1, y2]):
        msp.add_circle((xA-15, yy), 5, dxfattribs={'layer': 'TITLE'})
        TC(msp, xA-15, yy, str(i+1), 3, 'TITLE')

    TC(msp, 100, y1+30, '1F 梁配筋平面', 3.5, 'TEXT')
    TC(msp, 100, y2+30, '2F-6F 梁配筋平面 (同1F)', 3.5, 'TEXT')

    # 柱
    for yy in [y1, y2]:
        for cx in [xA, xB, xC, xD]:
            msp.add_lwpolyline([(cx-18,yy-25),(cx+18,yy-25),(cx+18,yy+25),(cx-18,yy+25),(cx-18,yy-25)],
                              dxfattribs={'layer': 'THIN'})

    # KL1 边跨梁 (双线)
    for yy in [y1, y2]:
        for sx, ex in [(xA, xB), (xC, xD)]:
            msp.add_line((sx, yy-4), (ex, yy-4), dxfattribs={'layer': 'BEAM'})
            msp.add_line((sx, yy+4), (ex, yy+4), dxfattribs={'layer': 'BEAM'})
        # KL2 中跨梁
        msp.add_line((xB, yy-3), (xC, yy-3), dxfattribs={'layer': 'BEAM'})
        msp.add_line((xB, yy+3), (xC, yy+3), dxfattribs={'layer': 'BEAM'})

    # KL1 平法标注
    for bm in [(xA+xB)/2, (xC+xD)/2]:
        TC(msp, bm, y1-18, f'KL1(1) {BEAM_EDGE_B}x{BEAM_EDGE_H}', 3.5, 'TEXT', 1)
        TC(msp, bm, y1-28, f'{KL1_TOP};{KL1_BOT}', 3.5, 'TEXT', 1)
        TC(msp, bm, y1-38, f'{KL1_STIRRUP}', 3.5, 'TEXT', 1)
        TC(msp, bm, y1-47, KL_GIRDER, 2.5, 'TEXT', 8)
        # 2F
        TC(msp, bm, y2-18, f'KL1(1) {BEAM_EDGE_B}x{BEAM_EDGE_H}', 3.5, 'TEXT', 1)
        TC(msp, bm, y2-28, f'{KL1_TOP};{KL1_BOT}', 3.5, 'TEXT', 1)

    # KL2 平法标注
    bm_mid = (xB+xC)/2
    TC(msp, bm_mid, y1-18, f'KL2(1) {BEAM_MID_B}x{BEAM_MID_H}', 3.5, 'TEXT', 5)
    TC(msp, bm_mid, y1-28, f'{KL2_TOP};{KL2_BOT}', 3.5, 'TEXT', 5)
    TC(msp, bm_mid, y1-38, f'{KL2_STIRRUP}', 3.5, 'TEXT', 5)
    TC(msp, bm_mid, y2-18, f'KL2(1) {BEAM_MID_B}x{BEAM_MID_H}', 3.5, 'TEXT', 5)
    TC(msp, bm_mid, y2-28, f'{KL2_TOP};{KL2_BOT}', 3.5, 'TEXT', 5)

    # === 梁截面内力信息 (下半) ===
    y_note = 185
    TC(msp, W/2, y_note, '1F 梁截面内力设计值 (5400版本)', 4.5, 'TITLE')
    y_note -= 15
    notes = [
        ('REBAR', 'KL1(边跨250×500):'),
        ('TEXT', f'  左端M={KL1_M_LEFT:.2f}    跨中M={KL1_M_MID:.2f}    右端M={KL1_M_RIGHT:.2f} kN-m'),
        ('TEXT', f'  剪力V={KL1_V:.2f}kN    箍筋C8@100/200(2)    加密区长度750mm'),
        ('REBAR', 'KL2(中跨250×400):'),
        ('TEXT', f'  左端M={KL2_M_LEFT:.2f}    跨中M={KL2_M_MID:.2f}    右端M={KL2_M_RIGHT:.2f} kN-m'),
        ('TEXT', f'  剪力V={KL2_V:.2f}kN    箍筋C8@100/200(2)    加密区长度600mm'),
    ]
    for layer, note in notes:
        T(msp, 35, y_note, note, 3, layer)
        y_note -= 10

    y_note -= 8
    T(msp, 35, y_note, '注：', 3, 'TEXT', 1)
    T(msp, 55, y_note, '1. 梁保护层厚度20mm, 最小配筋率max(0.2%, 45ft/fy%)', 2.5, 'TEXT', 8)
    y_note -= 8
    T(msp, 55, y_note, '2. 梁端弯矩调幅系数0.85(边跨) 梁端箍筋加密区长度: 1.5h=750(边跨) 600(中跨)', 2.5, 'TEXT', 8)
    y_note -= 8
    T(msp, 55, y_note, '3. 数据来源：表8-5(梁正截面) 表8-6(梁斜截面) [5400版本]', 2.5, 'TEXT', 8)

    filepath = os.path.join(OUTPUT, '04-梁配筋图.dxf')
    doc.saveas(filepath)
    print(f'OK {filepath}')
    return filepath

# ============================================================
# 图纸05: 板平面配筋图 (A2横 594×420)
# ============================================================

def draw_sheet_05():
    doc = create_doc()
    msp = doc.modelspace()
    W, H = 594, 420
    make_title_block(msp, W, H, '05', '板平面配筋图 (标准层)', '1:100')

    xA, xB, xC, xD = 40, 270, 330, 560
    rows_y = [345, 250, 155]

    # 轴线
    draw_axis_grid(msp, xA, xB, xC, xD, rows_y[0]+20, rows_y[-1]-40, labels=True)
    for yy in rows_y:
        msp.add_line((xA-15, yy), (xD+15, yy), dxfattribs={'layer': 'AXIS'})

    # 板分隔
    for row_y in rows_y:
        # A板 (AB跨 5.4×3.45)
        msp.add_lwpolyline([
            (xA+3,row_y-48),(xB-3,row_y-48),(xB-3,row_y+48),(xA+3,row_y+48),(xA+3,row_y-48)
        ], dxfattribs={'layer': 'SLAB'})
        TC(msp, (xA+xB)/2, row_y+10, 'A 板', 4.5, 'TEXT')
        TC(msp, (xA+xB)/2, row_y, '5.4x3.45 m', 3.5, 'TEXT')
        TC(msp, (xA+xB)/2, row_y-10, f'λ={A_LAM}', 3, 'TEXT', 8)
        TC(msp, (xA+xB)/2, row_y-20, f'{A_REBAR} 双向', 3.5, 'REBAR', 1)

        # B板 (BC跨 6.9×2.4)
        msp.add_lwpolyline([
            (xB+3,row_y-38),(xC-3,row_y-38),(xC-3,row_y+38),(xB+3,row_y+38),(xB+3,row_y-38)
        ], dxfattribs={'layer': 'SLAB', 'color': 5})
        TC(msp, (xB+xC)/2, row_y+10, 'B 板', 4.5, 'TEXT')
        TC(msp, (xB+xC)/2, row_y, '6.9x2.4 m', 3.5, 'TEXT')
        TC(msp, (xB+xC)/2, row_y-10, 'λ=2.88', 3, 'TEXT', 8)
        TC(msp, (xB+xC)/2, row_y-20, f'{A_REBAR} 双向', 3.5, 'REBAR', 1)

        # A板 (CD跨)
        msp.add_lwpolyline([
            (xC+3,row_y-48),(xD-3,row_y-48),(xD-3,row_y+48),(xC+3,row_y+48),(xC+3,row_y-48)
        ], dxfattribs={'layer': 'SLAB'})
        TC(msp, (xC+xD)/2, row_y+10, 'A 板', 4.5, 'TEXT')
        TC(msp, (xC+xD)/2, row_y, '5.4x3.45 m', 3.5, 'TEXT')
        TC(msp, (xC+xD)/2, row_y-10, f'λ={A_LAM}', 3, 'TEXT', 8)
        TC(msp, (xC+xD)/2, row_y-20, f'{A_REBAR} 双向', 3.5, 'REBAR', 1)

    # 板配筋信息
    y_info = 80
    info_lines = [
        ('TITLE', f'A板弯矩: 短跨支座={A_M_SUP_S:.2f} 跨中={A_M_MID_S:.2f}  长跨支座={A_M_SUP_L:.2f} 跨中={A_M_MID_L:.2f} kN-m/m'),
        ('TEXT', f'A板配筋: {A_REBAR}双向 (As=251mm²)  支座附加筋C8@200  λ={A_LAM} (原4800 λ=1.39)'),
        ('TEXT', 'B板: λ=2.88  按单向板计算  C8@200双向  支座附加筋C8@200'),
        ('TEXT', '板厚: 120mm  C30混凝土  HRB400钢筋  保护层厚度15mm'),
        ('TEXT', '数据来源: 表9-3(弯矩) 表9-4(配筋) [5400版本]  弹性理论计算方法'),
    ]
    for layer, line in info_lines:
        T(msp, 30, y_info, line, 3, layer)
        y_info -= 9

    filepath = os.path.join(OUTPUT, '05-板配筋图.dxf')
    doc.saveas(filepath)
    print(f'OK {filepath}')
    return filepath

# ============================================================
# 图纸06: 楼梯详图 (A3竖 297×420)
# ============================================================

def draw_sheet_06():
    doc = create_doc()
    msp = doc.modelspace()
    W, H = 297, 420  # A3竖
    make_title_block(msp, W, H, '06', '楼梯详图', '1:50')

    # === 上半: 楼梯平面图 ===
    y_plan = 390
    TC(msp, W/2, y_plan, '楼梯标准层平面图 (中间层)', 5, 'TITLE')
    y_plan -= 12

    sl, sw = 80, 110  # 梯段绘图尺寸 (对应2240mm水平投影)
    plat_w = 55  # 平台绘图尺寸 (对应1600)

    # 梯段1 (上)
    x0 = 20
    msp.add_lwpolyline([
        (x0,y_plan),(x0+sl,y_plan),(x0+sl,y_plan-sw),(x0,y_plan-sw),(x0,y_plan)
    ], dxfattribs={'layer': 'HATCH'})
    # 踏步线
    for i in range(1, 9):
        y_s = y_plan - i * (sw/8)
        msp.add_line((x0, y_s), (x0+sl, y_s), dxfattribs={'layer': 'THIN'})
    TC(msp, x0+sl/2, y_plan-sw/2, '上 ↑', 4, 'TEXT')

    # 梯梁
    msp.add_line((x0-2, y_plan+3), (x0+sl+2, y_plan+3), dxfattribs={'layer': 'BEAM', 'color': 1})
    msp.add_line((x0-2, y_plan-sw-3), (x0+sl+2, y_plan-sw-3), dxfattribs={'layer': 'BEAM', 'color': 1})
    T(msp, x0-10, y_plan+1, 'TL1', 2.5, 'TEXT', 1)
    T(msp, x0-10, y_plan-sw-5, 'TL2', 2.5, 'TEXT', 1)

    # 休息平台
    msp.add_lwpolyline([
        (x0+sl,y_plan),(x0+sl+plat_w,y_plan),(x0+sl+plat_w,y_plan-sw),(x0+sl,y_plan-sw),(x0+sl,y_plan)
    ], dxfattribs={'layer': 'SLAB'})
    TC(msp, x0+sl+plat_w/2, y_plan-sw/2, '休息平台\n1600×3000', 3, 'TEXT')

    # 梯段2 (下)
    x2 = x0 + sl + plat_w
    sl2 = 70
    msp.add_lwpolyline([
        (x2,y_plan),(x2+sl2,y_plan),(x2+sl2,y_plan-sw),(x2,y_plan-sw),(x2,y_plan)
    ], dxfattribs={'layer': 'HATCH'})
    for i in range(1, 9):
        y_s = y_plan - i * (sw/8)
        msp.add_line((x2, y_s), (x2+sl2, y_s), dxfattribs={'layer': 'THIN'})
    TC(msp, x2+sl2/2, y_plan-sw/2, '下 ↓', 4, 'TEXT')
    # 梯梁
    msp.add_line((x2-2, y_plan+3), (x2+sl2+2, y_plan+3), dxfattribs={'layer': 'BEAM', 'color': 1})
    msp.add_line((x2-2, y_plan-sw-3), (x2+sl2+2, y_plan-sw-3), dxfattribs={'layer': 'BEAM', 'color': 1})
    T(msp, x2+sl2+5, y_plan+1, 'TL3', 2.5, 'TEXT', 1)

    # 尺寸标注
    y_dim = y_plan - sw - 10
    msp.add_line((x0, y_dim), (x0+sl, y_dim), dxfattribs={'layer': 'DIM'})
    TC(msp, x0+sl/2, y_dim-5, f'{STAIR_HORIZ}(水平)', 2.5, 'DIM')
    msp.add_line((x0+sl, y_dim), (x0+sl+plat_w, y_dim), dxfattribs={'layer': 'DIM'})
    TC(msp, x0+sl+plat_w/2, y_dim-5, f'{STAIR_PLAT_W}', 2.5, 'DIM')

    # === 下半: 楼梯剖面示意 ===
    y_sect = y_dim - 25
    TC(msp, W/2, y_sect, '楼梯剖面示意', 4.5, 'TITLE')
    y_sect -= 10

    # 简化剖面
    sx, sh = 30, 80  # 剖面区域
    # 踏步锯齿
    step_h, step_g = 7, 8  # 绘图尺寸 (对应167,280比例)
    for i in range(8):
        sx_i = sx + i * step_g
        sy_i = y_sect + i * step_h
        msp.add_line((sx_i, sy_i), (sx_i+step_g, sy_i), dxfattribs={'layer': 'THIN'})
        msp.add_line((sx_i+step_g, sy_i), (sx_i+step_g, sy_i+step_h), dxfattribs={'layer': 'THIN'})
    # 平台
    sy_top = y_sect + 8*step_h
    msp.add_line((sx+8*step_g, sy_top), (sx+8*step_g+20, sy_top), dxfattribs={'layer': 'SLAB'})
    # 梯段底板
    msp.add_line((sx, y_sect), (sx+8*step_g+20, sy_top), dxfattribs={'layer': 'HATCH'})
    # 标注
    T(msp, sx+70, y_sect+20, f'踏步: {STAIR_RISE}x{STAIR_GOING}mm', 2.5, 'TEXT')
    T(msp, sx+70, y_sect+13, f'梯段板厚: {STAIR_H}mm', 2.5, 'TEXT')
    T(msp, sx+70, y_sect+6, f'斜向跨度: {STAIR_SLOPE}mm', 2.5, 'TEXT')
    T(msp, sx+70, y_sect-1, f'水平投影: {STAIR_HORIZ}mm (8步)', 2.5, 'TEXT')

    # === 下半: 楼梯参数和配筋 ===
    y_info = y_sect - 15
    params = [
        ('TITLE', '楼梯设计参数 (板式楼梯, 中间层, 层高3000mm)'),
        ('TEXT',  f'踏步尺寸: {STAIR_RISE}×{STAIR_GOING}mm    梯段板厚: {STAIR_H}mm'),
        ('TEXT',  f'水平跨度: {STAIR_HORIZ}mm (8步)    斜向计算跨度: {STAIR_SLOPE}mm'),
        ('TEXT',  f'平台板厚: 100mm    平台净跨: {STAIR_PLAT_W}mm    平台宽度: {STAIR_PLAT_L}mm'),
        ('TEXT',  f'梯梁截面: {STAIR_BEAM_B}×{STAIR_BEAM_H}mm    梯梁跨度: {STAIR_PLAT_L}mm'),
        ('TEXT',  '活载: 3.5kN/m² (楼梯间)    C30混凝土, HRB400钢筋'),
        ('TITLE', '配筋表:'),
        ('REBAR', '梯段板: C8@200 (跨中受力筋)    分布筋: C8@250'),
        ('REBAR', '平台板: C8@200 双向 (与楼板配筋相同)'),
        ('REBAR', f'梯梁: 2C16(底部纵筋)+2C16(顶部纵筋)    箍筋: C8@200    腰筋: G2C12'),
        ('TEXT',  '梯梁箍筋加密区: 梁端600mm C8@100    保护层厚度: 梯段板15mm, 梯梁20mm'),
        ('TEXT',  '数据来源: 第10章 楼梯设计 [5400版本 楼梯不受横向跨度影响]'),
    ]
    for layer, line in params:
        T(msp, 20, y_info, line, 2.8, layer)
        y_info -= 7

    filepath = os.path.join(OUTPUT, '06-楼梯详图.dxf')
    doc.saveas(filepath)
    print(f'OK {filepath}')
    return filepath

# ============================================================
# 主函数
# ============================================================

def main():
    print('='*60)
    print('生成 结构施工图 DXF 文件 (5400跨度版本)')
    print('河北省邢台市天一苑3栋  6层RC框架结构')
    print('='*60)
    files = []
    files.append(draw_sheet_01())
    files.append(draw_sheet_02())
    files.append(draw_sheet_03())
    files.append(draw_sheet_04())
    files.append(draw_sheet_05())
    files.append(draw_sheet_06())
    print('='*60)
    print(f'Done! {len(files)} DXF in {OUTPUT}/')
    for f in files:
        print(f'  {os.path.basename(f)}')

if __name__ == '__main__':
    main()
