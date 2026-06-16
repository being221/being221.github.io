"""用 pikepdf 对 PDF 中的 JPEG 图片做视觉无损重编码。
严格保留色彩空间，使用 baseline JPEG 确保维普兼容。"""

import pikepdf
import io
import os
from PIL import Image

INPUT = r"C:\Users\邓杰鹏\Desktop\毕设\毕设\毕设合并版.pdf"
OUTPUT = r"C:\Users\邓杰鹏\Desktop\毕设\毕设\毕设合并版_压缩.pdf"

JPEG_QUALITY = 88

orig_size = os.path.getsize(INPUT)
print(f"原始: {orig_size/1024/1024:.1f}MB | JPEG quality={JPEG_QUALITY}\n")

pdf = pikepdf.open(INPUT)

recompressed = 0
saved_bytes = 0

for page_num, page in enumerate(pdf.pages, 1):
    for img_name, img_obj in page.images.items():
        try:
            raw = img_obj.read_raw_bytes()
        except Exception:
            continue

        if len(raw) < 10240:
            continue

        try:
            pil_img = Image.open(io.BytesIO(raw))
        except Exception:
            continue

        fmt = (pil_img.format or "").upper()
        w, h = pil_img.size
        mode = pil_img.mode

        if fmt not in ("JPEG", "PNG"):
            continue
        if fmt == "PNG" and len(raw) <= 51200:
            continue

        # 确定保存模式：严格保持原色彩空间
        save_mode = mode
        if mode in ("RGBA", "PA"):
            save_mode = "RGB"
            pil_img = pil_img.convert("RGB")
        elif mode == "P":
            pil_img = pil_img.convert("RGB")
            save_mode = "RGB"

        buf = io.BytesIO()
        # baseline JPEG (progressive=False) — 维普兼容性最好
        pil_img.save(buf, format="JPEG", quality=JPEG_QUALITY,
                     optimize=True, progressive=False)
        new_data = buf.getvalue()

        if len(new_data) >= len(raw):
            continue

        # 验证分辨率
        verify = Image.open(io.BytesIO(new_data))
        if verify.size != (w, h):
            continue

        # 写入
        img_obj.write(new_data, filter=pikepdf.Name.DCTDecode)

        # 如果是 PNG 转 JPEG，更新色彩空间
        if fmt == "PNG":
            if save_mode == "L":
                img_obj.put(pikepdf.Name.ColorSpace, pikepdf.Name.DeviceGray)
            else:
                img_obj.put(pikepdf.Name.ColorSpace, pikepdf.Name.DeviceRGB)

        saved = len(raw) - len(new_data)
        saved_bytes += saved
        recompressed += 1
        print(f"  页{page_num}: {w}x{h} {mode} {len(raw)/1024:.0f}KB → "
              f"{len(new_data)/1024:.0f}KB (省{saved/1024:.0f}KB)")

# 保存优化
pdf.save(OUTPUT,
         compress_streams=True,
         object_stream_mode=pikepdf.ObjectStreamMode.generate,
         normalize_content=True)
pdf.close()

final = os.path.getsize(OUTPUT)
print(f"\n{'='*50}")
print(f"重编码: {recompressed} 张 | 图片节省: {saved_bytes/1024/1024:.1f}MB")
print(f"原始: {orig_size/1024/1024:.1f}MB → 最终: {final/1024/1024:.1f}MB "
      f"({(1-final/orig_size)*100:.0f}% off)")

if final < 30 * 1024 * 1024:
    print("已达标 < 30MB!")
else:
    print(f"差 {(final - 30*1024*1024)/1024/1024:.1f}MB")
