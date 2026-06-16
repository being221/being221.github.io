import pikepdf, io, os
from PIL import Image

INPUT = r"C:\Users\邓杰鹏\Desktop\毕设\毕设\邓杰鹏全套图纸.pdf"
TMP = INPUT.replace(".pdf", "_tmp.pdf")
Q = 88

orig = os.path.getsize(INPUT)
print(f"原始: {orig/1024/1024:.1f}MB | quality={Q}\n")

pdf = pikepdf.open(INPUT)
n = saved = 0

for pn, page in enumerate(pdf.pages, 1):
    for name, obj in page.images.items():
        try:
            raw = obj.read_raw_bytes()
        except:
            continue
        if len(raw) < 10240:
            continue
        try:
            img = Image.open(io.BytesIO(raw))
        except:
            continue
        fmt = (img.format or "").upper()
        w, h = img.size
        mode = img.mode
        if fmt not in ("JPEG", "PNG") or (fmt == "PNG" and len(raw) <= 51200):
            continue
        sm = mode
        if mode in ("RGBA", "PA"):
            sm = "RGB"; img = img.convert("RGB")
        elif mode == "P":
            sm = "RGB"; img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=Q, optimize=True, progressive=False)
        d = buf.getvalue()
        if len(d) >= len(raw):
            continue
        v = Image.open(io.BytesIO(d))
        if v.size != (w, h):
            continue
        obj.write(d, filter=pikepdf.Name.DCTDecode)
        if fmt == "PNG":
            obj.put(pikepdf.Name.ColorSpace, pikepdf.Name.DeviceGray if sm == "L" else pikepdf.Name.DeviceRGB)
        saved += len(raw) - len(d)
        n += 1
        print(f"  页{pn}: {w}x{h} {mode} {len(raw)/1024:.0f}KB -> {len(d)/1024:.0f}KB")

pdf.save(TMP, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate, normalize_content=True)
pdf.close()
os.replace(TMP, INPUT)
print(f"\n重编码: {n} 张 | 节省: {saved/1024/1024:.1f}MB | 最终: {os.path.getsize(INPUT)/1024/1024:.1f}MB")
