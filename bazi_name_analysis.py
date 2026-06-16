# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import date

# ============================================================
#                       基础数据
# ============================================================
GAN  = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
ZHI  = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
GAN_WX = {"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土",
          "庚":"金","辛":"金","壬":"水","癸":"水"}
ZHI_WX = {"子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
          "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"}
CANG_GAN = {"子":"癸","丑":"己","寅":"甲","卯":"乙","辰":"戊",
            "巳":"丙","午":"丁","未":"己","申":"庚","酉":"辛","戌":"戊","亥":"壬"}
SHENG = {"金":"水","水":"木","木":"火","火":"土","土":"金"}
KE   = {"金":"木","木":"土","土":"水","水":"火","火":"金"}
SHENG_BY = {v:k for k,v in SHENG.items()}
KE_BY   = {v:k for k,v in KE.items()}

NAYIN = {
    "甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火",
    "戊辰":"大林木","己巳":"大林木","庚午":"路旁土","辛未":"路旁土",
    "壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火",
    "丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土",
    "庚辰":"白蜡金","辛巳":"白蜡金","壬午":"杨柳木","癸未":"杨柳木",
    "甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土",
    "戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木",
    "壬辰":"长流水","癸巳":"长流水","甲午":"沙中金","乙未":"沙中金",
    "丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木",
    "庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金",
    "甲辰":"覆灯火","乙巳":"覆灯火","丙午":"天河水","丁未":"天河水",
    "戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金",
    "壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水",
    "丙辰":"沙中土","丁巳":"沙中土","戊午":"天上火","己未":"天上火",
    "庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水",
}

GAN_YINYANG = {"甲":"阳","乙":"阴","丙":"阳","丁":"阴","戊":"阳",
               "己":"阴","庚":"阳","辛":"阴","壬":"阳","癸":"阴"}

# ============================================================
#                    个人信息
# ============================================================
name = "邓杰鹏"
Y, M, D = 2004, 2, 21
beijing_hour = 18.5  # 约下午6:30
lng = 105.06  # 内江东经
solar_offset = round((120 - lng) * 4)  # 约60分钟
true_solar_hour = beijing_hour - solar_offset / 60  # 约17:30

HOUR_TABLE = [(23,1,"子"),(1,3,"丑"),(3,5,"寅"),(5,7,"卯"),
              (7,9,"辰"),(9,11,"巳"),(11,13,"午"),(13,15,"未"),
              (15,17,"申"),(17,19,"酉"),(19,21,"戌"),(21,23,"亥")]

def get_hour_zhi(h):
    for h1, h2, z in HOUR_TABLE:
        if h1 <= h < h2 or (h1 == 23 and h >= 23):
            return z
    # handle 23-24
    if h >= 23:
        return "子"
    return "子"

hour_zhi = get_hour_zhi(true_solar_hour)

# ============================================================
#                    八字排盘
# ============================================================
li_chun = (2, 4)
lunar_year = Y if (M, D) >= li_chun else Y - 1
year_gan = GAN[(lunar_year - 4) % 10]
year_zhi = ZHI[(lunar_year - 4) % 12]
year_pillar = year_gan + year_zhi

TERMS_2004 = [
    (2004,2,4,"寅"),(2004,3,5,"卯"),(2004,4,4,"辰"),(2004,5,5,"巳"),
    (2004,6,5,"午"),(2004,7,7,"未"),(2004,8,7,"申"),(2004,9,7,"酉"),
    (2004,10,8,"戌"),(2004,11,7,"亥"),(2004,12,7,"子"),(2005,1,6,"丑"),
]
month_zhi = "子"
for ty,tm,td,tz in TERMS_2004:
    if date(Y,M,D) >= date(ty,tm,td):
        month_zhi = tz

WHD = {"甲":2,"己":2,"乙":4,"庚":4,"丙":6,"辛":6,"丁":8,"壬":8,"戊":0,"癸":0}
mz_idx = ZHI.index(month_zhi)
month_gan = GAN[(WHD[year_gan] + (mz_idx - 2) % 12) % 10]
month_pillar = month_gan + month_zhi

JIAZI = [(GAN[i%10], ZHI[i%12]) for i in range(60)]
base_idx = next(i for i,(g,z) in enumerate(JIAZI) if g=="甲" and z=="戌")
delta = (date(Y,M,D) - date(1900,1,1)).days
day_gan, day_zhi = JIAZI[(base_idx + delta) % 60]
day_pillar = day_gan + day_zhi
ri_wx = GAN_WX[day_gan]

WSD = {"甲":0,"己":0,"乙":2,"庚":2,"丙":4,"辛":4,"丁":6,"壬":6,"戊":8,"癸":8}
hz_idx = ZHI.index(hour_zhi)
hour_gan = GAN[(WSD[day_gan] + hz_idx) % 10]
hour_pillar = hour_gan + hour_zhi

# ============================================================
#                    十神
# ============================================================
def shi_shen(gan, ri_gan_str):
    wx_g = GAN_WX[gan]
    wx_r = GAN_WX[ri_gan_str]
    yy_g = GAN_YINYANG[gan]
    yy_r = GAN_YINYANG[ri_gan_str]
    same_yy = (yy_g == yy_r)
    if wx_g == wx_r:
        return "比肩" if same_yy else "劫财"
    if SHENG_BY.get(wx_r) == wx_g:
        return "偏印" if same_yy else "正印"
    if SHENG.get(wx_r) == wx_g:
        return "食神" if same_yy else "伤官"
    if KE_BY.get(wx_r) == wx_g:
        return "七杀" if same_yy else "正官"
    if KE.get(wx_r) == wx_g:
        return "偏财" if same_yy else "正财"
    return "?"

# 五行统计
wx_count = {"金":0,"木":0,"水":0,"火":0,"土":0}
pillar_data = []
for label, pillar in [("年", year_pillar), ("月", month_pillar), ("日", day_pillar), ("时", hour_pillar)]:
    g, z = pillar[0], pillar[1]
    cg = CANG_GAN[z]
    g_ss = shi_shen(g, day_gan)
    z_ss = shi_shen(cg, day_gan)
    gw, zw = GAN_WX[g], ZHI_WX[z]
    wx_count[gw] += 1
    wx_count[zw] += 1
    pillar_data.append((label, pillar, g, g_ss, z, cg, z_ss, gw, zw))

total_wx = sum(wx_count.values())
cnt_ri = wx_count[ri_wx]
max_w = max(wx_count, key=wx_count.get)
missing = [k for k,v in wx_count.items() if v == 0]

if cnt_ri >= 4: strength = "偏强"
elif cnt_ri >= 3: strength = "中和偏旺"
else: strength = "偏弱"

# ============================================================
#                    大运
# ============================================================
next_term = date(2004, 3, 5)
days_to_term = (next_term - date(Y, M, D)).days
qiyun_age = days_to_term / 3
dayun_list = []
for i in range(1, 9):
    dg = GAN[(GAN.index(month_gan) + i) % 10]
    dz = ZHI[(ZHI.index(month_zhi) + i) % 12]
    dayun_list.append((dg+dz, round(qiyun_age + (i-1)*10, 1)))

# ============================================================
#                    姓名学
# ============================================================
strokes = {"邓":19, "杰":12, "鹏":19}
char_wx = {"邓":"火", "杰":"木", "鹏":"水"}
tian_ge = strokes["邓"] + 1
ren_ge  = strokes["邓"] + strokes["杰"]
di_ge   = strokes["杰"] + strokes["鹏"]
wai_ge  = strokes["鹏"] + 1
zong_ge = strokes["邓"] + strokes["杰"] + strokes["鹏"]

def shuli(n):
    n80 = n if n <= 80 else n - 80
    lucky = {1,3,5,6,7,8,11,13,15,16,17,18,21,23,24,25,29,31,32,33,35,37,39,
             41,45,47,48,52,55,57,61,63,65,67,68,71,73,75,81}
    if n80 in lucky: return "吉"
    return "凶" if n80 in {2,4,9,10,12,14,19,20,22,26,27,28,30,34,36,40,42,43,44,46,49,50,53,54,56,58,59,60,62,64,66,69,70,72,74,76,77,78,79,80} else "半吉"

def sc(tg, rg, dg):
    def n2w(n):
        n0 = n % 10
        if n0 in (1,2): return "木"
        if n0 in (3,4): return "火"
        if n0 in (5,6): return "土"
        if n0 in (7,8): return "金"
        return "水"
    return n2w(tg) + n2w(rg) + n2w(dg)

sancai_str = sc(tian_ge, ren_ge, di_ge)

# ============================================================
#                       输出
# ============================================================
print("=" * 64)
print("                  🔮 邓杰鹏 · 八字全盘分析")
print("=" * 64)
print(f"  出生: {Y}年{M}月{D}日 约{beijing_hour:.0f}:30 (北京时间)")
print(f"  地点: 四川省内江市 (东经 {lng}°)")
print(f"  真太阳时: 北京时间 -{solar_offset}分钟 → 约{int(true_solar_hour)}:{int((true_solar_hour%1)*60):02d}")
print(f"  时辰: {hour_zhi}时 (17:00-19:00)")
print()
print("  ┌──────────┬──────────┬──────────┬──────────┐")
print("  │   年柱   │   月柱   │   日柱   │   时柱   │")
print("  ├──────────┼──────────┼──────────┼──────────┤")
print(f"  │   {year_pillar}    │   {month_pillar}    │   {day_pillar}    │   {hour_pillar}    │")
print("  └──────────┴──────────┴──────────┴──────────┘")
print(f"                          ↑ 日主: {day_gan}({ri_wx})")

for label, pillar, g, g_ss, z, cg, z_ss, gw, zw in pillar_data:
    print(f"  {label}柱 {pillar}: 干{g}({gw})·{g_ss} | 支{z}({zw})·藏{cg}·{z_ss} | 纳音{NAYIN.get(pillar,'?')}")

print()
print("=" * 64)
print("                   五行能量分布")
print("=" * 64)
for k in ["金","木","水","火","土"]:
    bar = "█" * wx_count[k] + "░" * (5 - wx_count[k])
    tags = []
    if k == ri_wx: tags.append("★日主")
    if wx_count[k] == 0: tags.append("⚠完全缺失")
    if k == max_w: tags.append("最旺")
    print(f"  {k}: {bar} {wx_count[k]}/{total_wx}  {' '.join(tags)}")

print()
print("  【日主详解】")
print(f"  庚金生于寅月（初春），木旺金囚。")
print(f"  年支申金为禄、时支酉金为刃 → 有根气。")
print(f"  月干丙火(七杀)锻金、年干甲木(偏财)、时干乙木(正财)。")
print(f"  金木各有根气 → 两强对峙，{strength}。")
print(f"  关键矛盾: 水、土双双缺失 → 命局干燥失调。")

print()
print("=" * 64)
print("                 喜用神 & 忌神")
print("=" * 64)
print("""
  【第一用神: 水】
  理由有三:
  1. 调候: 庚金在春，需水润泽
  2. 通关: 金木相战(金克木)，水能泄金生木 → 化干戈为玉帛
  3. 食伤泄秀: 庚金见水为食伤 → 才华外显、技艺生财

  【第二用神: 土】
  1. 土生金: 印星固本，增强日主根气
  2. 土制水: 防止水过旺反噬

  喜神: 水 > 土
  忌神: 木(财多身弱)、火(官杀克身已不弱)
  闲神: 金(有根气，不必再补)
""")

print("=" * 64)
print("                 大运走势")
print("=" * 64)
print(f"  起运: {qiyun_age:.1f}岁  |  顺排(阳年男)")
print()
for dyp, age in dayun_list:
    dg, dz = dyp[0], dyp[1]
    wx_s = f"{GAN_WX[dg]}/{ZHI_WX[dz]}"
    period = f"{int(age)}-{int(age)+9}岁"
    if GAN_WX[dg]=="水" or ZHI_WX[dz]=="水":
        comment = "★ 补水运，大好"
    elif GAN_WX[dg]=="土" or ZHI_WX[dz]=="土":
        comment = "★ 补土运，佳"
    elif GAN_WX[dg]=="木":
        comment = "木旺，平偏下"
    else:
        comment = "平"
    print(f"  {dyp} ({wx_s:8s})  {period:>8s}  {comment}")

print()
print("=" * 64)
print("              姓名学: 邓杰鹏")
print("=" * 64)
print(f"""
  康熙字典笔画: 邓(19火) + 杰(12木) + 鹏(19水)

  五格数理:
    天格: {tian_ge:2d} ({shuli(tian_ge)})   人格: {ren_ge:2d} ({shuli(ren_ge)}) ★主运
    地格: {di_ge:2d} ({shuli(di_ge)})   外格: {wai_ge:2d} ({shuli(wai_ge)})
    总格: {zong_ge:2d} ({shuli(zong_ge)})

  三才配置: {sancai_str} (天格→人格→地格)

  【姓名五行与八字对照】
  邓(火) → 杰(木) ← 鹏(水)

  八字: 缺水、缺土
  姓名: 有火、木、水 (不缺金——八字金旺)

  好的一面: "鹏"字属水，正好补了你八字最缺的水！
  需注意: "杰"字属木，八字木已旺(3/8)，再叠加 → 可能过于刚直
""")

print("=" * 64)
print("           🎯 网名推荐 (八字+姓名 联合分析)")
print("=" * 64)
print("""
  核心策略: 全力【补水】，次选【补土】

  你喜欢的「此在」「being」系列恰好可以搭配水行字，
  既有哲学深度，又能调候命局。

  ┌─────────────────────────────────────────────┐
""")

picks = [
    ("此泽", "水", 5, [
        "「此」= Dasein核心概念，追问存在",
        "「泽」= 水聚为泽，癸水归源",
        "音韵 cǐ-zé 仄平，利落有力",
        "庚金见泽水 → 食伤泄秀，才华外显",
        "与你目前「being221」的哲学气一脉相承",
    ]),
    ("泽在", "水", 5, [
        "「泽」= 水德润下，恩泽丰沛",
        "「在」= 存在于世，海德格尔之在",
        "音韵 zé-zài 平仄，铿锵有力",
        "being系列最佳，直接呼应你现在的ID",
        "「泽在」连读 = 恩泽常伴于身",
    ]),
    ("此源", "水", 4.5, [
        "「此」= 此在 / Dasein",
        "「源」= 源头活水，深水之源",
        "音韵 cǐ-yuán 仄平",
        "你爱历史和哲学 → 追问本源",
        "比「此泽」更深邃，但稍显书卷气",
    ]),
    ("此安", "土", 4.5, [
        "补土路线最佳选择",
        "「此安」= 此心安处是吾乡（苏轼）",
        "土生金，印星护身增福",
        "更稳重的风格，适合正式场合",
    ]),
    ("渊在", "水", 4, [
        "「渊」= 渊深博大，水之深厚者",
        "《中庸》:「渊渊其渊」",
        "音韵 yuān-zài",
        "深沉有余，灵气稍欠",
    ]),
    ("being_zephyr", "水/风", 4.5, [
        "英文场景专用",
        "being = 存在，延续你现在的ID",
        "zephyr = 和风/西风，风生水起",
        "中英混搭，国际化也够独特",
    ]),
]

for i, (nm, wx_key, score, lines) in enumerate(picks, 1):
    stars = "★" * int(score) + ("☆" if score != int(score) else "")
    print(f"  [{i}] {nm}  {stars} 补{wx_key}")
    for ln in lines:
        print(f"      {ln}")
    print()

print("  └─────────────────────────────────────────────┘")
print()
print("=" * 64)
print("               🏆 终极结论")
print("=" * 64)
print("""
  八字: 甲申 丙寅 庚午 乙酉
  日主: 庚金 (斧钺之金，刚锐果断)
  核心矛盾: 金木对峙，水竭土枯
  解药: 补水为上，土次之

  本名「邓杰鹏」已暗含水行补益 → 你父母取名或有高人指点
  网名应在此基础上进一步加强水元素。

  🥇 最推荐: 「此泽」
     五个维度全部满分:
     - 八字契合度: ★★★★★ (补水精准)
     - 哲学深度:   ★★★★★ (Dasein+润泽之道)
     - 音韵美感:   ★★★★★ (仄平，利落)
     - 独特性:     ★★★★★ (几乎不撞名)
     - 个人契合:   ★★★★★ (延续being/此在偏好)

  🥈 备选: 「泽在」(being系) / 「此源」(更深邃)

  建议: 中文平台用「此泽」，英文/GitHub 保留 being221
  两者互补，一脉相承。
""")
