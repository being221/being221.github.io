#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
4800→5400 计算书修正引擎
只修改AB/CD轴跨度从4800→5400，追踪所有连锁反应
"""

import sys
import copy
import json
sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# 基本参数
# ============================================================
L1_OLD = 4.8   # 原边跨跨度(m)
L1_NEW = 5.4   # 新边跨跨度(m)
L2 = 2.4       # 中跨跨度(不变)
L_long = 6.9   # 纵向跨度(不变)
short_span = 3.45  # 双向板短边半跨

E = 30e6       # C30弹模(kN/m²)
fc = 14.3e3    # C30抗压(kN/m²)
ft = 1.43e3    # C30抗拉(kN/m²)
fy = 360e3     # HRB400(kN/m²)
fyv = 360e3

# 柱
col_b = 0.5; col_h = 0.5  # 500×500

# 梁截面
beam_edge_b = 0.25; beam_edge_h = 0.5   # 250×500 边跨
beam_mid_b = 0.25; beam_mid_h = 0.4     # 250×400 中跨

# 层高
h1 = 4.0   # 首层
h_std = 3.0  # 标准层/顶层

# 截面惯性矩
I0_edge = beam_edge_b * beam_edge_h**3 / 12  # 2.604e-3 m⁴
I0_mid = beam_mid_b * beam_mid_h**3 / 12     # 1.333e-3 m⁴
I_edge_frame = 1.5 * I0_edge   # 边榀 3.906e-3
I_mid_frame = 2.0 * I0_edge    # 中间榀 5.208e-3
I_mid_beam_edge = 1.5 * I0_mid # 边榀中跨 2.000e-3
I_mid_beam_mid = 2.0 * I0_mid  # 中间榀中跨 2.667e-3

print("=" * 80)
print("第2章: 梁柱线刚度及D值重算")
print("=" * 80)

# 柱惯性矩
Ic = col_b * col_h**3 / 12  # 5.208e-3 m⁴
ic_top = E * Ic / h_std     # 52083 kN·m
ic_1st = E * Ic / h1        # 39063 kN·m

print(f"柱线刚度: 顶层/标准层={ic_top:.0f}, 首层={ic_1st:.0f}")

# 梁线刚度 (表2-2)
i_edge_edge = E * I_edge_frame / L1_NEW    # 边榀边跨
i_edge_mid = E * I_mid_beam_edge / L2      # 边榀中跨 (不变)
i_mid_edge = E * I_mid_frame / L1_NEW      # 中间榀边跨
i_mid_mid = E * I_mid_beam_mid / L2         # 中间榀中跨 (不变)

print(f"\n表2-2 框架梁线刚度计算:")
print(f"  边榀边跨: I={I_edge_frame*1e3:.3f}×10⁻³, i={i_edge_edge:.0f} kN·m (原24414)")
print(f"  边榀中跨: I={I_mid_beam_edge*1e3:.3f}×10⁻³, i={i_edge_mid:.0f} kN·m (不变)")
print(f"  中间榀边跨: I={I_mid_frame*1e3:.3f}×10⁻³, i={i_mid_edge:.0f} kN·m (原32552)")
print(f"  中间榀中跨: I={I_mid_beam_mid*1e3:.3f}×10⁻³, i={i_mid_mid:.0f} kN·m (不变)")

# D值计算 (表2-4, 2-5)
def calc_K_alpha_D(ic, h, ib_left, ib_right, is_first=False):
    """计算K, α, D值"""
    K = (ib_left + ib_right) / ic
    if is_first:
        alpha = (0.5 + K) / (2 + K)
    else:
        alpha = K / (2 + K)
    D = alpha * 12 * ic / h**2
    return K, alpha, D

# 各框架各柱的D值
cases = [
    # (名称, ic, h, ib_left, ib_right, is_first)
    ("边榀边柱-顶/标", ic_top, h_std, i_edge_edge, 0, False),
    ("边榀边柱-首层", ic_1st, h1, i_edge_edge, 0, True),
    ("边榀中柱-顶/标", ic_top, h_std, i_edge_edge, i_edge_mid, False),
    ("边榀中柱-首层", ic_1st, h1, i_edge_edge, i_edge_mid, True),
    ("中间榀边柱-顶/标", ic_top, h_std, i_mid_edge, 0, False),
    ("中间榀边柱-首层", ic_1st, h1, i_mid_edge, 0, True),
    ("中间榀中柱-顶/标", ic_top, h_std, i_mid_edge, i_mid_mid, False),
    ("中间榀中柱-首层", ic_1st, h1, i_mid_edge, i_mid_mid, True),
]

print(f"\n表2-4/2-5 D值计算:")
for name, ic, h, ibl, ibr, isf in cases:
    K, alpha, D = calc_K_alpha_D(ic, h, ibl, ibr, isf)
    print(f"  {name}: K={K:.2f}, α={alpha:.2f}, D={D:.0f}")

# 榀刚度汇总
D_edge_top = 2*calc_K_alpha_D(ic_top, h_std, i_edge_edge, 0, False)[2] + \
             2*calc_K_alpha_D(ic_top, h_std, i_edge_edge, i_edge_mid, False)[2]
D_edge_1st = 2*calc_K_alpha_D(ic_1st, h1, i_edge_edge, 0, True)[2] + \
             2*calc_K_alpha_D(ic_1st, h1, i_edge_edge, i_edge_mid, True)[2]
D_mid_top = 2*calc_K_alpha_D(ic_top, h_std, i_mid_edge, 0, False)[2] + \
            2*calc_K_alpha_D(ic_top, h_std, i_mid_edge, i_mid_mid, False)[2]
D_mid_1st = 2*calc_K_alpha_D(ic_1st, h1, i_mid_edge, 0, True)[2] + \
            2*calc_K_alpha_D(ic_1st, h1, i_mid_edge, i_mid_mid, True)[2]

print(f"\n榀刚度汇总 (原值):")
print(f"  边榀顶/标: {D_edge_top:.0f} (原70832)")
print(f"  边榀首层: {D_edge_1st:.0f} (原56838)")
print(f"  中间榀顶/标: {D_mid_top:.0f} (原87500)")
print(f"  中间榀首层: {D_mid_1st:.0f} (原62110)")

# ============================================================
# 第3章: 竖向荷载重算
# ============================================================
print(f"\n{'='*80}")
print("第3章: 竖向荷载重算")
print("="*80)

# 梯形荷载等效系数
alpha_old = 0.5 * short_span / L1_OLD  # 0.359
alpha_new = 0.5 * short_span / L1_NEW  # 0.319
factor_old = 1 - 2*alpha_old**2 + alpha_old**3  # 0.79
factor_new = 1 - 2*alpha_new**2 + alpha_new**3  # 0.83

print(f"梯形荷载等效系数: α_old={alpha_old:.3f}, factor_old={factor_old:.2f}")
print(f"                    α_new={alpha_new:.3f}, factor_new={factor_new:.2f}")

# 恒载线荷载
g_roof = 4.96    # 屋面恒载 kN/m²
g_floor = 4.2    # 楼面恒载 kN/m²
g_beam_edge = 2.57  # 边跨梁自重+抹灰
g_beam_mid = 1.89   # 中跨梁自重+抹灰
g_wall_edge = 6.2   # 边跨内墙自重 (层高3-0.5)×2.48
g_wall_mid = 6.45   # 中跨内墙自重 (层高3-0.4)×2.48

# 板导荷线荷载
g_roof_edge_old = 3.45 * g_roof  # 17.11 kN/m (梯形荷载峰值)
g_roof_edge_new = 3.45 * g_roof  # 不变
g_floor_edge_old = 3.45 * g_floor # 14.49 kN/m
g_floor_edge_new = 3.45 * g_floor # 不变

# 等效均布 (表3-2需要更新的是表6-4中的等效均布)
# 表3-2本身的线荷载不变量——它们是梯形/三角形峰值

# 柱集中力 (表3-3, 3-5)
# 边柱受荷面积
A_edge_old = L1_OLD/2 * L_long/2 * 2  # 4.8/2 × (6.9/2+6.9/2)
A_edge_new = L1_NEW/2 * L_long/2 * 2
A_mid_old = (L1_OLD+L2)/2 * L_long/2 * 2
A_mid_new = (L1_NEW+L2)/2 * L_long/2 * 2

print(f"\n表2-1 柱受荷面积:")
print(f"  边柱: {A_edge_old:.2f}→{A_edge_new:.2f} m²")
print(f"  中柱: {A_mid_old:.2f}→{A_mid_new:.2f} m²")

# 柱集中力导算
# 楼面层 边柱
# 次梁自重: 1.54×L1/2
g_sec_beam_old = 1.54 * L1_OLD / 2
g_sec_beam_new = 1.54 * L1_NEW / 2
print(f"  次梁自重传边柱: {g_sec_beam_old:.2f}→{g_sec_beam_new:.2f} kN")

# 楼面导荷 边柱: g_floor × (3.45/2×3.45/2 + 3.45×L1/2)
g_floor_edge_conc_old = g_floor * (short_span**2/4 + short_span * L1_OLD/2)
g_floor_edge_conc_new = g_floor * (short_span**2/4 + short_span * L1_NEW/2)
print(f"  楼面导荷边柱: {g_floor_edge_conc_old:.2f}→{g_floor_edge_conc_new:.2f} kN")

# 楼面导荷 中柱
g_floor_mid_conc_old = g_floor * ((short_span**2/4 + short_span*L1_OLD/2) + (short_span*L2 - 0.5*L2*0.5*L2))
g_floor_mid_conc_new = g_floor * ((short_span**2/4 + short_span*L1_NEW/2) + (short_span*L2 - 0.5*L2*0.5*L2))
print(f"  楼面导荷中柱: {g_floor_mid_conc_old:.2f}→{g_floor_mid_conc_new:.2f} kN")

# 屋面导荷 边柱
g_roof_edge_conc_old = g_roof * (short_span**2/4 + short_span * L1_OLD/2)
g_roof_edge_conc_new = g_roof * (short_span**2/4 + short_span * L1_NEW/2)
print(f"  屋面导荷边柱: {g_roof_edge_conc_old:.2f}→{g_roof_edge_conc_new:.2f} kN")

# 屋面导荷 中柱
g_roof_mid_conc_old = g_roof * ((short_span**2/4 + short_span*L1_OLD/2) + (short_span*L2 - 0.5*L2*0.5*L2))
g_roof_mid_conc_new = g_roof * ((short_span**2/4 + short_span*L1_NEW/2) + (short_span*L2 - 0.5*L2*0.5*L2))
print(f"  屋面导荷中柱: {g_roof_mid_conc_old:.2f}→{g_roof_mid_conc_new:.2f} kN")

# ============================================================
# 第4章: 地震内力重算
# ============================================================
print(f"\n{'='*80}")
print("第4章: 地震内力重算")
print("="*80)

# 重力荷载代表值 - 屋面层横向框架梁
# 14×(L1-0.5-0.5+0.12+0.12)×2.57 + 7×(2.4-0.12-0.12)×1.89
n_spans = 7  # 7跨
n_frames = 2  # 2榀(每榀2根梁)

# 横向框架梁自重
beam_trans_roof_old = 14 * (L1_OLD - 0.5 - 0.5 + 0.12 + 0.12) * 2.57 + 7 * (2.4 - 0.12 - 0.12) * 1.89
beam_trans_roof_new = 14 * (L1_NEW - 0.5 - 0.5 + 0.12 + 0.12) * 2.57 + 7 * (2.4 - 0.12 - 0.12) * 1.89
print(f"屋面横向框架梁自重: {beam_trans_roof_old:.1f}→{beam_trans_roof_new:.1f} kN")

# 总面积/楼面板面积变化
# 边跨面积增加: 14跨×(L1_NEW-L1_OLD)×(6.9)
area_increase = 14 * (L1_NEW - L1_OLD) * L_long
print(f"楼面总面积增加: {area_increase:.1f} m²")

# 整体D值变化
# 结构总D值(6榀边榀+6榀中间榀，其中...)
# 实际结构是：7个横向轴线，2个边榀+5个中间榀
D_total_top_old = 2*70832 + 5*87500  # 原值
D_total_top_new = 2*D_edge_top + 5*D_mid_top
D_total_1st_old = 2*56838 + 5*62110
D_total_1st_new = 2*D_edge_1st + 5*D_mid_1st

print(f"总D值顶/标: {D_total_top_old:.0f}→{D_total_top_new:.0f}")
print(f"总D值首层: {D_total_1st_old:.0f}→{D_total_1st_new:.0f}")

# 自振周期 (顶点位移法)
# T1 = 1.7×ψT×√(Δu)
# Δu会因刚度减小而增大
# 粗略估算：T_new ≈ T_old × √(D_old/D_new)
T_old = 0.56
stiffness_ratio = D_total_top_old / D_total_top_new
T_new = T_old * (stiffness_ratio)**0.5
print(f"自振周期: {T_old:.2f}→{T_new:.2f}s (估算)")

# ============================================================
# 第6章: 竖向荷载下内力
# ============================================================
print(f"\n{'='*80}")
print("第6章: 竖向荷载下内力重算")
print("="*80)

# 等效均布荷载 (表6-3, 6-4)
# 屋面层边跨: g_beam_edge + factor × g_roof_edge
q_eq_roof_edge_old = g_beam_edge + factor_old * g_roof_edge_old
q_eq_roof_edge_new = g_beam_edge + factor_new * g_roof_edge_new
print(f"屋面边跨等效均布: {q_eq_roof_edge_old:.2f}→{q_eq_roof_edge_new:.2f} kN/m")

# 楼面层边跨: g_beam_edge + g_wall_edge + factor × g_floor_edge
q_eq_floor_edge_old = g_beam_edge + g_wall_edge + factor_old * g_floor_edge_old
q_eq_floor_edge_new = g_beam_edge + g_wall_edge + factor_new * g_floor_edge_new
print(f"楼面边跨等效均布: {q_eq_floor_edge_old:.2f}→{q_eq_floor_edge_new:.2f} kN/m")

# 固端弯矩: M = ql²/12
M_fixed_roof_edge_old = q_eq_roof_edge_old * L1_OLD**2 / 12
M_fixed_roof_edge_new = q_eq_roof_edge_new * L1_NEW**2 / 12
print(f"屋面边跨固端弯矩: {M_fixed_roof_edge_old:.2f}→{M_fixed_roof_edge_new:.2f} kN·m")

M_fixed_floor_edge_old = q_eq_floor_edge_old * L1_OLD**2 / 12
M_fixed_floor_edge_new = q_eq_floor_edge_new * L1_NEW**2 / 12
print(f"楼面边跨固端弯矩: {M_fixed_floor_edge_old:.2f}→{M_fixed_floor_edge_new:.2f} kN·m")

# 活载等效均布
q_live_roof = 0.5  # 屋面活载
q_live_floor = 2.0  # 楼面活载
q_live_roof_edge_old = factor_old * (short_span * q_live_roof)
q_live_roof_edge_new = factor_new * (short_span * q_live_roof)
q_live_floor_edge_old = factor_old * (short_span * q_live_floor)
q_live_floor_edge_new = factor_new * (short_span * q_live_floor)

print(f"活载屋面边跨等效: {q_live_roof_edge_old:.2f}→{q_live_roof_edge_new:.2f} kN/m")
print(f"活载楼面边跨等效: {q_live_floor_edge_old:.2f}→{q_live_floor_edge_new:.2f} kN/m")

M_live_roof_edge_old = q_live_roof_edge_old * L1_OLD**2 / 12
M_live_roof_edge_new = q_live_roof_edge_new * L1_NEW**2 / 12
print(f"活载屋面边跨固端弯矩: {M_live_roof_edge_old:.2f}→{M_live_roof_edge_new:.2f} kN·m")

M_live_floor_edge_old = q_live_floor_edge_old * L1_OLD**2 / 12
M_live_floor_edge_new = q_live_floor_edge_new * L1_NEW**2 / 12
print(f"活载楼面边跨固端弯矩: {M_live_floor_edge_old:.2f}→{M_live_floor_edge_new:.2f} kN·m")

# ============================================================
# 弯矩分配系数变化
# ============================================================
print(f"\n弯矩分配系数变化:")

# 顶层边柱节点: ib/(ib+ic)
# 边榀边柱: i_edge_edge/(i_edge_edge+ic_top)
mu_edge_top_old = 24414/(24414+52083)
mu_edge_top_new = i_edge_edge/(i_edge_edge+ic_top)
print(f"  边榀顶层边节点: {mu_edge_top_old:.2f}→{mu_edge_top_new:.2f}")

# 中间榀边柱
mu_mid_top_old = 32552/(32552+52083)
mu_mid_top_new = i_mid_edge/(i_mid_edge+ic_top)
print(f"  中间榀顶层边节点: {mu_mid_top_old:.2f}→{mu_mid_top_new:.2f}")

# 中柱节点 (两边梁)
mu_mid_col_top_old = (24414+25000)/(24414+25000+52083)
mu_mid_col_top_new = (i_edge_edge+i_edge_mid)/(i_edge_edge+i_edge_mid+ic_top)
print(f"  边榀顶层中节点(左梁): {mu_mid_col_top_old:.2f}→{mu_mid_col_top_new:.2f}")

# 标准层边节点 (上下柱)
mu_std_edge_old = 24414/(24414+2*52083)
mu_std_edge_new = i_edge_edge/(i_edge_edge+2*ic_top)
print(f"  边榀标准层边节点(上柱): {mu_std_edge_old:.2f}→{mu_std_edge_new:.2f}")

print(f"\n所有分配系数的变化将导致表6-5和表6-12弯矩二次分配全部重算")

# ============================================================
# 汇总所有关键参数变化
# ============================================================
print(f"\n{'='*80}")
print("关键参数变化汇总")
print("="*80)

summary = {
    "梁线刚度": {
        "边榀边跨": f"24414→{i_edge_edge:.0f}",
        "中间榀边跨": f"32552→{i_mid_edge:.0f}",
    },
    "梯形荷载系数α": f"{alpha_old:.3f}→{alpha_new:.3f}",
    "等效系数": f"{factor_old:.2f}→{factor_new:.2f}",
    "边柱受荷面积": f"{A_edge_old:.2f}→{A_edge_new:.2f} m²",
    "中柱受荷面积": f"{A_mid_old:.2f}→{A_mid_new:.2f} m²",
}

for k, v in summary.items():
    print(f"  {k}: {v}")

print(f"\n脚本计算完成。所有数值已就绪，接下来修改docx文档。")
