#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整6层3跨框架弯矩二次分配法精确计算
恒载+活载 → 跨中弯矩 → 梁端剪力 → 柱轴力 → 柱剪力
"""

import sys, math
sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# 基本参数
# ============================================================
L1, L2 = 5.4, 2.4       # 边跨/中跨跨度(m)
ss, L_long = 3.45, 6.9   # 板短半跨, 纵向跨度
g_roof, g_floor = 4.96, 4.2
q_roof, q_floor = 0.5, 2.0
g_beam_e, g_beam_m = 2.57, 1.89
g_wall_e, g_wall_m = 6.2, 6.45
F_NEW = 1 - 2*(0.5*ss/L1)**2 + (0.5*ss/L1)**3  # 0.829

# 柱线刚度
E = 30e6
Ic = 0.5**4/12
ic_std = E*Ic/3.0   # 52083 标准层
ic_1st = E*Ic/4.0   # 39062 首层

# 梁线刚度 (边榀)
I0_e = 0.25*0.5**3/12
ib_edge = E*1.5*I0_e/L1   # 21701
ib_mid = E*1.5*0.25*0.4**3/12/L2   # 25000
# 中跨不变，边跨刚度变化已体现在ib_edge中

# 等效均布荷载
qeq_dead_roof_e = g_beam_e + F_NEW*ss*g_roof        # 16.75
qeq_dead_floor_e = g_beam_e + g_wall_e + F_NEW*ss*g_floor  # 20.78
qeq_dead_roof_m = g_beam_m + 0.625*L2*g_roof        # 9.33
qeq_dead_floor_m = g_beam_m + g_wall_m + 0.625*L2*g_floor  # 14.64

qeq_live_roof_e = F_NEW*ss*q_roof        # 1.43
qeq_live_floor_e = F_NEW*ss*q_floor      # 5.72
qeq_live_roof_m = 0.625*L2*q_roof        # 0.75
qeq_live_floor_m = 0.625*L2*q_floor      # 3.00

# ============================================================
# 弯矩二次分配法
# ============================================================
def fem(q, L):
    return q*L**2/12

def moment_distribute_floor(ic_u, ic_l, ib_e, ib_m, q_e, q_m, L_e, L_m):
    """
    单层半结构弯矩二次分配
    A节点: 上柱(ic_u), 下柱(ic_l), 右梁(ib_e)
    B节点: 左梁(ib_e), 上柱(ic_u), 下柱(ic_l), 右梁(ib_m)

    返回: {A_u, A_l, A_b, B_bl, B_br, B_u, B_l}
    正号=顺时针(节点处)
    """
    # 固端弯矩 (顺时针为正)
    FEM_e = fem(q_e, L_e)
    FEM_m = fem(q_m, L_m)

    # --- 分配系数 ---
    # A节点
    sum_i_A = ic_u + ic_l + ib_e
    mu_A_u = ic_u/sum_i_A; mu_A_l = ic_l/sum_i_A; mu_A_b = ib_e/sum_i_A

    # B节点
    sum_i_B = ic_u + ic_l + ib_e + ib_m
    mu_B_u = ic_u/sum_i_B; mu_B_l = ic_l/sum_i_B
    mu_B_bl = ib_e/sum_i_B; mu_B_br = ib_m/sum_i_B

    # 初始弯矩
    M_A_u = 0; M_A_l = 0; M_A_b = -FEM_e
    M_B_u = 0; M_B_l = 0; M_B_bl = FEM_e; M_B_br = -FEM_m

    # ==== 第1次分配 ====
    # A节点
    unbal_A = M_A_u + M_A_l + M_A_b
    dA_u = -mu_A_u*unbal_A; dA_l = -mu_A_l*unbal_A; dA_b = -mu_A_b*unbal_A
    M_A_u += dA_u; M_A_l += dA_l; M_A_b += dA_b

    # B节点
    unbal_B = M_B_u + M_B_l + M_B_bl + M_B_br
    dB_u = -mu_B_u*unbal_B; dB_l = -mu_B_l*unbal_B
    dB_bl = -mu_B_bl*unbal_B; dB_br = -mu_B_br*unbal_B
    M_B_u += dB_u; M_B_l += dB_l; M_B_bl += dB_bl; M_B_br += dB_br

    # ==== 第1次传递 ====
    # A.b → B.bl (0.5)
    carry_A_to_B = 0.5*dA_b
    # B.bl → A.b (0.5)
    carry_B_to_A = 0.5*dB_bl
    # B.br → C.bl = 0.5*dB_br, C.bl → B.br = 0.5*(-dB_br) (对称反对称)
    carry_C_to_B = 0.5*(-dB_br)

    M_A_b += carry_B_to_A
    M_B_bl += carry_A_to_B
    M_B_br += carry_C_to_B

    # ==== 第2次分配 ====
    # A节点
    unbal_A2 = M_A_u + M_A_l + M_A_b
    dA_u2 = -mu_A_u*unbal_A2; dA_l2 = -mu_A_l*unbal_A2; dA_b2 = -mu_A_b*unbal_A2
    M_A_u += dA_u2; M_A_l += dA_l2; M_A_b += dA_b2

    # B节点
    unbal_B2 = M_B_u + M_B_l + M_B_bl + M_B_br
    dB_u2 = -mu_B_u*unbal_B2; dB_l2 = -mu_B_l*unbal_B2
    dB_bl2 = -mu_B_bl*unbal_B2; dB_br2 = -mu_B_br*unbal_B2
    M_B_u += dB_u2; M_B_l += dB_l2; M_B_bl += dB_bl2; M_B_br += dB_br2

    # ==== 第2次传递 ====
    M_A_b += 0.5*dB_bl2
    M_B_bl += 0.5*dA_b2
    M_B_br += 0.5*(-dB_br2)

    return {
        'A_u': M_A_u, 'A_l': M_A_l, 'A_b': M_A_b,
        'B_bl': M_B_bl, 'B_br': M_B_br,
        'B_u': M_B_u, 'B_l': M_B_l,
        'mu_A': (mu_A_u, mu_A_l, mu_A_b),
        'mu_B': (mu_B_u, mu_B_l, mu_B_bl, mu_B_br),
    }

# ============================================================
# 各层计算
# ============================================================
floors_config = [
    # (name, ic_upper, ic_lower)
    ('6F(顶层)', 0, ic_std),
    ('5F', ic_std, ic_std),
    ('4F', ic_std, ic_std),
    ('3F', ic_std, ic_std),
    ('2F', ic_std, ic_std),
    ('1F(首层)', ic_std, ic_1st),
]

results_dead = {}
results_live = {}

print("="*80)
print("弯矩二次分配结果 (半结构, 边榀)")
print("="*80)

for name, ic_u, ic_l in floors_config:
    is_roof = '6F' in name
    is_first = '1F' in name

    q_e_d = qeq_dead_roof_e if is_roof else qeq_dead_floor_e
    q_m_d = qeq_dead_roof_m if is_roof else qeq_dead_floor_m
    q_e_l = qeq_live_roof_e if is_roof else qeq_live_floor_e
    q_m_l = qeq_live_roof_m if is_roof else qeq_live_floor_m

    r_d = moment_distribute_floor(ic_u, ic_l, ib_edge, ib_mid, q_e_d, q_m_d, L1, L2)
    r_l = moment_distribute_floor(ic_u, ic_l, ib_edge, ib_mid, q_e_l, q_m_l, L1, L2)

    results_dead[name] = r_d
    results_live[name] = r_l

    print(f"\n{name}:")
    print(f"  恒载 A: 上柱={r_d['A_u']:.2f}, 下柱={r_d['A_l']:.2f}, 梁={r_d['A_b']:.2f}")
    print(f"  恒载 B: 上柱={r_d['B_u']:.2f}, 下柱={r_d['B_l']:.2f}, 左梁={r_d['B_bl']:.2f}, 右梁={r_d['B_br']:.2f}")
    print(f"  活载 A: 上柱={r_l['A_u']:.2f}, 下柱={r_l['A_l']:.2f}, 梁={r_l['A_b']:.2f}")
    print(f"  活载 B: 上柱={r_l['B_u']:.2f}, 下柱={r_l['B_l']:.2f}, 左梁={r_l['B_bl']:.2f}, 右梁={r_l['B_br']:.2f}")

# ============================================================
# 跨中弯矩
# ============================================================
print("\n" + "="*80)
print("跨中弯矩")
print("="*80)

def mid_span_moment(q, L, M_left, M_right):
    """M_mid = qL²/8 - (|M_left| + |M_right|)/2"""
    return q*L**2/8 - (abs(M_left) + abs(M_right))/2

for name, ic_u, ic_l in floors_config:
    is_roof = '6F' in name
    is_first = '1F' in name

    q_e_d = qeq_dead_roof_e if is_roof else qeq_dead_floor_e
    q_m_d = qeq_dead_roof_m if is_roof else qeq_dead_floor_m
    q_e_l = qeq_live_roof_e if is_roof else qeq_live_floor_e
    q_m_l = qeq_live_roof_m if is_roof else qeq_live_floor_m

    r_d = results_dead[name]
    r_l = results_live[name]

    # 边跨跨中 (A梁)
    M_edge_d = mid_span_moment(q_e_d, L1, r_d['A_b'], r_d['B_bl'])
    M_edge_l = mid_span_moment(q_e_l, L1, r_l['A_b'], r_l['B_bl'])
    # 中跨跨中 (B梁右端到C梁左端)
    M_mid_d = mid_span_moment(q_m_d, L2, r_d['B_br'], -r_d['B_br'])
    M_mid_l = mid_span_moment(q_m_l, L2, r_l['B_br'], -r_l['B_br'])

    print(f"{name}: 恒载 边跨={M_edge_d:.2f}, 中跨={M_mid_d:.2f} | 活载 边跨={M_edge_l:.2f}, 中跨={M_mid_l:.2f}")

# ============================================================
# 梁端剪力
# ============================================================
print("\n" + "="*80)
print("梁端剪力")
print("="*80)

def beam_shear(q, L, M_left, M_right):
    """V_left = qL/2 + (M_right-M_left)/L, V_right = qL/2 + (M_left-M_right)/L"""
    V_l = q*L/2 + (M_right - M_left)/L
    V_r = q*L/2 + (M_left - M_right)/L
    return V_l, V_r

for name, ic_u, ic_l in floors_config:
    is_roof = '6F' in name
    q_e_d = qeq_dead_roof_e if is_roof else qeq_dead_floor_e
    q_m_d = qeq_dead_roof_m if is_roof else qeq_dead_floor_m
    q_e_l = qeq_live_roof_e if is_roof else qeq_live_floor_e
    q_m_l = qeq_live_roof_m if is_roof else qeq_live_floor_m

    r_d = results_dead[name]
    r_l = results_live[name]

    # 恒载 边跨
    Vl_de, Vr_de = beam_shear(q_e_d, L1, r_d['A_b'], r_d['B_bl'])
    # 恒载 中跨
    Vl_dm, Vr_dm = beam_shear(q_m_d, L2, r_d['B_br'], -r_d['B_br'])
    # 活载 边跨
    Vl_le, Vr_le = beam_shear(q_e_l, L1, r_l['A_b'], r_l['B_bl'])
    # 活载 中跨
    Vl_lm, Vr_lm = beam_shear(q_m_l, L2, r_l['B_br'], -r_l['B_br'])

    # 修正: 柱节点处梁的左右端
    # 边柱(A): 左端无梁, 右端=Vl_de(方向向下为负)
    # 中柱(B): 左梁右端=Vr_de(向下为负), 右梁左端=Vl_dm(向下为负)

    print(f"{name}:")
    print(f"  恒载 边跨 Vl={Vl_de:.2f}, Vr={Vr_de:.2f} | 中跨 Vl={Vl_dm:.2f}, Vr={Vr_dm:.2f}")
    print(f"  活载 边跨 Vl={Vl_le:.2f}, Vr={Vr_le:.2f} | 中跨 Vl={Vl_lm:.2f}, Vr={Vr_lm:.2f}")

# ============================================================
# 柱端剪力
# ============================================================
print("\n" + "="*80)
print("柱端剪力 (V_col = ΣM_col/h)")
print("="*80)

for name, ic_u, ic_l in floors_config:
    is_first = '1F' in name
    h = 4.0 if is_first else 3.0

    r_d = results_dead[name]
    r_l = results_live[name]

    # A柱: 上端弯矩+A_u, 下端弯矩+A_l (需要从相邻层取)
    # B柱: 上端弯矩+B_u, 下端弯矩+B_l
    # 这里B_u和B_l是当前层节点处的分配弯矩

    V_col_A_d = (abs(r_d['A_u']) + abs(r_d['A_l'])) / h
    V_col_B_d = (abs(r_d['B_u']) + abs(r_d['B_l'])) / h
    V_col_A_l = (abs(r_l['A_u']) + abs(r_l['A_l'])) / h
    V_col_B_l = (abs(r_l['B_u']) + abs(r_l['B_l'])) / h

    print(f"{name}: 恒载 V_A={V_col_A_d:.2f}, V_B={V_col_B_d:.2f} | 活载 V_A={V_col_A_l:.2f}, V_B={V_col_B_l:.2f}")

# ============================================================
# 柱轴力 (逐层累计)
# ============================================================
print("\n" + "="*80)
print("柱轴力 (逐层累计)")
print("="*80)

# 柱集中力 (更新为5400版本)
sec_beam = 1.54*L1/2  # 4.16kN
edge_floor_conc = g_floor*(ss**2/4+ss*L1/2)  # 51.62kN
mid_floor_conc = g_floor*((ss**2/4+ss*L1/2)+(ss*L2-0.5*L2*L2))
edge_roof_conc = g_roof*(ss**2/4+ss*L1/2)
mid_roof_conc = g_roof*((ss**2/4+ss*L1/2)+(ss*L2-0.5*L2*L2))

# 边柱集中力
F_edge_roof = 31.19+20.08+sec_beam+edge_roof_conc  # 110.8→new
F_edge_floor = 42.3+20.08+sec_beam+edge_floor_conc  # 113.35→new
# 中柱集中力
F_mid_roof = 3.7+20.08+sec_beam+mid_roof_conc
F_mid_floor = 41.95+20.08+sec_beam+mid_floor_conc

# 柱自重
Gc_std = 6.76*3.0  # 20.28kN 标准层
Gc_1st = 6.76*4.0  # 27.04kN 首层

# 逐层累计
N_edge_dead = {}; N_mid_dead = {}
N_edge_live = {}; N_mid_live = {}

n_edge_d = [0]*7; n_mid_d = [0]*7  # index 0=6F, 6=1F
n_edge_l = [0]*7; n_mid_l = [0]*7

floor_names = ['6F(顶层)', '5F', '4F', '3F', '2F', '1F(首层)']

for fi, name in enumerate(floor_names):
    is_roof = fi == 0
    is_first = fi == 5

    r_d = results_dead[name]
    r_l = results_live[name]

    # 梁端剪力 (取使柱受压的方向)
    # 边柱: 左端无梁, 受右梁左端剪力影响
    # 中柱: 受左梁右端 + 右梁左端剪力影响
    q_e_d = qeq_dead_roof_e if is_roof else qeq_dead_floor_e
    q_m_d = qeq_dead_roof_m if is_roof else qeq_dead_floor_m
    q_e_l = qeq_live_roof_e if is_roof else qeq_live_floor_e
    q_m_l = qeq_live_roof_m if is_roof else qeq_live_floor_m

    # 边跨 [A_b = A端梁弯矩, B_bl = B端梁左弯矩]
    Vl_e_d, Vr_e_d = beam_shear(q_e_d, L1, r_d['A_b'], r_d['B_bl'])
    Vl_m_d, Vr_m_d = beam_shear(q_m_d, L2, r_d['B_br'], -r_d['B_br'])
    Vl_e_l, Vr_e_l = beam_shear(q_e_l, L1, r_l['A_b'], r_l['B_bl'])
    Vl_m_l, Vr_m_l = beam_shear(q_m_l, L2, r_l['B_br'], -r_l['B_br'])

    # 边柱轴力: 柱顶集中力 + 右梁左端剪力(向下)
    F_e = F_edge_roof if is_roof else F_edge_floor
    F_m = F_mid_roof if is_roof else F_mid_floor
    Gc = Gc_1st if is_first else Gc_std

    # 边柱: V_from_beam = Vr_e_d (右梁左端向下=正值传给柱)
    # 中柱: V_from_beams = Vr_e_d (左梁右端, 向下) + Vl_m_d (右梁左端, 向下)
    # 注意符号: 梁端剪力以向上为正(对梁而言), 对柱而言向下为正(受压)

    n_edge_d[fi] = F_e + Vr_e_d  # 柱顶轴力(恒载)
    n_mid_d[fi] = F_m + Vr_e_d + Vl_m_d

    n_edge_l[fi] = Vr_e_l  # 柱顶轴力(活载, 无集中力)
    n_mid_l[fi] = Vr_e_l + Vl_m_l

    # 累计
    if fi > 0:
        n_edge_d[fi] += n_edge_d[fi-1] + (Gc_std if fi != 5 else 0)
        n_mid_d[fi] += n_mid_d[fi-1] + (Gc_std if fi != 5 else 0)
        n_edge_l[fi] += n_edge_l[fi-1]
        n_mid_l[fi] += n_mid_l[fi-1]

    # 柱底 = 柱顶 + 柱自重
    edge_d_bot = n_edge_d[fi] + Gc
    mid_d_bot = n_mid_d[fi] + Gc

    print(f"{name}: 边柱 恒载N顶={n_edge_d[fi]:.1f}, N底={edge_d_bot:.1f} | 活载N顶={n_edge_l[fi]:.1f}")
    print(f"       中柱 恒载N顶={n_mid_d[fi]:.1f}, N底={mid_d_bot:.1f} | 活载N顶={n_mid_l[fi]:.1f}")

print("\n" + "="*80)
print("弯矩二次分配完成！")
print("="*80)
