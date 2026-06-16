"""DXF → PDF 转换脚本，使用 ezdxf + matplotlib"""
import sys
import argparse
from pathlib import Path
import matplotlib.pyplot as plt
from ezdxf import recover
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.properties import LayoutProperties
from ezdxf.bbox import extents

# 标准工程图纸尺寸 (mm) - 横放
PAPER_SIZES_MM = {
    "A0": (1189, 841),
    "A1": (841, 594),
    "A2": (594, 420),
    "A3": (420, 297),
    "A4": (297, 210),
}


def dxf_to_pdf(dxf_path: str, pdf_path: str, paper: str = "auto", dpi: int = 300):
    print(f"读取: {dxf_path}")
    doc, auditor = recover.readfile(dxf_path)
    if auditor.has_errors:
        print(f"  警告: 发现 {len(auditor.errors)} 个错误")
    if auditor.has_fixes:
        print(f"  已自动修复 {len(auditor.fixes)} 处")

    msp = doc.modelspace()
    print(f"  实体数: {len(msp)}")

    # 计算图纸范围 (DXF 单位通常是 mm)
    bbox = extents(msp, fast=True)
    if bbox.has_data:
        dwg_w = bbox.extmax.x - bbox.extmin.x
        dwg_h = bbox.extmax.y - bbox.extmin.y
        print(f"  图纸范围: {dwg_w:.0f} × {dwg_h:.0f} mm")
    else:
        dwg_w, dwg_h = 42000, 29700
        print(f"  无法计算范围，使用默认值")

    # 确定纸张
    if paper == "auto":
        best = "A0"
        for name, (pw, ph) in sorted(PAPER_SIZES_MM.items(),
                                       key=lambda x: x[1][0] * x[1][1]):
            # 检查两个方向
            if dwg_w <= pw and dwg_h <= ph:
                best = name
                break
            if dwg_h <= pw and dwg_w <= ph:
                best = name
                break
        paper_w, paper_h = PAPER_SIZES_MM[best]
        print(f"  自动选择纸张: {best} ({paper_w}×{paper_h} mm)")
    elif paper.upper() in PAPER_SIZES_MM:
        paper_w, paper_h = PAPER_SIZES_MM[paper.upper()]
    else:
        parts = paper.split("x")
        paper_w, paper_h = float(parts[0]), float(parts[1])

    # 计算缩放比，让图纸内容适合纸张（留 5% 边距）
    scale = min(paper_w / dwg_w, paper_h / dwg_h) * 0.95

    # 输出 PDF 的物理尺寸 = 图纸内容缩放后的大小（英寸）
    fig_w = dwg_w * scale / 25.4
    fig_h = dwg_h * scale / 25.4

    print(f"  缩放比: 1:{1/scale:.0f}")
    print(f"  输出尺寸: {fig_w:.1f} × {fig_h:.1f} inch ({fig_w*25.4:.0f} × {fig_h*25.4:.0f} mm)")
    print(f"  分辨率: {fig_w*dpi:.0f} × {fig_h*dpi:.0f} px @ {dpi} DPI")

    # 渲染
    layout_props = LayoutProperties.from_layout(msp)
    layout_props.set_colors(bg="#FFFFFF")

    fig, ax = plt.subplots(figsize=(fig_w, fig_h),
                           facecolor="white", edgecolor="none")
    ax.set_position([0, 0, 1, 1])
    ax.axis("off")
    ctx = RenderContext(doc)
    backend = MatplotlibBackend(ax, adjust_figure=False)
    frontend = Frontend(ctx, backend)

    print("渲染中...")
    frontend.draw_layout(msp, layout_properties=layout_props)

    fig.savefig(pdf_path, dpi=dpi, facecolor="white", edgecolor="none",
                pad_inches=0)
    plt.close(fig)

    # 检查输出
    out_path = Path(pdf_path)
    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"已保存: {pdf_path} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DXF → PDF 转换")
    parser.add_argument("dxf", help="DXF 文件路径")
    parser.add_argument("-o", "--output", help="输出 PDF 路径")
    parser.add_argument("--paper", default="auto",
                        help="纸张大小: auto/A0/A1/A2/A3/A4 或 WxH(mm)")
    parser.add_argument("--dpi", type=int, default=300, help="输出 DPI (默认 300)")
    args = parser.parse_args()

    output = args.output or str(Path(args.dxf).with_suffix(".pdf"))
    dxf_to_pdf(args.dxf, output, args.paper, args.dpi)
