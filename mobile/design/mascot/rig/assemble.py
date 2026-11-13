"""Puts the duck back together from the parts sheet.

Usage: python3 assemble.py <partmap.json> <out.svg> [pose]
partmap.json holds each part's element indexes in parts.svg and its bounding box there (measured in
Chrome with getBoundingClientRect). LAYOUT below places each part's box in duck space (36 x 40
units, origin top-left); the order of LAYOUT is the drawing order, back to front.

`pose` picks which alternative is shown where parts swap (wing, eyes, mouth):
rest (default), wave, cheer, happy, blink, talk. `all` draws every part and also writes
<out>.parts.json, the part each shape belongs to in order, for build_rig.py.
"""
import json, re, sys

here = __file__.rsplit('/', 1)[0]
pm = json.load(open(sys.argv[1]))
out = sys.argv[2]
pose = sys.argv[3] if len(sys.argv) > 3 else 'rest'
els = re.findall(r'<(?:path|ellipse|circle)\b[^>]*/>', open(f'{here}/parts.svg').read())

# Laid out to match the brand duck (design/mascot/sheets): a big round head about as wide as the
# body, small solid black eyes about a fifth of the head's height, the bill reaching just past the
# head's edge, short chunky legs, and the wing folded into the body at rest (so no rest wing part).
HEAD = (7.5, 0.5)
# The sheet's bills come out about 15% larger than the brand duck's (measured against the duck's height).
BILL = 0.93
BILL_RIGHT = 15.4
# part -> scale, about its box's top-left. Parts not listed keep the sheet's size.
SCALE = ({p: 0.8 for p in ('openL', 'openR', 'sleepyL', 'sleepyR')} | {p: 0.85 for p in ('lidHappyL', 'lidHappyR', 'lidBlinkL', 'lidBlinkR')}
         | {m: BILL for m in ('mClosed', 'mSlight', 'mWide', 'mO', 'mSmile')})
# Eye centres in duck space; every eye part is centred on them.
EYE = {'L': (10.7, 11.0), 'R': (17.6, 11.5)}
def at_eye(part, side, dy=0.0):
    _, _, bw, bh = pm['bbox'][part]
    s = SCALE.get(part, 1)
    return (EYE[side][0] - bw * s / 2, EYE[side][1] - bh * s / 2 + dy)

def with_head(part):
    """Parts drawn attached to the head on the sheet keep their place relative to it."""
    hx, hy = pm['bbox']['head'][:2]
    px, py = pm['bbox'][part][:2]
    return (HEAD[0] + px - hx, HEAD[1] + py - hy)
# Each mouth drawing places its upper bill slightly differently, so lining them up by their boxes made the
# whole beak jump on every swap. They are lined up on the nostril dot instead: the upper bill stays put and
# only the jaw and mouth change. Nostril centre per mouth, in sheet coordinates.
NOSTRIL = {'mClosed': (7.808, 55.43), 'mSlight': (25.84, 55.35), 'mWide': (43.35, 54.53), 'mO': (60.16, 55.19), 'mSmile': (78.47, 55.33)}
def under_bill(part):
    """Places a mouth so its nostril lands where the closed bill's does (the closed bill's top-right
    corner sits at BILL_RIGHT, 11.4, where the bill meets the face)."""
    cx, cy, cw, _ = pm['bbox']['mClosed']
    nx = BILL_RIGHT - cw * BILL + (NOSTRIL['mClosed'][0] - cx) * BILL
    ny = 11.4 + (NOSTRIL['mClosed'][1] - cy) * BILL
    bx, by = pm['bbox'][part][:2]
    return (nx - (NOSTRIL[part][0] - bx) * BILL, ny - (NOSTRIL[part][1] - by) * BILL)

# Single elements to enlarge, as SVG transforms in sheet coordinates. The sleepy lids (elements 31 and 34)
# are drawn a hair smaller than the black eye under them, which left a black rim around the lid; grown
# 20% about the middle of their bottom edge, they cover it.
GROW = {31: 'translate(70.4 46.84) scale(1.2) translate(-70.4 -46.84)',
        34: 'translate(78.19 46.84) scale(1.2) translate(-78.19 -46.84)'}

# part -> (x, y) of its bounding box's top-left in duck space. The order is the drawing order.
LAYOUT = {
    'tail':      (23.0, 19.3),   # base tucked behind the body's notch so its cut edge never shows
    'legL':      (13.0 - 7.8, 29.9),   # each leg's stub centre lands on its hip
    'legR':      (19.5 - 3.3, 29.9),
    'body':      (6.1, 18.3),   # low enough to leave the chin and a slight neck, like the brand duck
    'head':      HEAD,
    'tuft':      with_head('tuft'),
    'openL':     at_eye('openL', 'L'),
    'openR':     at_eye('openR', 'R'),
    'sleepyL':   at_eye('sleepyL', 'L'),
    'sleepyR':   at_eye('sleepyR', 'R'),
    'lidHappyL': at_eye('lidHappyL', 'L', 0.3),
    'lidHappyR': at_eye('lidHappyR', 'R', 0.3),
    'lidBlinkL': at_eye('lidBlinkL', 'L', 0.5),
    'lidBlinkR': at_eye('lidBlinkR', 'R', 0.5),
    **{m: under_bill(m) for m in ('mClosed', 'mSlight', 'mWide', 'mO', 'mSmile')},
}
# Raised wings go behind the head, so the bill and face always stay on top. They are mirrored to fan
# outward; the shoulder (box's bottom-right after mirroring) sits at SHOULDER, turned by the degrees given.
SHOULDER = (10.0, 25.3)
RAISED = {w: (SHOULDER[0] - pm['bbox'][w][2], SHOULDER[1] - pm['bbox'][w][3], turn)
          for w, turn in (('wingHalf', -4), ('wingUp', 8), ('wingCheer', 24))}
order = list(LAYOUT)
i = order.index('head')
LAYOUT = {k: (RAISED | LAYOUT)[k] for k in order[:i] + list(RAISED) + order[i:]}
MIRROR = {'wingHalf', 'wingUp', 'wingCheer'}  # drawn fanning right; the duck faces left, so they wave outward

SHOW = {
    'rest':  {'openL', 'openR', 'mClosed'},
    'wave':  {'wingUp', 'openL', 'openR', 'mSmile'},
    'sad':   {'sleepyL', 'sleepyR', 'mSlight'},
    'all':   set(LAYOUT),
    'cheer': {'wingCheer', 'lidHappyL', 'lidHappyR', 'mWide'},
    'happy': {'wingHalf', 'lidHappyL', 'lidHappyR', 'mSmile'},
    'blink': {'lidBlinkL', 'lidBlinkR', 'mClosed'},
    'talk':  {'wingHalf', 'openL', 'openR', 'mO'},
}[pose]
ALWAYS = {'tail', 'legL', 'legR', 'body', 'head', 'tuft'}

groups, order = [], []
for part, (x, y, *turn) in LAYOUT.items():
    if part not in ALWAYS and part not in SHOW:
        continue
    bx, by, bw, bh = pm['bbox'][part]
    body = ''.join(f'<g transform="{GROW[i]}">{els[i - 1]}</g>' if i in GROW else els[i - 1] for i in pm['parts'][part])
    if part in MIRROR:
        t = f'translate({x + bw} {y}) scale(-1 1) translate({-bx} {-by})'
        if turn:
            t = f'rotate({turn[0]} {SHOULDER[0]} {SHOULDER[1]}) ' + t
    else:
        t = f'translate({x} {y}) scale({SCALE.get(part, 1)}) translate({-bx} {-by})'
    groups.append(f'<g id="{part}" transform="{t}">{body}</g>')
    order += [part] * len(pm['parts'][part])

open(out, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 40" width="360" height="400">{"".join(groups)}</svg>')
if pose == 'all':
    json.dump(order, open(out + '.parts.json', 'w'))
