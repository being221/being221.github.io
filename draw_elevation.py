import ezdxf
from ezdxf import units, zoom
import os

doc = ezdxf.new(setup=True)
msp = doc.modelspace()

# ============================================================
# 图层设置
# ============================================================
doc.layers.add("GROUND", color=7)       # 白/黑 - 地坪线
doc.layers.add("WALL", color=2)         # 黄 - 墙体轮廓
doc.layers.add("ROOF", color=1)         # 红 - 屋顶
doc.layers.add("WINDOW", color=4)       # 青 - 窗
doc.layers.add("DOOR", color=3)         # 绿 - 门
doc.layers.add("DIM", color=6)          # 品红 - 标注

# ============================================================
# 建筑参数 (单位: mm)
# ============================================================
BW = 12000      # 建筑总宽
FH = 3300       # 层高
FLOORS = 2
WALL_H = FH * FLOORS  # 檐口高度 6600
ROOF_H = 2200   # 屋顶起坡高度
PEAK = WALL_H + ROOF_H  # 屋脊 8800

# 门窗
DOOR_W, DOOR_H = 1800, 2400
WIN_W, WIN_H = 1800, 1500
WIN_SILL_1F = 1000   # 一层窗台高
WIN_SILL_2F = WIN_SILL_1F + FH  # 二层窗台高

# ============================================================
# 地坪线 (加粗示意用双线)
# ============================================================
msp.add_line((-2000, 0), (BW + 2000, 0), dxfattribs={"layer": "GROUND"})

# ============================================================
# 墙体轮廓
# ============================================================
pts = [(0, 0), (0, WALL_H), (BW, WALL_H), (BW, 0)]
msp.add_lwpolyline(pts, dxfattribs={"layer": "WALL"})

# ============================================================
# 屋顶 (坡屋顶)
# ============================================================
roof_pts = [(0, WALL_H), (BW / 2, PEAK), (BW, WALL_H)]
msp.add_lwpolyline(roof_pts, dxfattribs={"layer": "ROOF"})
# 屋脊竖线
msp.add_line((BW / 2, WALL_H), (BW / 2, PEAK), dxfattribs={"layer": "ROOF"})

# ============================================================
# 楼层线
# ============================================================
msp.add_line((0, FH), (BW, FH), dxfattribs={"layer": "WALL"})
# 楼板厚度示意
msp.add_line((0, FH - 100), (BW, FH - 100), dxfattribs={"layer": "WALL"})

# ============================================================
# 门 (居中)
# ============================================================
dx = (BW - DOOR_W) / 2
msp.add_lwpolyline([
    (dx, 0), (dx, DOOR_H), (dx + DOOR_W, DOOR_H), (dx + DOOR_W, 0)
], dxfattribs={"layer": "DOOR"})
# 门扇示意
msp.add_line((dx + DOOR_W / 2, 0), (dx + DOOR_W / 2, DOOR_H), dxfattribs={"layer": "DOOR"})

# ============================================================
# 窗 (一层两个, 二层三个)
# ============================================================
def draw_window(cx, cy, w=WIN_W, h=WIN_H):
    """以中心点绘制窗户"""
    x1, y1 = cx - w / 2, cy - h / 2
    x2, y2 = cx + w / 2, cy + h / 2
    msp.add_lwpolyline([
        (x1, y1), (x1, y2), (x2, y2), (x2, y1)
    ], dxfattribs={"layer": "WINDOW"}, close=True)
    # 窗框分隔
    msp.add_line((cx, y1), (cx, y2), dxfattribs={"layer": "WINDOW"})
    msp.add_line((x1, cy), (x2, cy), dxfattribs={"layer": "WINDOW"})

# 一层窗
win_cy_1f = WIN_SILL_1F + WIN_H / 2
draw_window(2500, win_cy_1f)
draw_window(BW - 3000, win_cy_1f)

# 二层窗
win_cy_2f = WIN_SILL_2F + WIN_H / 2
draw_window(1800, win_cy_2f)
draw_window(BW / 2, win_cy_2f)
draw_window(BW - 2200, win_cy_2f)

# ============================================================
# 烟囱 (右侧屋顶)
# ============================================================
CHIMNEY_X = 8500          # 烟囱中心 X
CHIMNEY_W = 500           # 烟囱宽度
# 计算该位置屋顶高度: 线性插值 (屋脊→右檐口)
roof_h_at_x = WALL_H + ROOF_H * (1 - (CHIMNEY_X - BW / 2) / (BW / 2))
CHIMNEY_TOP = roof_h_at_x + 1600  # 烟囱顶高出屋面 1600

msp.add_lwpolyline([
    (CHIMNEY_X - CHIMNEY_W / 2, roof_h_at_x),
    (CHIMNEY_X - CHIMNEY_W / 2, CHIMNEY_TOP),
    (CHIMNEY_X + CHIMNEY_W / 2, CHIMNEY_TOP),
    (CHIMNEY_X + CHIMNEY_W / 2, roof_h_at_x),
], dxfattribs={"layer": "WALL"})
# 烟囱顶部盖板
msp.add_line(
    (CHIMNEY_X - CHIMNEY_W / 2 - 80, CHIMNEY_TOP),
    (CHIMNEY_X + CHIMNEY_W / 2 + 80, CHIMNEY_TOP),
    dxfattribs={"layer": "ROOF"}
)

# ============================================================
# 一层小窗 (门右侧)
# ============================================================
SWIN_W, SWIN_H = 900, 1200  # 小窗尺寸
swin_cx = (BW - DOOR_W) / 2 + DOOR_W + 600 + SWIN_W / 2  # 门右 + 间距600
swin_cy = WIN_SILL_1F + SWIN_H / 2
sw_x1, sw_y1 = swin_cx - SWIN_W / 2, swin_cy - SWIN_H / 2
sw_x2, sw_y2 = swin_cx + SWIN_W / 2, swin_cy + SWIN_H / 2
msp.add_lwpolyline([
    (sw_x1, sw_y1), (sw_x1, sw_y2), (sw_x2, sw_y2), (sw_x2, sw_y1)
], dxfattribs={"layer": "WINDOW"}, close=True)
msp.add_line((swin_cx, sw_y1), (swin_cx, sw_y2), dxfattribs={"layer": "WINDOW"})
msp.add_line((sw_x1, swin_cy), (sw_x2, swin_cy), dxfattribs={"layer": "WINDOW"})

# ============================================================
# 简单标注 (手动绘制尺寸线 + 文字)
# ============================================================
def draw_dim_line(y, x1, x2, label):
    msp.add_line((x1, y), (x2, y), dxfattribs={"layer": "DIM"})
    # 端线
    msp.add_line((x1, y - 300), (x1, y + 300), dxfattribs={"layer": "DIM"})
    msp.add_line((x2, y - 300), (x2, y + 300), dxfattribs={"layer": "DIM"})
    # 文字
    mid = (x1 + x2) / 2
    msp.add_text(label, dxfattribs={
        "layer": "DIM", "height": 350,
        "insert": (mid - 350, y - 700)
    })

# 总宽
draw_dim_line(-1200, 0, BW, "12000")
# 层高
draw_dim_line(-1000, 0, FH, "3300")
# 屋顶
draw_dim_line(-1000, WALL_H, PEAK, "2200")

# ============================================================
# 保存
# ============================================================
out = r"C:\Users\邓杰鹏\Desktop\建筑物正立面图.dxf"
doc.saveas(out)
print(f"已保存: {out}")
print(f"可在 CAD 中打开")
