"""Cut the magenta-keyed decor sheet into 12 transparent webp props.

Run from the mobile directory: python3 -I design/map/cut_decor.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SHEET = ROOT / "design" / "map" / "decor.png"
OUT_DIR = ROOT / "public" / "map"
NAMES = [
    "tree", "pine", "bush", "pond",
    "rock", "mushrooms", "chest", "chest-open",
    "coin-star", "coin-lock", "coin-check", "sign",
]
COLS, ROWS = 4, 3
CELL_W = 384
THRESH = 40  # magenta-ness below this stays opaque; raise if pink fringe remains
MAX_SIDE = 256


def build_alpha_and_despill(rgb):
    r, g, b = (rgb[..., i].astype(np.float32) for i in range(3))
    m = np.minimum(r, b) - g
    alpha = np.clip(255.0 - (m - THRESH) * 4.0, 0, 255)
    a = alpha / 255.0
    spill = m > 0
    r = np.where(spill, np.minimum(r, g + (r - g) * a), r)
    b = np.where(spill, np.minimum(b, g + (b - g) * a), b)
    out = np.stack([r, g, b, alpha], axis=-1)
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    rgb = np.asarray(Image.open(SHEET).convert("RGB"))
    rgba = build_alpha_and_despill(rgb)
    img = Image.fromarray(rgba, "RGBA")
    alpha = img.getchannel("A").filter(ImageFilter.MinFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.7))
    img.putalpha(alpha)

    W, H = img.size
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cell_h = H / ROWS
    a_full = np.asarray(img.getchannel("A"))
    row_edges = [0]
    for k in range(1, ROWS):
        nominal = round(k * cell_h)
        # cut in the empty band nearest the nominal line, so a prop poking over it stays whole
        empty = [y for y in range(max(1, nominal - 40), min(H - 1, nominal + 40))
                 if a_full[y].max() <= 16]
        cut = nominal
        if empty:
            runs, start = [], empty[0]
            for prev, cur in zip(empty, empty[1:] + [None]):
                if cur is None or cur != prev + 1:
                    runs.append((start, prev))
                    start = cur
            lo, hi = min(runs, key=lambda r: abs((r[0] + r[1]) / 2 - nominal))
            cut = round((lo + hi) / 2)
        row_edges.append(cut)
    row_edges.append(H)
    for idx, name in enumerate(NAMES):
        row, col = divmod(idx, COLS)
        x0, x1 = col * CELL_W, (col + 1) * CELL_W
        y0, y1 = row_edges[row], row_edges[row + 1]
        cell = img.crop((x0, y0, x1, y1))
        a = np.asarray(cell.getchannel("A"))
        ys, xs = np.nonzero(a > 16)
        if xs.size == 0:
            raise SystemExit(f"{name}: no visible pixels in cell")
        cell = cell.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        w, h = cell.size
        scale = MAX_SIDE / max(w, h)
        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        cell = cell.resize((nw, nh), Image.LANCZOS)
        cell.save(OUT_DIR / f"{name}.webp", "WEBP", quality=92)

    for name in NAMES:
        path = OUT_DIR / f"{name}.webp"
        with Image.open(path) as f:
            width, height = f.size
        print(f"{name} {width} {height} {path.stat().st_size}")


if __name__ == "__main__":
    main()
