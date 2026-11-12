"""Cuts the generated animation sheets into aligned, transparent sprite strips.

Usage: python3 cut_frames.py <sheets dir> <out dir>
Each sheet is 1536x1024: 8 frames in a 4x2 grid on a green screen. Output: <name>.webp, 8 frames side by side.

The image model does not place the duck at exactly the same spot in every cell, so each frame is
re-registered: its feet are centred on one x position and its lowest pixel sits on one ground line.
Frames listed in AIRBORNE keep their height above the ground line (the jump).
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

CELL_W, CELL_H = 384, 512
OUT_W, OUT_H = 320, 400          # frame size in the strip
GROUND, CENTRE = 384, 160        # where the feet land inside an output frame
SCALE = 0.80                     # cells are scaled down so a jump still fits above the duck
AIRBORNE = {'happy': {2, 3, 4}}  # frame indexes (0-based) where the duck is off the ground
# Sheets where the duck is cut off flat at a ledge: the cut sits on the frame's bottom edge, so the
# frame can be stood on top of a card, and frames line up on the whole body, not on feet.
LEDGE = {'peek'}

def key(img):
    """Green screen to alpha. The matte is shrunk by a pixel and softened, so no green-tinted or
    speckled pixels survive on the outline, and the fringe colour is pulled back to the duck's own."""
    a = np.asarray(img.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)                   # > 0 only on the screen and its fringe
    alpha = np.clip(255 - (greenness - 12) * 8, 0, 255).astype(np.uint8)
    matte = Image.fromarray(alpha, 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    g2 = np.where(greenness > 0, np.maximum(r, b), g)  # despill
    return Image.fromarray(np.dstack([r, g2, b, np.asarray(matte)]).astype(np.uint8), 'RGBA')

def feet(cell):
    """(x centre of the feet, lowest opaque row, x centre of the whole duck)."""
    a = np.asarray(cell)
    ys, xs = np.nonzero(a[..., 3] > 128)
    bottom, top = ys.max(), ys.min()
    band = ys > bottom - (bottom - top) * 0.12
    return xs[band].mean(), bottom, xs.mean()

def match_brand(keyed):
    """Gain-corrects the sheet's colours so its fur matches the brand cream; each sheet drifts in colour."""
    a = np.asarray(keyed).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fur = (a[..., 3] > 200) & (r > 215) & (g > 200) & (b > 170) & (r - b < 70)  # light, low-saturation fur
    gain = np.array([249, 238, 217], np.float32) / np.median(a[fur][:, :3], axis=0)  # #F9EED9 over measured fur
    a[..., :3] = np.clip(a[..., :3] * gain, 0, 255)
    return Image.fromarray(a.round().astype(np.uint8), 'RGBA')

def cut(sheet, name):
    keyed = key(Image.open(sheet))
    keyed = match_brand(keyed)
    cells = [keyed.crop((c * CELL_W, r * CELL_H, (c + 1) * CELL_W, (r + 1) * CELL_H)) for r in range(2) for c in range(4)]
    info = [feet(c) for c in cells]
    air = AIRBORNE.get(name, set())
    ground = OUT_H if name in LEDGE else GROUND
    strip = Image.new('RGBA', (OUT_W * len(cells), OUT_H))
    for i, (cell, (fx, bottom, cx)) in enumerate(zip(cells, info)):
        if i in air:
            # Keep the height the artist drew: measure it against the ground of the same row's grounded frames.
            row = [info[j][1] for j in range(len(cells)) if j // 4 == i // 4 and j not in air] or [bottom]
            lift, anchor = float(np.median(row)) - bottom, cx
        else:
            lift, anchor = 0.0, cx if name in LEDGE else fx
        small = cell.resize((round(CELL_W * SCALE), round(CELL_H * SCALE)), Image.LANCZOS)
        x = round(i * OUT_W + CENTRE - anchor * SCALE)
        y = round(ground - (bottom + 1 + lift) * SCALE)
        frame = Image.new('RGBA', (OUT_W, OUT_H))
        frame.alpha_composite(small, (x - i * OUT_W, y)) if 0 <= x - i * OUT_W else frame.alpha_composite(small.crop((i * OUT_W - x, 0, small.width, small.height)), (0, y))
        strip.alpha_composite(frame, (i * OUT_W, 0))
    return strip

if __name__ == '__main__':
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    for sheet in sorted(src.glob('*.png')):
        strip = cut(sheet, sheet.stem)
        strip.save(out / f'{sheet.stem}.webp', quality=90, method=6)
        print(sheet.stem, strip.size, (out / f'{sheet.stem}.webp').stat().st_size)
