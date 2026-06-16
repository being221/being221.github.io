"""合并版 PDF 压缩 —— 与之前相同的视觉无损方法"""
import pikepdf
import io
import os
from PIL import Image

INPUT = r"C:\Users\邓杰鹏\Desktop\毕设\毕设\毕设完整版.pdf"
TMP = r"C:\Users\邓杰鹏\Desktop\毕设\毕设\毕设完整版_tmp.pdf"
OUTPUT = r"C:\Users\邓杰鹏\Desktop\毕设\毕设\毕设完整版.pdf"
JPEG_QUALITY = 88

orig_size = os.path.getsize(INPUT)
print(f"原始: {orig_size/1024/1024:.1f}MB | quality={JPEG_QUALITY}\n")

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
        save_mode = mode
        if mode in ("RGBA", "PA"):
            save_mode = "RGB"
            pil_img = pil_img.convert("RGB")
        elif mode == "P":
            pil_img = pil_img.convert("RGB")
            save_mode = "RGB"
        buf = io.BytesIO()
        pil_img.save(buf, format="JPEG", quality=JPEG_QUALITY,
                     optimize=True, progressive=False)
        new_data = buf.getvalue()
        if len(new_data) >= len(raw):
            continue
        verify = Image.open(io.BytesIO(new_data))
        if verify.size != (w, h):
            continue
        img_obj.write(new_data, filter=pikepdf.Name.DCTDecode)
        if fmt == "PNG":
            img_obj.put(pikepdf.Name.ColorSpace,
                        pikepdf.Name.DeviceGray if save_mode == "L" else pikepdf.Name.DeviceRGB)
        saved = len(raw) - len(new_data)
        saved_bytes += saved
        recompressed += 1
        print(f"  页{page_num}: {w}x{h} {mode} {len(raw)/1024:.0f}KB -> {len(new_data)/1024:.0f}KB")

# 先存到临时文件，再覆盖原文件
pdf.save(TMP, compress_streams=True,
         object_stream_mode=pikepdf.ObjectStreamMode.generate,
         normalize_content=True)
pdf.close()

# 用临时文件替换原文件
os.replace(TMP, INPUT)

final = os.path.getsize(INPUT)
print(f"\n重编码: {recompressed} 张 | 节省: {saved_bytes/1024/1024:.1f}MB")
print(f"最终: {final/1024/1024:.1f}MB", "OK!" if final < 30*1024**2 else f"差 {(final-30*1024**2)/1024**2:.1f}MB")
