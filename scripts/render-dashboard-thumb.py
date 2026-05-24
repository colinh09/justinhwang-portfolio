"""
One-off: render the Risk Register Revamp dashboard PDF to a PNG sized
for the tech project card thumbnail.

The card uses `object-fit: cover` on a 16:9 box, so it crops the image
to fit. No need to pre-pad to exact 16:9 — render at the PDF's native
aspect and let the card do the fitting. This keeps the dashboard
content edge-to-edge with a tiny top/bottom crop (~5px each at typical
card widths), and no visible swatch bars.
"""
import io
from pathlib import Path

import fitz
from PIL import Image

PDF = Path(r"c:\Users\jkhbu\OneDrive\Projects\powerbi\risk_register\archive\PDFViewforClaude.pdf")
OUT = Path(__file__).resolve().parent.parent / "public" / "images" / "projects" / "technical" / "riskregister-revamp1.png"
SCALE = 2.0

doc = fitz.open(PDF)
page = doc[0]
pix = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), alpha=False)

img = Image.open(io.BytesIO(pix.tobytes("png")))

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, format="PNG", optimize=True)

w, h = img.size
print(f"wrote {OUT}")
print(f"size {w}x{h} (ratio {w/h:.4f}) — let card's object-fit: cover handle the 16:9 fit")
print(f"file size: {OUT.stat().st_size / 1024:.1f} KB")
