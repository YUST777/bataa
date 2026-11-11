"""Builds the Rive scene spec for the Bataa duck from the imported SVG fragment.

Usage: python3 build_duck_scene.py <duck.scene.json from riv_import_svg> <out args.json> <out duck.riv>
The output is the argument file for rive-mcp-server's `riv_create` tool.

Method (Duolingo's viseme post, Rive mascot write-ups, and the code-built Kabi mascot):
- the face is split into parts that move on their own: eyelids, eye shine, brows, upper bill, jaw
- the state machine has parallel layers, so behaviours combine instead of replacing each other:
  Body, Blink, Face, Mouth, LookX, LookY
- each layer owns its properties, and every animation in a layer keys all of them ("padding"),
  so a blend between two states never leaves a stale value behind
- motion has anticipation, overshoot and follow-through; parts lag the body by a few frames
"""
import copy, json, sys

frag, out_args, out_riv = sys.argv[1:4]
K, OX, OY = 5, 0, 50          # SVG is 80x80; artboard is 400x450 with headroom for the hop
W, H = 400, 450
FUR, FUR_SHADE, BILL_LOW, MOUTH, LASH = '#F9EED9', '#DCC6A6', '#EF6807', '#7A2A05', '#3A2A1E'
src = {s['id']: s for s in json.load(open(frag))['shapes']}

def pt(x, y): return (x * K + OX, y * K + OY)

# ---------------------------------------------------------------- rig
# group id -> (parent, pivot in SVG units). A pivot is the joint the part turns or scales about.
RIG = {
    'root':    (None,    (41, 75.5)),     # ground point: hop and squash
    'footL':   ('root',  (35.5, 63.5)),
    'footR':   ('root',  (50, 63.5)),
    'torso':   ('root',  (42, 62)),       # breathing
    'wing':    ('torso', (27, 43)),       # shoulder
    'head':    ('torso', (40, 38)),       # neck
    'eyeL':    ('head',  (27.73, 22.98)),
    'eyeR':    ('head',  (43.22, 24.16)),
    'shineL':  ('eyeL',  (27.77, 21.4)),
    'shineR':  ('eyeR',  (42.69, 22.32)),
    'bill':    ('head',  (36.5, 29)),     # hinge where the bill meets the face
    'gape':    ('bill',  (36.5, 29)),     # dark inside of the mouth, turns half as far as the jaw
    'jaw':     ('bill',  (36.5, 29)),
    'billTop': ('bill',  (36.5, 29)),
}
ABS = {g: pt(*p) for g, (_, p) in RIG.items()}
REST = {}                                  # id -> rest (x, y) relative to its parent
groups = []
for g, (parent, _) in RIG.items():
    px, py = ABS[parent] if parent else (0, 0)
    REST[g] = (ABS[g][0] - px, ABS[g][1] - py)
    groups.append({'id': g, 'x': REST[g][0], 'y': REST[g][1], **({'parent': parent} if parent else {})})

def art(shape_id, parent, new_id=None, clip=None, fill=None, no_fill=False, grow=1.0):
    """A shape from the SVG, scaled to the artboard and re-parented to a joint."""
    s = copy.deepcopy(src[shape_id])
    ax, ay = pt(s['x'], s['y'])
    s['x'], s['y'] = ax - ABS[parent][0], ay - ABS[parent][1]
    for sub in s['subpaths']:
        for p in sub['points']:
            p['x'] *= K * grow; p['y'] *= K * grow
            c = p.get('cubic')
            if c:
                c['inDistance'] *= K * grow; c['outDistance'] *= K * grow
    s['id'] = new_id or shape_id
    s['parent'] = parent
    if clip: s['clipBy'] = clip
    if fill: s['fill'] = {'color': fill}
    if no_fill: s.pop('fill', None)
    return s

def prim(sid, kind, parent, x, y, w, h, fill=None, **extra):
    """A simple shape positioned relative to its parent joint (px). Remembered so it can be animated."""
    REST[sid] = (x, y)
    return {'id': sid, 'type': kind, 'parent': parent, 'x': x, 'y': y, 'width': w, 'height': h,
            **({'fill': {'color': fill}} if fill else {}), **extra}

def svg_prim(sid, kind, parent, cx, cy, w, h, **extra):
    ax, ay = pt(cx, cy)
    return prim(sid, kind, parent, ax - ABS[parent][0], ay - ABS[parent][1], w * K, h * K, **extra)

# Eyelids are fur-coloured discs clipped to the eye, so they can only ever show inside it.
# R is the disc radius; a lid parked R + GAP away from the eye centre is fully out of sight.
LID = {'L': {'r': 22, 'park': 42}, 'R': {'r': 27, 'park': 50}}
def eye(side, black, shine):
    e, r, park = f'eye{side}', LID[side]['r'], LID[side]['park']
    clip = f'eyeClip{side}'
    return [
        # The clip is a touch larger than the eye so a closed lid also hides the eye's soft edge.
        art(black, e, clip, no_fill=True, grow=1.14),
        art(black, e),
        art(shine, f'shine{side}'),
        prim(f'lidLow{side}', 'ellipse', e, 0, park, 2 * r, 2 * r, FUR, clipBy=clip),    # rises for a smile
        prim(f'lidMood{side}', 'ellipse', e, 0, -park, 2 * r, 2 * r, FUR, clipBy=clip),  # droops for sad, sleepy
        prim(f'lidBlink{side}', 'ellipse', e, 0, -park, 2 * r, 2 * r, FUR, clipBy=clip),
        # The line a shut eye leaves. Only shown while the blink lid is down.
        prim(f'lash{side}', 'rect', e, 0, 5, r * 1.15, 3.2, LASH, cornerRadius=2, opacity=0, rotation=-6 if side == 'L' else -4),
    ]

# dp12 is head and body in one path. It is drawn twice: once clipped to the head (moves with the
# neck) and once clipped to the body. The copies overlap at the neck, so a tilt shows no seam.
shapes = [
    svg_prim('clipHead', 'ellipse', 'head', 40.5, 20.5, 42, 41.6),
    svg_prim('clipBody', 'rect', 'torso', 40, 52.3, 70, 29.4),
    *[art(f'dp{i}', 'footL') for i in range(0, 5)],
    *[art(f'dp{i}', 'footR') for i in range(5, 9)],
    *[art(f'dp{i}', 'wing') for i in range(9, 12)],
    art('dp12', 'torso', 'bodyFill', 'clipBody'),
    art('dp13', 'torso', 'bodyShadeA', 'clipBody'),
    art('dp14', 'torso', 'bodyShadeB'),
    art('dp12', 'head', 'headFill', 'clipHead'),
    art('dp13', 'head', 'headShade', 'clipHead'),
    art('dp15', 'head'),
    # Brows are invisible at rest (the brand duck has none) and fade in for expressions.
    svg_prim('browL', 'rect', 'head', 27.4, 16.6, 6.2, 1.5, fill=FUR_SHADE, cornerRadius=4, opacity=0),
    svg_prim('browR', 'rect', 'head', 43.6, 16.9, 8, 1.7, fill=FUR_SHADE, cornerRadius=4, opacity=0),
    *eye('L', 'dp16', 'dp17'),
    *eye('R', 'dp18', 'dp19'),
    # Bill, back to front: mouth inside, lower jaw, upper bill, then the jaw's lip line on top.
    art('dp20', 'gape', 'mouthInside', fill=MOUTH),
    art('dp20', 'jaw', 'jawFill', fill=BILL_LOW),
    art('dp20', 'billTop'),
    art('dp23', 'billTop'),
    art('dp21', 'jaw'),
    art('dp22', 'jaw'),
]

# ---------------------------------------------------------------- animation helpers
BACK, OUT, IN = 'ease-out-back', 'ease-out', 'ease-in'
ABSOLUTE = {'scaleX': 1, 'scaleY': 1, 'opacity': 0, 'rotation': 0}

def track(target, prop, *keys):
    """keys: (frame, value[, easing]). x and y are offsets from rest; everything else is absolute.
    An easing describes the motion arriving at its key. Default: ease-in-out."""
    base = {'x': REST[target][0], 'y': REST[target][1]}.get(prop, 0)
    frames = []
    for i, key in enumerate(keys):
        frame, value, *ease = key
        k = {'frame': frame, 'value': base + value}
        if i: k['easing'] = ease[0] if ease else 'ease-in-out'
        frames.append(k)
    return {'target': target, 'property': prop, 'keyframes': frames}

def both(prefix, prop, *keys, scale=None):
    """The same track on the left and right part. `scale` maps a 0..1 key to each side's own distance."""
    out = []
    for side in 'LR':
        ks = [(f, v * scale[side], *e) for f, v, *e in keys] if scale else keys
        out.append(track(f'{prefix}{side}', prop, *ks))
    return out

LID_TRAVEL = {s: LID[s]['park'] for s in 'LR'}          # 1.0 = fully closed
def lid(kind, *keys):
    """Lid keys run 0 (open) to 1 (closed). Upper lids travel down, the lower lid travels up."""
    sign = -1 if kind == 'lidLow' else 1
    return both(kind, 'y', *keys, scale={s: sign * LID_TRAVEL[s] for s in 'LR'})

def anim(name, duration, loop, tracks, owned):
    """Pads the animation: any property its layer owns but it does not move is keyed at rest."""
    have = {(t['target'], t['property']) for t in tracks}
    for target, prop in owned:
        if (target, prop) not in have:
            rest = ABSOLUTE.get(prop, 0)
            tracks.append(track(target, prop, (0, rest), (duration, rest)))
    return {'name': name, 'fps': 60, 'duration': duration, 'loop': loop, 'tracks': tracks}

def pose(name, tracks, owned):
    """A held pose: one frame, used as a viseme, a look target or a blend endpoint."""
    return anim(name, 2, 'loop', [track(t['target'], t['property'], (0, v), (2, v)) for t, v in tracks], owned)
def p(target, prop, value): return ({'target': target, 'property': prop}, value)

def props(targets, names): return [(t, n) for t in targets for n in names]

# ---------------------------------------------------------------- layer: Body
BODY = [*props(['root'], ['y', 'rotation', 'scaleX', 'scaleY']), *props(['torso'], ['scaleX', 'scaleY']),
        *props(['head'], ['y', 'rotation']), ('wing', 'rotation'), ('footL', 'rotation'), ('footR', 'rotation')]
body = [
    # Breathing peaks at 50%, head sway at 30% and 75%, wing at 62%: no two tracks peak together.
    anim('idle', 240, 'loop', [
        track('torso', 'scaleY', (0, 1), (120, 1.035), (240, 1)),
        track('torso', 'scaleX', (0, 1), (120, 0.985), (240, 1)),
        track('head', 'y', (0, 0), (132, -2.5), (240, 0)),
        track('head', 'rotation', (0, 0), (72, -2.5), (180, 1.6), (240, 0)),
        track('wing', 'rotation', (0, 0), (150, 6), (240, 0)),
    ], BODY),
    anim('think', 180, 'loop', [
        track('head', 'rotation', (0, -9), (72, -11.5), (180, -9)),
        track('head', 'y', (0, -1), (104, -3), (180, -1)),
        track('torso', 'scaleY', (0, 1), (108, 1.03), (180, 1)),
        track('torso', 'scaleX', (0, 1), (108, 0.988), (180, 1)),
        track('wing', 'rotation', (0, 9), (96, 9), (103, 17, OUT), (111, 9, IN), (119, 16, OUT), (128, 9, IN), (180, 9)),
    ], BODY),
    # Speaking: the head nods on the syllables, a beat after the bill (which lives in the Mouth layer).
    anim('speak', 96, 'loop', [
        track('head', 'y', (0, 0), (8, -4, OUT), (15, 0, IN), (22, -2, OUT), (28, 0, IN), (37, -5, OUT), (46, 0, IN), (55, -3, OUT), (64, 0, IN), (96, 0)),
        track('head', 'rotation', (0, 0), (10, -4, OUT), (30, 3), (40, -5, OUT), (62, 2), (84, 0), (96, 0)),
        track('torso', 'scaleY', (0, 1), (9, 1.03, OUT), (18, 0.995), (38, 1.035, OUT), (50, 0.995), (96, 1)),
        track('wing', 'rotation', (0, 0), (30, -5, OUT), (42, 16, BACK), (60, 12), (80, 0), (96, 0)),
    ], BODY),
    # Wing dips first, swings up past its mark, then each wave is smaller than the last.
    anim('wave', 108, 'oneShot', [
        track('wing', 'rotation', (0, 0), (7, -9, OUT), (19, 32, BACK), (31, 6), (43, 28), (55, 8), (67, 22), (84, -4, IN), (98, 0, OUT), (108, 0)),
        track('torso', 'scaleY', (0, 1), (6, 0.97, OUT), (18, 1.04, BACK), (40, 1.01), (108, 1)),
        track('torso', 'scaleX', (0, 1), (6, 1.025, OUT), (18, 0.975, BACK), (40, 0.995), (108, 1)),
        track('root', 'rotation', (0, 0), (22, 3, OUT), (76, 3), (100, 0, BACK), (108, 0)),
        track('head', 'rotation', (0, 0), (9, 2, OUT), (24, -8, BACK), (74, -7), (94, 1.5, IN), (106, 0, OUT), (108, 0)),
        track('head', 'y', (0, 0), (9, 2, OUT), (24, -3, BACK), (74, -2), (104, 0), (108, 0)),
    ], BODY),
    # Crouch, stretch on take-off, hang, squash on landing, one small rebound, settle.
    anim('correct', 102, 'oneShot', [
        track('root', 'scaleY', (0, 1), (10, 0.84, OUT), (15, 1.1, OUT), (26, 1.03), (39, 1.07, IN), (44, 0.87, OUT), (51, 1.05, OUT), (58, 1.01), (66, 0.95, IN), (76, 1.025, BACK), (88, 1), (102, 1)),
        track('root', 'scaleX', (0, 1), (10, 1.14, OUT), (15, 0.93, OUT), (26, 0.98), (39, 0.95, IN), (44, 1.12, OUT), (51, 0.96, OUT), (58, 0.99), (66, 1.04, IN), (76, 0.985, BACK), (88, 1), (102, 1)),
        track('root', 'y', (0, 0), (10, 0), (27, -64, OUT), (41, 0, IN), (44, 0), (55, -20, OUT), (65, 0, IN), (102, 0)),
        track('root', 'rotation', (0, 0), (10, 2, OUT), (24, -5, OUT), (41, 3), (52, -2), (66, 1), (82, 0, BACK), (102, 0)),
        track('wing', 'rotation', (0, 0), (9, -12, OUT), (20, 44, BACK), (33, 20), (41, 38, IN), (48, 4, OUT), (58, 26, OUT), (69, -5, IN), (84, 0, BACK), (102, 0)),
        track('head', 'y', (0, 0), (12, 6, OUT), (19, -5, OUT), (30, 0), (46, 7, OUT), (56, -3, OUT), (70, 3), (84, 0, BACK), (102, 0)),
        track('head', 'rotation', (0, 0), (12, 4, OUT), (22, -10, BACK), (40, -6), (47, 6, OUT), (60, -3), (74, 1.5), (90, 0, OUT), (102, 0)),
        track('footL', 'rotation', (0, 0), (12, -6, OUT), (22, 26, OUT), (38, 4, IN), (44, 0, OUT), (54, 12, OUT), (65, 0, IN), (102, 0)),
        track('footR', 'rotation', (0, 0), (12, 6, OUT), (24, -26, OUT), (39, -4, IN), (44, 0, OUT), (56, -12, OUT), (65, 0, IN), (102, 0)),
    ], BODY),
    # A small startled lift, then the body sags and the head follows it down. Recovery runs body first.
    anim('wrong', 120, 'oneShot', [
        track('torso', 'scaleY', (0, 1), (6, 1.04, OUT), (22, 0.93), (30, 0.95, OUT), (84, 0.95), (100, 1.02, BACK), (112, 1), (120, 1)),
        track('torso', 'scaleX', (0, 1), (6, 0.975, OUT), (22, 1.05), (30, 1.035, OUT), (84, 1.035), (100, 0.99, BACK), (112, 1), (120, 1)),
        track('head', 'y', (0, 0), (7, -4, OUT), (27, 10), (35, 8, OUT), (88, 8), (106, -1.5, BACK), (116, 0), (120, 0)),
        track('head', 'rotation', (0, 0), (7, -4, OUT), (27, 14), (35, 12, OUT), (56, 12), (63, 8.5), (71, 13.5), (79, 12, OUT), (89, 12), (107, -2, BACK), (117, 0), (120, 0)),
        track('wing', 'rotation', (0, 0), (8, 10, OUT), (32, -30), (41, -25, OUT), (92, -25), (110, 3, BACK), (120, 0)),
    ], BODY),
]

# ---------------------------------------------------------------- layer: Blink (runs on its own, always)
BLINK = [*props(['lidBlinkL', 'lidBlinkR'], ['y']), *props(['lashL', 'lashR'], ['opacity'])]
def blink_keys(at): return [(at, 0), (at + 4, 1, IN), (at + 11, 0, OUT)]
def lash_keys(at): return [(at + 2, 0), (at + 4, 1), (at + 6, 1), (at + 8, 0)]
BLINKS = (96, 268, 283)
blink = [anim('blink', 420, 'loop', [
    *lid('lidBlink', (0, 0), *[k for at in BLINKS for k in blink_keys(at)], (420, 0)),
    *both('lash', 'opacity', (0, 0), *[k for at in BLINKS for k in lash_keys(at)], (420, 0)),
], BLINK)]

# ---------------------------------------------------------------- layer: Face (expression)
FACE = [*props(['lidLowL', 'lidLowR', 'lidMoodL', 'lidMoodR'], ['y']), *props(['browL', 'browR'], ['y', 'rotation', 'opacity']),
        *props(['eyeL', 'eyeR'], ['scaleX', 'scaleY'])]
face = [
    anim('faceNeutral', 2, 'loop', [], FACE),
    # Eyes pop wide on the crouch, then the lower lids rise into smiling arcs for the whole hop.
    anim('faceHappy', 102, 'oneShot', [
        *both('eye', 'scaleY', (0, 1), (8, 1.14, OUT), (18, 1, OUT), (102, 1)),
        *both('eye', 'scaleX', (0, 1), (8, 1.08, OUT), (18, 1, OUT), (102, 1)),
        *lid('lidLow', (0, 0), (10, 0), (19, 0.44, BACK), (70, 0.44), (86, 0, OUT), (102, 0)),
    ], FACE),
    # Startled wide eyes for a beat, then heavy lids and worried brows. One slow blink while it sinks in.
    anim('faceSad', 120, 'oneShot', [
        *both('eye', 'scaleY', (0, 1), (6, 1.16, OUT), (22, 1), (120, 1)),
        *lid('lidMood', (0, 0), (8, 0), (30, 0.5), (50, 0.5), (56, 0.9, IN), (68, 0.5, OUT), (92, 0.5), (110, 0, OUT), (120, 0)),
        *both('brow', 'opacity', (0, 0), (10, 0), (26, 1, OUT), (94, 1), (110, 0), (120, 0)),
        track('browL', 'rotation', (0, 0), (10, 0), (28, -16, BACK), (94, -16), (112, 0), (120, 0)),
        track('browR', 'rotation', (0, 0), (10, 0), (30, 14, BACK), (94, 14), (112, 0), (120, 0)),
        *both('brow', 'y', (0, 0), (10, 0), (28, 4, OUT), (94, 4), (112, 0), (120, 0)),
    ], FACE),
    # One brow up, the other level, lids a little lowered: the classic "hmm".
    anim('faceThink', 180, 'loop', [
        *both('brow', 'opacity', (0, 1), (180, 1)),
        track('browR', 'y', (0, -5), (90, -7), (180, -5)),
        track('browR', 'rotation', (0, -10), (90, -13), (180, -10)),
        track('browL', 'y', (0, 2), (180, 2)),
        track('browL', 'rotation', (0, 5), (180, 5)),
        *lid('lidMood', (0, 0.26), (60, 0.32), (180, 0.26)),
    ], FACE),
]

# ---------------------------------------------------------------- layer: Mouth (speech and visemes)
MOUTH_PROPS = [('jaw', 'rotation'), ('gape', 'rotation'), ('billTop', 'rotation'), ('bill', 'scaleX'), ('bill', 'scaleY')]
def mouth(open_, wide=1.0):
    """open_: jaw angle in degrees. The inside turns half as far; the upper bill lifts a little."""
    return [p('jaw', 'rotation', -open_), p('gape', 'rotation', -open_ * 0.5), p('billTop', 'rotation', open_ * 0.22),
            p('bill', 'scaleX', wide), p('bill', 'scaleY', 1)]
def jaw_keys(*keys):
    return [track('jaw', 'rotation', *[(f, -v, *e) for f, v, *e in keys]),
            track('gape', 'rotation', *[(f, -v * 0.5, *e) for f, v, *e in keys]),
            track('billTop', 'rotation', *[(f, v * 0.22, *e) for f, v, *e in keys])]

# Visemes, selected with the `mouthShape` number input. A duck bill has fewer shapes than a human mouth.
VISEMES = {1: ('visA', mouth(24, 1.0)),     # A, I: wide open
           2: ('visE', mouth(11, 1.06)),    # E: half open, stretched
           3: ('visO', mouth(17, 0.9)),     # O, U: open, narrowed
           4: ('visM', mouth(0, 0.97)),     # M, B, P: pressed shut
           5: ('visF', mouth(5, 1.03))}     # F, V, L and other small shapes
mouth_anims = [
    pose('mouthRest', mouth(0), MOUTH_PROPS),
    # Stand-in speech for when there is no audio: syllables that differ in size and spacing.
    anim('mouthTalk', 96, 'loop', jaw_keys((0, 0), (6, 22, OUT), (13, 2, IN), (20, 12, OUT), (26, 0, IN), (35, 25, OUT), (44, 3, IN), (53, 15, OUT), (61, 0, IN), (96, 0)), MOUTH_PROPS),
    anim('mouthHappy', 102, 'oneShot', [*jaw_keys((0, 0), (10, 0), (19, 24, BACK), (64, 20), (82, 0, OUT), (102, 0)),
                                         track('bill', 'scaleX', (0, 1), (19, 1.06, BACK), (64, 1.05), (82, 1), (102, 1))], MOUTH_PROPS),
    anim('mouthSad', 120, 'oneShot', [*jaw_keys((0, 0), (6, 9, OUT), (22, 0), (120, 0)),
                                       track('bill', 'scaleX', (0, 1), (28, 0.95), (92, 0.95), (110, 1), (120, 1))], MOUTH_PROPS),
    *[pose(name, tracks, MOUTH_PROPS) for name, tracks in VISEMES.values()],
]

# ---------------------------------------------------------------- layers: LookX, LookY (gaze, 1D blends)
# The eyes travel furthest, their shine a little more, the bill follows: parallax that reads as a head turn.
LOOKX = props(['eyeL', 'eyeR', 'shineL', 'shineR', 'bill'], ['x'])
LOOKY = props(['eyeL', 'eyeR', 'shineL', 'shineR', 'bill'], ['y'])
def look(name, prop, amount, owned):
    return pose(name, [p('eyeL', prop, 6 * amount), p('eyeR', prop, 7 * amount), p('shineL', prop, 1.4 * amount),
                       p('shineR', prop, 1.6 * amount), p('bill', prop, 5 * amount)], owned)
look_anims = [look('lookLeft', 'x', -1, LOOKX), look('lookMidX', 'x', 0, LOOKX), look('lookRight', 'x', 1, LOOKX),
              look('lookUp', 'y', -0.8, LOOKY), look('lookMidY', 'y', 0, LOOKY), look('lookDown', 'y', 0.8, LOOKY)]

animations = [*body, *blink, *face, *mouth_anims, *look_anims]
DUR = {a['name']: round(a['duration'] / 60 * 1000) for a in animations}

# ---------------------------------------------------------------- state machine
def states(names): return [{'name': n, 'animation': n} for n in names]
def one_shot(name, trigger, home, blend=90):
    return [{'from': 'any', 'to': name, 'durationMs': blend, 'condition': {'input': trigger}},
            {'from': name, 'to': home, 'durationMs': 180, 'exitTimeMs': DUR[name]}]
def toggle(name, flag, home, blend=220):
    return [{'from': home, 'to': name, 'durationMs': blend, 'condition': {'input': flag}},
            {'from': name, 'to': home, 'durationMs': blend, 'condition': {'input': flag, 'value': False}}]
def blend_layer(name, input_, low, mid, high):
    return {'name': name, 'states': [{'name': name, 'blend1d': {'input': input_, 'animations': [
                {'animation': low, 'value': -100}, {'animation': mid, 'value': 0}, {'animation': high, 'value': 100}]}}],
            'transitions': [{'from': 'entry', 'to': name}]}

state_machine = {
    'name': 'Duck',
    'inputs': [
        {'name': 'isCorrect', 'type': 'trigger'}, {'name': 'isWrong', 'type': 'trigger'}, {'name': 'wave', 'type': 'trigger'},
        {'name': 'isThinking', 'type': 'bool', 'initial': False}, {'name': 'isSpeaking', 'type': 'bool', 'initial': False},
        {'name': 'mouthShape', 'type': 'number', 'initial': 0},
        {'name': 'lookX', 'type': 'number', 'initial': 0}, {'name': 'lookY', 'type': 'number', 'initial': 0},
    ],
    'layers': [
        {'name': 'Body', 'states': states(['idle', 'think', 'speak', 'wave', 'correct', 'wrong']), 'transitions': [
            {'from': 'entry', 'to': 'idle'},
            *one_shot('correct', 'isCorrect', 'idle'), *one_shot('wrong', 'isWrong', 'idle'), *one_shot('wave', 'wave', 'idle'),
            *toggle('think', 'isThinking', 'idle'), *toggle('speak', 'isSpeaking', 'idle', 160)]},
        {'name': 'Blink', 'states': states(['blink']), 'transitions': [{'from': 'entry', 'to': 'blink'}]},
        {'name': 'Face', 'states': states(['faceNeutral', 'faceHappy', 'faceSad', 'faceThink']), 'transitions': [
            {'from': 'entry', 'to': 'faceNeutral'},
            *one_shot('faceHappy', 'isCorrect', 'faceNeutral'), *one_shot('faceSad', 'isWrong', 'faceNeutral'),
            *toggle('faceThink', 'isThinking', 'faceNeutral')]},
        {'name': 'Mouth', 'states': states([a['name'] for a in mouth_anims]), 'transitions': [
            {'from': 'entry', 'to': 'mouthRest'},
            *one_shot('mouthHappy', 'isCorrect', 'mouthRest'), *one_shot('mouthSad', 'isWrong', 'mouthRest'),
            *toggle('mouthTalk', 'isSpeaking', 'mouthRest', 80),
            # Visemes mix in 50 ms, fast enough for speech.
            *[t for n, (name, _) in VISEMES.items() for t in (
                {'from': 'any', 'to': name, 'durationMs': 50, 'condition': {'input': 'mouthShape', 'op': '==', 'value': n}},
                {'from': name, 'to': 'mouthRest', 'durationMs': 50, 'condition': {'input': 'mouthShape', 'op': '==', 'value': 0}})]]},
        blend_layer('LookX', 'lookX', 'lookLeft', 'lookMidX', 'lookRight'),
        blend_layer('LookY', 'lookY', 'lookUp', 'lookMidY', 'lookDown'),
    ],
}

scene = {'artboard': {'name': 'Duck', 'width': W, 'height': H}, 'groups': groups, 'shapes': shapes,
         'animations': animations, 'stateMachine': state_machine}
json.dump({'outPath': out_riv, 'scene': scene, 'previewTime': 0.2}, open(out_args, 'w'))
print('shapes', len(shapes), 'groups', len(groups), 'animations', len(animations), 'layers', [l['name'] for l in state_machine['layers']])
