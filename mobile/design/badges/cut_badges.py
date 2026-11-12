"""Cut the 4x3 badge sheet into 12 transparent WebP badges for public/badges/.

Run from the mobile directory: python3 -I design/badges/cut_badges.py
"""

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
MOBILE = os.path.dirname(os.path.dirname(HERE))
SHEET = os.path.join(HERE, "badges.png")
OUT_DIR = os.path.join(MOBILE, "public", "badges")

COLS, ROWS = 4, 3
NAMES = [
    "button", "text", "links", "color",
    "shape", "hover", "streak-1", "streak-3",
    "streak-7", "xp-50", "xp-100", "course",
]
ROW_PAD = 40
NEAR_WHITE = 235
THRESH = 30
CANVAS = 256
FIT = 240
MARKER = (0, 255, 0)
BLOCKER = (255, 0, 0)


def keep_largest_part(fg: np.ndarray) -> np.ndarray:
    """Keep only the largest 4-connected foreground part.

    The grid cut can clip the tops of the badges in the row below, so those fragments are dropped here.
    """
    h, w = fg.shape
    seen = np.zeros((h, w), dtype=bool)
    best: list[tuple[int, int]] = []
    for sy, sx in zip(*np.nonzero(fg)):
        if seen[sy, sx]:
            continue
        seen[sy, sx] = True
        stack = [(sy, sx)]
        part = []
        while stack:
            y, x = stack.pop()
            part.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < h and 0 <= nx < w and fg[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    stack.append((ny, nx))
        if len(part) > len(best):
            best = part
    keep = np.zeros((h, w), dtype=bool)
    if best:
        ys, xs = zip(*best)
        keep[list(ys), list(xs)] = True
    return keep


def remove_background(cell: Image.Image) -> Image.Image:
    """Return the cell as RGBA with the white background made transparent."""
    rgb = cell.convert("RGB")
    arr = np.asarray(rgb)
    near_white = (arr > NEAR_WHITE).all(axis=2)

    # Non-white pixels become a blocker colour, so the flood fill can only spread through near-white pixels.
    work = Image.new("RGB", rgb.size, BLOCKER)
    work.paste(rgb, mask=Image.fromarray((near_white * 255).astype(np.uint8)))

    w, h = work.size
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if work.getpixel(corner) != BLOCKER:
            ImageDraw.floodfill(work, corner, MARKER, thresh=THRESH)

    filled = np.asarray(work) == np.array(MARKER, dtype=np.uint8)
    body = keep_largest_part(~filled.all(axis=2))
    alpha = np.where(body, 255, 0).astype(np.uint8)

    alpha_img = Image.fromarray(alpha, mode="L")
    alpha_img = alpha_img.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))

    out = rgb.convert("RGBA")
    out.putalpha(alpha_img)
    return out


def fit_square(badge: Image.Image) -> Image.Image:
    """Trim to the visible bounds, then centre on a transparent square, keeping the aspect ratio."""
    bbox = badge.getchannel("A").getbbox()
    badge = badge.crop(bbox)
    w, h = badge.size
    scale = FIT / max(w, h)
    size = (max(1, round(w * scale)), max(1, round(h * scale)))
    # Premultiplied resize, so transparent pixels do not bleed their colour into the edges.
    scaled = badge.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.paste(scaled, ((CANVAS - size[0]) // 2, (CANVAS - size[1]) // 2))
    return canvas


def main() -> None:
    sheet = Image.open(SHEET).convert("RGB")
    sheet_w, sheet_h = sheet.size
    cell_w = sheet_w // COLS
    os.makedirs(OUT_DIR, exist_ok=True)

    for index, name in enumerate(NAMES):
        row, col = divmod(index, COLS)
        # Pad the row band: some badges reach past the nominal row line, and keep_largest_part drops the spill.
        y0 = max(0, row * sheet_h // ROWS - ROW_PAD)
        y1 = min(sheet_h, (row + 1) * sheet_h // ROWS + ROW_PAD)
        cell = sheet.crop((col * cell_w, y0, (col + 1) * cell_w, y1))
        badge = fit_square(remove_background(cell))
        path = os.path.join(OUT_DIR, f"{name}.webp")
        badge.save(path, "WEBP", quality=92)
        print(f"{name}.webp {os.path.getsize(path)} bytes")


if __name__ == "__main__":
    main()
