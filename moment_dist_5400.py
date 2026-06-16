#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整的5400跨度计算书修改引擎
执行弯矩二次分配完整重算 + docx修改
"""

import sys
import copy
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Pt, RGBColor
from datetime import datetime
import math

# ============================================================
# 全局参数
# ============================================================
L1, L1_OLD = 5.4, 4.8  # 边跨跨度
L2 = 2.4               # 中跨跨度
L_long = 6.9           # 纵向跨度
ss = 3.45              # 双向板短半跨

E = 30e6   # C30 kN/m²
fc = 14.3  # N/mm²
ft = 1.43  # N/mm²
fy = 360   # N/mm²

# 截面惯性矩
def I_rect(b, h):
    return b * h**3 / 12

I0_edge = I_rect(0.25, 0.5)   # 2.604e-3
I0_mid = I_rect(0.25, 0.4)    # 1.333e-3

# 梁线刚度 (考虑楼板影响系数)
i_beam = {
    'edge_edge': E * 1.5 * I0_edge / L1,   # 边榀边跨 21701
    'edge_mid': E * 1.5 * I0_mid / L2,     # 边榀中跨 25000
    'mid_edge': E * 2.0 * I0_edge / L1,    # 中间榀边跨 28935
    'mid_mid': E * 2.0 * I0_mid / L2,      # 中间榀中跨 33333
}
i_beam_old = {
    'edge_edge': E * 1.5 * I0_edge / L1_OLD,
    'edge_mid': E * 1.5 * I0_mid / L2,
    'mid_edge': E * 2.0 * I0_edge / L1_OLD,
    'mid_mid': E * 2.0 * I0_mid / L2,
}

# 柱线刚度
ic_top = E * I_rect(0.5, 0.5) / 3.0   # 52083
ic_1st = E * I_rect(0.5, 0.5) / 4.0   # 39062

# 荷载
g_roof = 4.96; g_floor = 4.2
q_roof = 0.5; q_floor = 2.0
g_beam_edge = 2.57; g_beam_mid = 1.89
g_wall_edge = 6.2; g_wall_mid = 6.45

# 等效系数
alpha_new = 0.5*ss/L1; alpha_old = 0.5*ss/L1_OLD
f_trap_new = 1 - 2*alpha_new**2 + alpha_new**3  # 0.829
f_trap_old = 1 - 2*alpha_old**2 + alpha_old**3  # 0.789
f_tri = 0.625  # 三角形等效

# 线荷载
g_trap_roof = ss * g_roof  # 梯形峰值
g_trap_floor = ss * g_floor
g_tri_roof = L2/2 * g_roof
g_tri_floor = L2/2 * g_floor
q_trap_roof = ss * q_roof
q_trap_floor = ss * q_floor
q_tri_roof = L2/2 * q_roof
q_tri_floor = L2/2 * q_floor

# 等效均布荷载
qeq_dead_roof_edge = g_beam_edge + f_trap_new * g_trap_roof
qeq_dead_floor_edge = g_beam_edge + g_wall_edge + f_trap_new * g_trap_floor
qeq_dead_roof_mid = g_beam_mid + f_tri * 2 * g_tri_roof
qeq_dead_floor_mid = g_beam_mid + g_wall_mid + f_tri * 2 * g_tri_floor

qeq_live_roof_edge = f_trap_new * q_trap_roof
qeq_live_floor_edge = f_trap_new * q_trap_floor
qeq_live_roof_mid = f_tri * 2 * q_tri_roof
qeq_live_floor_mid = f_tri * 2 * q_tri_floor

print("等效均布荷载:")
print(f"  恒载屋面边跨: {qeq_dead_roof_edge:.2f} (原16.09)")
print(f"  恒载楼面边跨: {qeq_dead_floor_edge:.2f} (原20.22)")
print(f"  恒载屋面中跨: {qeq_dead_roof_mid:.2f} (原9.33)")
print(f"  恒载楼面中跨: {qeq_dead_floor_mid:.2f} (原14.64)")
print(f"  活载屋面边跨: {qeq_live_roof_edge:.2f} (原1.36)")
print(f"  活载楼面边跨: {qeq_live_floor_edge:.2f} (原5.44)")
print(f"  活载屋面中跨: {qeq_live_roof_mid:.2f} (原0.75)")
print(f"  活载楼面中跨: {qeq_live_floor_mid:.2f} (原3.00)")

# ============================================================
# 弯矩二次分配
# ============================================================
def fem_uniform(q, L):
    """均布荷载固端弯矩"""
    return q * L**2 / 12

def moment_distribution(frames_config, n_cycles=3):
    """
    执行弯矩二次分配
    frames_config: [(name, ic_upper, ic_lower, ib_left, ib_right, L_left, L_right, q_left, q_right, fem_left, fem_right), ...]
    每一行是一个节点(柱)
    """
    n_joints = len(frames_config)

    # 初始化
    moments = []  # moments[joint_idx][beam_idx] = moment
    dist_factors = []

    # 为每个joint收集连接的member和分配系数
    for cfg in frames_config:
        name, ic_u, ic_l, ib_l, ib_r, Ll, Lr, ql, qr, fem_l, fem_r = cfg
        total_i = 0
        members = []

        if ic_u > 0:
            total_i += ic_u
            members.append(('col_upper', ic_u))
        if ic_l > 0:
            total_i += ic_l
            members.append(('col_lower', ic_l))
        if ib_l > 0:
            total_i += ib_l
            members.append(('beam_left', ib_l))
        if ib_r > 0:
            total_i += ib_r
            members.append(('beam_right', ib_r))

        dfs = [(name, i/total_i) for name, i in members]
        dist_factors.append(dfs)

        # 初始弯矩
        m = {}
        if fem_l != 0:
            m['beam_left'] = fem_l
        if fem_r != 0:
            m['beam_right'] = -fem_r  # 右端正负相反
        moments.append(m)

    # 二次分配
    for cycle in range(n_cycles):
        # 分配
        for j in range(n_joints):
            # 计算不平衡弯矩
            unbal = sum(moments[j].values())
            if abs(unbal) < 0.01:
                continue

            # 分配
            for memb_name, df in dist_factors[j]:
                if memb_name.startswith('col'):
                    moments[j][memb_name] = moments[j].get(memb_name, 0) - df * unbal
                elif memb_name.startswith('beam'):
                    moments[j][memb_name] = moments[j].get(memb_name, 0) - df * unbal

        # 传递 (每根梁传递一半到远端)
        # 简化: 对称结构, 直接处理
        # 边跨梁: joint j的beam_right对应joint j+1的beam_left
        # 传递系数0.5
        carry = [{} for _ in range(n_joints)]
        for j in range(n_joints):
            for memb_name, df in dist_factors[j]:
                if memb_name == 'beam_right' and j+1 < n_joints:
                    mom = moments[j].get('beam_right', 0)
                    carry[j+1]['beam_left_carry'] = carry[j+1].get('beam_left_carry', 0) + 0.5 * mom
                if memb_name == 'beam_left' and j-1 >= 0:
                    mom = moments[j].get('beam_left', 0)
                    carry[j-1]['beam_right_carry'] = carry[j-1].get('beam_right_carry', 0) + 0.5 * mom

        for j in range(n_joints):
            for k, v in carry[j].items():
                base = k.replace('_carry', '')
                moments[j][base] = moments[j].get(base, 0) + v

    return moments, dist_factors

# 由于对称性，计算半结构: A(边柱), B(中柱)
# 中跨BC的远端是C(与B对称)

def calc_single_floor(ic_u, ic_l, ib_edge, ib_mid, q_edge, q_mid, L_edge, L_mid):
    """
    单层半结构弯矩分配
    A: 边柱节点 (上柱, 下柱, 右梁=边跨)
    B: 中柱节点 (左梁=边跨, 上柱, 下柱, 右梁=中跨)
    中跨远端C对称: M_CB = -M_BC (对称)

    返回: {A_col_upper, A_col_lower, A_beam, B_beam_left, B_beam_right,
           B_col_upper, B_col_lower}
    """
    # 固端弯矩
    fem_edge = fem_uniform(q_edge, L_edge)  # 两端
    fem_mid = fem_uniform(q_mid, L_mid)

    # 分配系数
    # A节点
    sum_i_A = ic_u + ic_l + ib_edge
    mu_A_uc = ic_u / sum_i_A
    mu_A_lc = ic_l / sum_i_A
    mu_A_b = ib_edge / sum_i_A

    # B节点
    sum_i_B = ic_u + ic_l + ib_edge + ib_mid
    mu_B_uc = ic_u / sum_i_B
    mu_B_lc = ic_l / sum_i_B
    mu_B_bl = ib_edge / sum_i_B   # 左梁(边跨)
    mu_B_br = ib_mid / sum_i_B    # 右梁(中跨)

    # 初始化
    M_A_b = -fem_edge   # A端边跨 (负号=上表面受拉)
    M_B_bl = fem_edge   # B端边跨
    M_B_br = -fem_mid   # B端中跨 (向C端)

    M_A_uc = 0; M_A_lc = 0
    M_B_uc = 0; M_B_lc = 0

    # === 第一次分配 ===
    # A节点不平衡弯矩
    unbal_A = M_A_b + M_A_uc + M_A_lc
    dM_A_uc = -mu_A_uc * unbal_A
    dM_A_lc = -mu_A_lc * unbal_A
    dM_A_b = -mu_A_b * unbal_A
    M_A_uc += dM_A_uc; M_A_lc += dM_A_lc; M_A_b += dM_A_b

    # B节点不平衡弯矩
    unbal_B = M_B_bl + M_B_br + M_B_uc + M_B_lc
    dM_B_uc = -mu_B_uc * unbal_B
    dM_B_lc = -mu_B_lc * unbal_B
    dM_B_bl = -mu_B_bl * unbal_B
    dM_B_br = -mu_B_br * unbal_B
    M_B_uc += dM_B_uc; M_B_lc += dM_B_lc; M_B_bl += dM_B_bl; M_B_br += dM_B_br

    # === 传递 ===
    # A.b → B.bl: 传递系数0.5
    carry_A_to_B = 0.5 * dM_A_b
    # B.bl → A.b: 传递系数0.5
    carry_B_to_A = 0.5 * dM_B_bl
    # B.br → C: 对称，传递回来就等于本身(因为C端弯矩=-B端)
    # 中跨远端传递: C端弯矩 = -M_B_br (对称反对称), B.br收到来自C的传递
    carry_C_to_B = 0.5 * (-dM_B_br)  # C.br → B.br

    M_A_b += carry_B_to_A
    M_B_bl += carry_A_to_B
    M_B_br += carry_C_to_B

    # === 第二次分配 ===
    # A节点
    unbal_A2 = M_A_b + M_A_uc + M_A_lc
    dM_A_uc2 = -mu_A_uc * unbal_A2
    dM_A_lc2 = -mu_A_lc * unbal_A2
    dM_A_b2 = -mu_A_b * unbal_A2
    M_A_uc += dM_A_uc2; M_A_lc += dM_A_lc2; M_A_b += dM_A_b2

    # B节点
    unbal_B2 = M_B_bl + M_B_br + M_B_uc + M_B_lc
    dM_B_uc2 = -mu_B_uc * unbal_B2
    dM_B_lc2 = -mu_B_lc * unbal_B2
    dM_B_bl2 = -mu_B_bl * unbal_B2
    dM_B_br2 = -mu_B_br * unbal_B2
    M_B_uc += dM_B_uc2; M_B_lc += dM_B_lc2; M_B_bl += dM_B_bl2; M_B_br += dM_B_br2

    # === 第二次传递 ===
    M_A_b += 0.5 * dM_B_bl2
    M_B_bl += 0.5 * dM_A_b2
    M_B_br += 0.5 * (-dM_B_br2)

    return {
        'M_A_uc': M_A_uc, 'M_A_lc': M_A_lc, 'M_A_b': M_A_b,
        'M_B_bl': M_B_bl, 'M_B_br': M_B_br,
        'M_B_uc': M_B_uc, 'M_B_lc': M_B_lc,
    }

print("\n" + "="*80)
print("弯矩二次分配重算")
print("="*80)

# 边榀框架使用边榀梁线刚度
ib_edge_frame = i_beam['edge_edge']
ib_mid_frame = i_beam['edge_mid']

# 各层计算
floors_dead = {}
floors_live = {}

for floor_name, h, ic_u_val, ic_l_val in [
    ('6F(顶层)', 3.0, ic_top, 0),     # 顶层: 上柱无
    ('5F', 3.0, ic_top, ic_top),
    ('4F', 3.0, ic_top, ic_top),
    ('3F', 3.0, ic_top, ic_top),
    ('2F', 3.0, ic_top, ic_top),
    ('1F(首层)', 4.0, ic_top, ic_1st),
]:
    # 恒载
    if '6F' in floor_name:
        q_edge = qeq_dead_roof_edge
        q_mid = qeq_dead_roof_mid
    else:
        q_edge = qeq_dead_floor_edge
        q_mid = qeq_dead_floor_mid

    r_dead = calc_single_floor(ic_u_val, ic_l_val, ib_edge_frame, ib_mid_frame,
                                q_edge, q_mid, L1, L2)
    floors_dead[floor_name] = r_dead

    # 活载
    if '6F' in floor_name:
        q_edge = qeq_live_roof_edge
        q_mid = qeq_live_roof_mid
    else:
        q_edge = qeq_live_floor_edge
        q_mid = qeq_live_floor_mid

    r_live = calc_single_floor(ic_u_val, ic_l_val, ib_edge_frame, ib_mid_frame,
                                q_edge, q_mid, L1, L2)
    floors_live[floor_name] = r_live

    print(f"\n{floor_name} 恒载:")
    print(f"  A: 上柱={r_dead['M_A_uc']:.2f}, 下柱={r_dead['M_A_lc']:.2f}, 梁={r_dead['M_A_b']:.2f}")
    print(f"  B: 上柱={r_dead['M_B_uc']:.2f}, 下柱={r_dead['M_B_lc']:.2f}, 左梁={r_dead['M_B_bl']:.2f}, 右梁={r_dead['M_B_br']:.2f}")

    print(f"{floor_name} 活载:")
    print(f"  A: 上柱={r_live['M_A_uc']:.2f}, 下柱={r_live['M_A_lc']:.2f}, 梁={r_live['M_A_b']:.2f}")
    print(f"  B: 上柱={r_live['M_B_uc']:.2f}, 下柱={r_live['M_B_lc']:.2f}, 左梁={r_live['M_B_bl']:.2f}, 右梁={r_live['M_B_br']:.2f}")

# ============================================================
# 跨中弯矩计算
# ============================================================
def calc_midspan_moment(q, L, M_left, M_right):
    """跨中弯矩 = ql²/8 - (M_left + M_right)/2"""
    return q * L**2 / 8 - (abs(M_left) + abs(M_right)) / 2

print("\n" + "="*80)
print("跨中弯矩")
print("="*80)

# 梁端剪力
# V = ql/2 + (M_right - M_left)/L

# ============================================================
# D值完整计算
# ============================================================
print("\n" + "="*80)
print("表2-5 D值汇总")
print("="*80)

def K_alpha_D(ic, h, sum_ib, is_first):
    K = sum_ib / ic
    alpha = (0.5+K)/(2+K) if is_first else K/(2+K)
    D = alpha * 12 * ic / h**2
    return K, alpha, D

# 边榀
K_e_e_top, a_e_e_top, D_e_e_top = K_alpha_D(ic_top, 3.0, ib_edge_frame, False)
K_e_e_1st, a_e_e_1st, D_e_e_1st = K_alpha_D(ic_1st, 4.0, ib_edge_frame, True)
K_e_m_top, a_e_m_top, D_e_m_top = K_alpha_D(ic_top, 3.0, ib_edge_frame+ib_mid_frame, False)
K_e_m_1st, a_e_m_1st, D_e_m_1st = K_alpha_D(ic_1st, 4.0, ib_edge_frame+ib_mid_frame, True)

# 中间榀
K_m_e_top, a_m_e_top, D_m_e_top = K_alpha_D(ic_top, 3.0, i_beam['mid_edge'], False)
K_m_e_1st, a_m_e_1st, D_m_e_1st = K_alpha_D(ic_1st, 4.0, i_beam['mid_edge'], True)
K_m_m_top, a_m_m_top, D_m_m_top = K_alpha_D(ic_top, 3.0, i_beam['mid_edge']+i_beam['mid_mid'], False)
K_m_m_1st, a_m_m_1st, D_m_m_1st = K_alpha_D(ic_1st, 4.0, i_beam['mid_edge']+i_beam['mid_mid'], True)

print("边榀:")
print(f"  边柱 顶/标: K={K_e_e_top:.2f}, α={a_e_e_top:.2f}, D={D_e_e_top:.0f}")
print(f"  边柱 首层: K={K_e_e_1st:.2f}, α={a_e_e_1st:.2f}, D={D_e_e_1st:.0f}")
print(f"  中柱 顶/标: K={K_e_m_top:.2f}, α={a_e_m_top:.2f}, D={D_e_m_top:.0f}")
print(f"  中柱 首层: K={K_e_m_1st:.2f}, α={a_e_m_1st:.2f}, D={D_e_m_1st:.0f}")
print(f"  榀刚度顶/标: {2*D_e_e_top+2*D_e_m_top:.0f}")
print(f"  榀刚度首层: {2*D_e_e_1st+2*D_e_m_1st:.0f}")

print("中间榀:")
print(f"  边柱 顶/标: K={K_m_e_top:.2f}, α={a_m_e_top:.2f}, D={D_m_e_top:.0f}")
print(f"  边柱 首层: K={K_m_e_1st:.2f}, α={a_m_e_1st:.2f}, D={D_m_e_1st:.0f}")
print(f"  中柱 顶/标: K={K_m_m_top:.2f}, α={a_m_m_top:.2f}, D={D_m_m_top:.0f}")
print(f"  中柱 首层: K={K_m_m_1st:.2f}, α={a_m_m_1st:.2f}, D={D_m_m_1st:.0f}")
print(f"  榀刚度顶/标: {2*D_m_e_top+2*D_m_m_top:.0f}")
print(f"  榀刚度首层: {2*D_m_e_1st+2*D_m_m_1st:.0f}")

print("\n计算完成！所有5400版本参数已就绪。")
