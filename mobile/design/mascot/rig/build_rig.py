"""Builds the Rive scene for the Bataa duck from the parts sheet.

Pipeline (all files in this folder):
  parts.svg            the parts sheet: every piece drawn separately (body, head, 4 wings, eyes, 5 mouths...)
  assemble.py          puts the pieces together in duck space -> duck_all.svg (+ .parts.json)
  riv_import_svg       (rive-mcp tool) duck_all.svg -> duck_all.scene.json, one Rive shape per SVG element
  build_rig.py         this file: joints, pose swaps, animations, state machine -> args for riv_create

Usage: python3 build_rig.py <out args.json> <out duck.riv>

How it moves, the way Duolingo-style Rive mascots are built:
- Joints are groups at the point a part turns about: root (ground), torso, head (neck), wing (shoulder),
  tail, tuft, legs (hips), each eye, the mouth.
- Parts with drawn alternatives swap with Solo groups: the wing (rest, half, up, cheer), each eye
  (open, happy, blink) and the mouth (closed, slight, wide, O, smile). Swapping drawings is what lets
  the wing bend and the bill talk, where rotating one rigid piece could not.
- The state machine runs layers side by side so behaviours combine: Body, Face, Mouth, LookX, LookY.
  Each layer owns its properties, and every animation in a layer keys all of them, so blends never
  leave a stale value behind.
"""
import json, sys

here = __file__.rsplit('/', 1)[0]
out_args, out_riv = sys.argv[1:3]
K, OX, OY = 10, 70, 80          # duck space is about 34 x 39 units; 1 unit = 10 px, with room for the wing and the hop
W, H = 480, 500
frag = json.load(open(f'{here}/duck_all.scene.json'))['shapes']
owner = json.load(open(f'{here}/duck_all.svg.parts.json'))
assert len(frag) == len(owner), 'duck_all.scene.json is stale: rerun assemble.py and riv_import_svg'

def pt(x, y): return (x * K + OX, y * K + OY)

# ---------------------------------------------------------------- rig
# joint -> (parent, pivot in duck space)
JOINTS = {
    'root':  (None,    (16.4, 39.4)),   # between the feet, on the ground: hop and squash
    'legL':  ('root',  (13.0, 30.9)),   # hips (assemble.py places each leg's stub here)
    'legR':  ('root',  (19.5, 30.9)),
    'torso': ('root',  (16.4, 33.2)),   # bottom of the body: breathing
    'tail':  ('torso', (23.6, 26.3)),   # tail base (assemble.py tucks it into the body)
    'wing':  ('torso', (10.0, 25.3)),   # shoulder (SHOULDER in assemble.py)
    'head':  ('torso', (15.5, 18.0)),   # neck
    'tuft':  ('head',  (15.4, 3.4)),
    'eyeL':  ('head',  (10.7, 11.0)),   # the eye centres (EYE in assemble.py)
    'eyeR':  ('head',  (17.6, 11.5)),
    'mouth': ('head',  (10.4, 14.3)),
}
ABS = {j: pt(*p) for j, (_, p) in JOINTS.items()}
REST = {}      # group id -> rest (x, y) relative to its parent
groups = []

def group(gid, parent, at=(0, 0), **extra):
    REST[gid] = at
    groups.append({'id': gid, 'x': at[0], 'y': at[1], **({'parent': parent} if parent else {}), **extra})

for j, (parent, _) in JOINTS.items():
    px, py = ABS[parent] if parent else (0, 0)
    group(j, parent, (ABS[j][0] - px, ABS[j][1] - py))

# Pose swaps: a Solo group per swappable part; each alternative is a plain group at the joint's origin.
SWAPS = {
    # At rest the wing is folded into the body (drawn there), so its first option is an empty group.
    'wingPose':  ('wingRise', ['wingNone', 'wingHalf', 'wingUp', 'wingCheer']),
    'eyeLPose':  ('eyeL',  ['eyeLOpen', 'eyeLHappy', 'eyeLBlink', 'eyeLSleepy']),
    'eyeRPose':  ('eyeR',  ['eyeROpen', 'eyeRHappy', 'eyeRBlink', 'eyeRSleepy']),
    'mouthPose': ('mouth', ['mClosed', 'mSlight', 'mWide', 'mO', 'mSmile']),
}
# The wing comes out of the body and goes back into it through this group (see wing_out below).
group('wingRise', 'wing')
for solo, (joint, options) in SWAPS.items():
    group(solo, joint, solo=True, active=options[0])
    for o in options:
        group(o, solo)
# The open eyes sit in their own groups, so the gaze can move them.
group('lookL', 'eyeLOpen')
group('lookR', 'eyeROpen')

# part (from assemble.py) -> the group its shapes hang from, and the joint whose origin they are relative to
HOME = {
    'tail': 'tail', 'legL': 'legL', 'legR': 'legR', 'body': 'torso', 'head': 'head', 'tuft': 'tuft',
    'wingHalf': 'wingHalf', 'wingUp': 'wingUp', 'wingCheer': 'wingCheer',
    'openL': 'lookL', 'lidHappyL': 'eyeLHappy', 'lidBlinkL': 'eyeLBlink', 'sleepyL': 'eyeLSleepy',
    'openR': 'lookR', 'lidHappyR': 'eyeRHappy', 'lidBlinkR': 'eyeRBlink', 'sleepyR': 'eyeRSleepy',
    **{m: m for m in SWAPS['mouthPose'][1]},
}
parent_of = {g['id']: g.get('parent') for g in groups}
def joint_of(gid):
    """Every pose and look group sits at its joint's origin, so shapes are placed relative to that joint."""
    while gid not in JOINTS:
        gid = parent_of[gid]
    return gid

# Fur recoloured from the sheet's latte cream to a near-white duck. The shading keeps a soft warm grey
# so the duck still reads against the app's white cards.
FUR = {
    '#F9E9CE': '#FFF9F0',   # fur
    '#F7E7CB': '#FCF5EA',   # fur on the wings, tail and sleepy lids
    '#EED7B7': '#EADDCB',   # shading
    '#EAD4B2': '#E3D4BF',   # deep shading
}

# Back to front. The raised wings sit behind the body, so they rise out of it, and behind the head so the
# bill always shows.
DRAW = ['tail', 'legL', 'legR', 'wingHalf', 'wingUp', 'wingCheer', 'body', 'head', 'tuft',
        'openL', 'openR', 'sleepyL', 'sleepyR', 'lidHappyL', 'lidHappyR', 'lidBlinkL', 'lidBlinkR',
        *SWAPS['mouthPose'][1]]
assert set(DRAW) == set(owner), set(owner) ^ set(DRAW)
shapes = []
for part in DRAW:
    home = HOME[part]
    jx, jy = ABS[joint_of(home)]
    for s, o in zip(frag, owner):
        if o != part:
            continue
        s = json.loads(json.dumps(s))
        ax, ay = pt(s['x'], s['y'])
        s['x'], s['y'] = ax - jx, ay - jy
        for sub in s.get('subpaths', []):
            for p in sub['points']:
                p['x'] *= K
                p['y'] *= K
                if c := p.get('cubic'):
                    c['inDistance'] *= K
                    c['outDistance'] *= K
        for key in ('width', 'height'):
            if key in s:
                s[key] *= K
        s['parent'] = home
        if (c := s.get('fill', {}).get('color', '').upper()) in FUR:
            # A sleepy lid is skin over the eye, so it takes the face's own fur colour, not the wing cream.
            s['fill']['color'] = FUR['#F9E9CE'] if part.startswith('sleepy') else FUR[c]
        shapes.append(s)

# ---------------------------------------------------------------- hearts (Fx layer)
# Three hearts around the head that pop, float up and fade on a correct answer. Each is two circles and a
# square turned 45 degrees, the classic heart, so no extra artwork is needed.
HEART = '#FF5C7A'
HEARTS = {'heart1': (3.5, 3.0, 26), 'heart2': (27.0, 1.5, 22), 'heart3': (16.0, -2.5, 30)}   # duck-space x, y, size px
for hid, (hx, hy, d) in HEARTS.items():
    group(hid, None, pt(hx, hy), opacity=0)
    r = d / 2
    shapes += [
        {'id': f'{hid}L', 'type': 'ellipse', 'parent': hid, 'x': -r * 0.5, 'y': -r * 0.3, 'width': d * 0.62, 'height': d * 0.62, 'fill': {'color': HEART}},
        {'id': f'{hid}R', 'type': 'ellipse', 'parent': hid, 'x': r * 0.5, 'y': -r * 0.3, 'width': d * 0.62, 'height': d * 0.62, 'fill': {'color': HEART}},
        {'id': f'{hid}V', 'type': 'rect', 'parent': hid, 'x': 0, 'y': r * 0.18, 'width': d * 0.62, 'height': d * 0.62, 'rotation': 45, 'fill': {'color': HEART}},
        {'id': f'{hid}S', 'type': 'ellipse', 'parent': hid, 'x': -r * 0.55, 'y': -r * 0.45, 'width': d * 0.16, 'height': d * 0.12, 'rotation': -30, 'fill': {'color': '#FFC2CD'}},
    ]

# ---------------------------------------------------------------- animation helpers
BACK, OUT, IN = 'ease-out-back', 'ease-out', 'ease-in'
ABSOLUTE = {'scaleX': 1, 'scaleY': 1, 'rotation': 0}
# Rest values that differ from the defaults above, per (target, property).
PAD = {('wingRise', 'opacity'): 1}

def track(target, prop, *keys):
    """keys: (frame, value[, easing]). x and y are offsets from rest; everything else is absolute.
    An easing describes the motion arriving at its key. Default: ease-in-out."""
    base = {'x': REST[target][0], 'y': REST[target][1]}.get(prop, 0)
    frames = []
    for i, (frame, value, *ease) in enumerate(keys):
        k = {'frame': frame, 'value': base + value}
        if i:
            k['easing'] = ease[0] if ease else 'ease-in-out'
        frames.append(k)
    return {'target': target, 'property': prop, 'keyframes': frames}

def swap(solo, *keys):
    """keys: (frame, option). Holds each option until the next key."""
    return {'target': solo, 'property': 'soloActive', 'keyframes': [{'frame': f, 'ref': r} for f, r in keys]}

def anim(name, duration, loop, tracks, owned, solos=()):
    """Pads the animation: every property and Solo its layer owns but it does not move is keyed at rest."""
    have = {(t['target'], t['property']) for t in tracks}
    for target, prop in owned:
        if (target, prop) not in have:
            rest = PAD.get((target, prop), ABSOLUTE.get(prop, 0))
            tracks.append(track(target, prop, (0, rest), (duration, rest)))
    for solo in solos:
        if (solo, 'soloActive') not in have:
            tracks.append(swap(solo, (0, SWAPS[solo][1][0])))
    return {'name': name, 'fps': 60, 'duration': duration, 'loop': loop, 'tracks': tracks}

def props(targets, names): return [(t, n) for t in targets for n in names]

# ---------------------------------------------------------------- layer: Body
BODY = [*props(['root'], ['x', 'y', 'rotation', 'scaleX', 'scaleY']), *props(['torso'], ['scaleX', 'scaleY']),
        *props(['head'], ['y', 'rotation']), *props(['wing', 'tail', 'tuft', 'legL', 'legR'], ['rotation']),
        *props(['wingRise'], ['y', 'rotation', 'scaleX', 'scaleY', 'opacity'])]
BODY_SOLO = ['wingPose']
# A drawing swap happens in one frame, so it is hidden inside motion. The wing is drawn behind the body:
# put away, it sits low, turned down against the body's side and faded out; coming out, it rises, swings
# up and fades in, so it reads as coming out of the body, bottom to top. Animations that keep it put away key it at 0, so a state that
# brings the wing in (think, speak) blends it up from there instead of popping.
def wing_out(*keys):
    """keys: (frame, amount out 0..1[, easing])."""
    def k(f, a, *e): return lambda lo, hi: (f, hi + (lo - hi) * (1 - a), *e)
    return [track('wingRise', p, *[k(*key)(lo, hi) for key in keys]) for p, lo, hi in
            (('y', 50, 0), ('rotation', -40, 0), ('scaleX', 0.75, 1), ('scaleY', 0.75, 1), ('opacity', 0, 1))]
# Rotation is clockwise. The duck faces left, so a positive head turn lifts its face and a negative one bows it.
body = [
    # Breathing peaks at 50%, head sway at 30% and 75%, tail and tuft off-beat: nothing peaks together.
    anim('idle', 240, 'loop', [
        track('torso', 'scaleY', (0, 1), (120, 1.03), (240, 1)),
        track('torso', 'scaleX', (0, 1), (120, 0.99), (240, 1)),
        track('head', 'y', (0, 0), (132, -2.5), (240, 0)),
        track('head', 'rotation', (0, 0), (72, -2.5), (180, 1.8), (240, 0)),
        track('tail', 'rotation', (0, 0), (30, -9, OUT), (54, 0), (150, -5, OUT), (172, 0), (240, 0)),
        track('tuft', 'rotation', (0, 0), (96, 7), (200, -3), (240, 0)),
        track('wing', 'rotation', (0, 0), (150, 4), (240, 0)),
        *wing_out((0, 0), (240, 0)),
    ], BODY, BODY_SOLO),
    anim('think', 180, 'loop', [
        swap('wingPose', (0, 'wingHalf')),
        track('head', 'rotation', (0, 7), (90, 9.5), (180, 7)),
        track('head', 'y', (0, -1), (104, -2.5), (180, -1)),
        track('torso', 'scaleY', (0, 1), (108, 1.025), (180, 1)),
        track('wing', 'rotation', (0, -6), (90, -6), (98, 2, OUT), (108, -6, IN), (116, 1, OUT), (126, -6, IN), (180, -6)),
        track('tuft', 'rotation', (0, 0), (90, 5), (180, 0)),
    ], BODY, BODY_SOLO),
    # Speaking: the head nods on the syllables while the wing makes one open-handed gesture.
    anim('speak', 96, 'loop', [
        swap('wingPose', (0, 'wingHalf')),
        track('head', 'y', (0, 0), (8, -3.5, OUT), (15, 0, IN), (22, -2, OUT), (28, 0, IN), (37, -4.5, OUT), (46, 0, IN), (55, -2.5, OUT), (64, 0, IN), (96, 0)),
        track('head', 'rotation', (0, 0), (10, 3, OUT), (30, -2), (40, 4, OUT), (62, -1.5), (84, 0), (96, 0)),
        track('torso', 'scaleY', (0, 1), (9, 1.025, OUT), (18, 0.995), (38, 1.03, OUT), (50, 0.995), (96, 1)),
        track('wing', 'rotation', (0, 0), (24, -6, OUT), (40, 8, BACK), (64, 4), (96, 0)),
        track('tail', 'rotation', (0, 0), (36, -5, OUT), (60, 0), (96, 0)),
    ], BODY, BODY_SOLO),
    # The wing swings up past its mark, then each wave is smaller than the last.
    anim('wave', 120, 'oneShot', [
        swap('wingPose', (0, 'wingHalf'), (6, 'wingUp'), (102, 'wingHalf'), (110, 'wingNone')),
        *wing_out((0, 0), (14, 1, BACK), (96, 1), (110, 0, IN), (120, 0)),
        track('wing', 'rotation', (0, 0), (6, -8, OUT), (18, 14, BACK), (30, -8), (42, 12), (54, -6), (66, 9), (80, -3), (98, 0, OUT), (120, 0)),
        track('torso', 'scaleY', (0, 1), (6, 0.97, OUT), (18, 1.04, BACK), (40, 1.01), (120, 1)),
        track('torso', 'scaleX', (0, 1), (6, 1.025, OUT), (18, 0.975, BACK), (40, 0.995), (120, 1)),
        track('root', 'rotation', (0, 0), (22, -3, OUT), (80, -3), (106, 0, BACK), (120, 0)),
        track('head', 'rotation', (0, 0), (9, -2, OUT), (24, 6, BACK), (84, 5), (104, -1, IN), (116, 0, OUT), (120, 0)),
        track('tail', 'rotation', (0, 0), (20, -10, OUT), (36, 4), (52, -8), (70, 0), (120, 0)),
    ], BODY, BODY_SOLO),
    # Crouch, stretch on take-off, wings up at the top, squash on landing, one small rebound, settle.
    anim('correct', 102, 'oneShot', [
        swap('wingPose', (0, 'wingNone'), (10, 'wingCheer'), (62, 'wingHalf'), (86, 'wingNone')),
        *wing_out((0, 0), (10, 0), (24, 1, BACK), (72, 1), (86, 0, IN), (102, 0)),
        track('root', 'scaleY', (0, 1), (10, 0.84, OUT), (15, 1.1, OUT), (26, 1.03), (39, 1.07, IN), (44, 0.87, OUT), (51, 1.05, OUT), (58, 1.01), (66, 0.95, IN), (76, 1.025, BACK), (88, 1), (102, 1)),
        track('root', 'scaleX', (0, 1), (10, 1.14, OUT), (15, 0.93, OUT), (26, 0.98), (39, 0.95, IN), (44, 1.12, OUT), (51, 0.96, OUT), (58, 0.99), (66, 1.04, IN), (76, 0.985, BACK), (88, 1), (102, 1)),
        track('root', 'y', (0, 0), (10, 0), (27, -64, OUT), (41, 0, IN), (44, 0), (55, -20, OUT), (65, 0, IN), (102, 0)),
        track('root', 'rotation', (0, 0), (10, -2, OUT), (24, 5, OUT), (41, -3), (52, 2), (66, -1), (82, 0, BACK), (102, 0)),
        track('wing', 'rotation', (0, 0), (12, -10, OUT), (22, 12, BACK), (33, 0), (41, 10, IN), (48, -4, OUT), (58, 6, OUT), (70, 0), (102, 0)),
        track('head', 'y', (0, 0), (12, 6, OUT), (19, -5, OUT), (30, 0), (46, 7, OUT), (56, -3, OUT), (70, 3), (84, 0, BACK), (102, 0)),
        track('head', 'rotation', (0, 0), (12, -4, OUT), (22, 9, BACK), (40, 6), (47, -6, OUT), (60, 3), (74, -1.5), (90, 0, OUT), (102, 0)),
        track('legL', 'rotation', (0, 0), (12, 6, OUT), (22, -24, OUT), (38, -4, IN), (44, 0, OUT), (54, -10, OUT), (65, 0, IN), (102, 0)),
        track('legR', 'rotation', (0, 0), (12, -6, OUT), (24, 24, OUT), (39, 4, IN), (44, 0, OUT), (56, 10, OUT), (65, 0, IN), (102, 0)),
        track('tail', 'rotation', (0, 0), (14, 6, OUT), (26, -14, OUT), (44, 6), (60, -6), (80, 0), (102, 0)),
        track('tuft', 'rotation', (0, 0), (15, -12, OUT), (30, 10), (46, -8), (62, 5), (84, 0), (102, 0)),
    ], BODY, BODY_SOLO),
    # A small startled lift, then the body sags and the head bows after it. Recovery runs body first.
    anim('wrong', 120, 'oneShot', [
        track('torso', 'scaleY', (0, 1), (6, 1.04, OUT), (22, 0.94), (30, 0.955, OUT), (84, 0.955), (100, 1.02, BACK), (112, 1), (120, 1)),
        track('torso', 'scaleX', (0, 1), (6, 0.975, OUT), (22, 1.04), (30, 1.03, OUT), (84, 1.03), (100, 0.99, BACK), (112, 1), (120, 1)),
        track('head', 'y', (0, 0), (7, -4, OUT), (27, 9), (35, 7, OUT), (88, 7), (106, -1.5, BACK), (116, 0), (120, 0)),
        track('head', 'rotation', (0, 0), (7, 4, OUT), (27, -12), (35, -10, OUT), (56, -10), (63, -7), (71, -11), (79, -10, OUT), (89, -10), (107, 2, BACK), (117, 0), (120, 0)),
        track('wing', 'rotation', (0, 0), (8, -6, OUT), (32, 8), (92, 8), (110, -2, BACK), (120, 0)),
        track('tail', 'rotation', (0, 0), (20, 8), (92, 8), (112, 0), (120, 0)),
        track('tuft', 'rotation', (0, 0), (24, 14), (40, 9), (92, 10), (112, 0), (120, 0)),
        *wing_out((0, 0), (120, 0)),
    ], BODY, BODY_SOLO),
    # A little victory dance for finishing a lesson: four beats, hopping side to side with the wing
    # up on every beat, the head bobbing against the body and the legs taking turns.
    anim('dance', 192, 'oneShot', [
        swap('wingPose', (0, 'wingNone'), (4, 'wingUp'), (56, 'wingCheer'), (104, 'wingUp'), (152, 'wingCheer'), (182, 'wingNone')),
        *wing_out((0, 0), (4, 0), (18, 1, BACK), (166, 1), (182, 0, IN), (192, 0)),
        track('root', 'x', (0, 0), (24, -14, OUT), (48, 0, IN), (72, 14, OUT), (96, 0, IN), (120, -14, OUT), (144, 0, IN), (168, 10, OUT), (184, 0, BACK), (192, 0)),
        track('root', 'y', (0, 0), (12, -18, OUT), (24, 0, IN), (36, -18, OUT), (48, 0, IN), (60, -18, OUT), (72, 0, IN), (84, -18, OUT), (96, 0, IN),
              (108, -18, OUT), (120, 0, IN), (132, -18, OUT), (144, 0, IN), (156, -26, OUT), (170, 0, IN), (192, 0)),
        track('root', 'rotation', (0, 0), (24, -7), (48, 0), (72, 7), (96, 0), (120, -7), (144, 0), (168, 5), (184, 0, BACK), (192, 0)),
        track('root', 'scaleY', (0, 1), (2, 0.93, OUT), (12, 1.05, OUT), (24, 0.94, IN), (36, 1.05, OUT), (48, 0.94, IN), (60, 1.05, OUT), (72, 0.94, IN),
              (84, 1.05, OUT), (96, 0.94, IN), (108, 1.05, OUT), (120, 0.94, IN), (132, 1.05, OUT), (144, 0.94, IN), (156, 1.07, OUT), (170, 0.9, IN), (184, 1, BACK), (192, 1)),
        track('root', 'scaleX', (0, 1), (2, 1.06, OUT), (12, 0.96, OUT), (24, 1.05, IN), (36, 0.96, OUT), (48, 1.05, IN), (60, 0.96, OUT), (72, 1.05, IN),
              (84, 0.96, OUT), (96, 1.05, IN), (108, 0.96, OUT), (120, 1.05, IN), (132, 0.96, OUT), (144, 1.05, IN), (156, 0.95, OUT), (170, 1.1, IN), (184, 1, BACK), (192, 1)),
        track('head', 'rotation', (0, 0), (24, 8), (48, 0), (72, -8), (96, 0), (120, 8), (144, 0), (168, -6), (184, 0, BACK), (192, 0)),
        track('wing', 'rotation', (0, 0), (16, -10, OUT), (32, 12), (48, -6), (64, 14), (80, -8), (96, 12), (112, -10), (128, 14), (144, -6), (160, 10), (176, 0), (192, 0)),
        track('tail', 'rotation', (0, 0), (12, -14), (24, 6), (36, -14), (48, 6), (60, -14), (72, 6), (84, -14), (96, 6), (108, -14), (120, 6), (132, -14), (144, 6), (160, -10), (176, 0), (192, 0)),
        track('tuft', 'rotation', (0, 0), (14, -12, OUT), (26, 8), (38, -12), (50, 8), (62, -12), (74, 8), (86, -12), (98, 8), (110, -12), (122, 8), (134, -12), (146, 8), (162, -6), (180, 0), (192, 0)),
        track('legL', 'rotation', (0, 0), (12, -18, OUT), (24, 0, IN), (60, -18, OUT), (72, 0, IN), (108, -18, OUT), (120, 0, IN), (156, -14, OUT), (170, 0, IN), (192, 0)),
        track('legR', 'rotation', (0, 0), (36, 18, OUT), (48, 0, IN), (84, 18, OUT), (96, 0, IN), (132, 18, OUT), (144, 0, IN), (156, 14, OUT), (170, 0, IN), (192, 0)),
    ], BODY, BODY_SOLO),
    # Onboarding hello: pops up from nothing, lands with a squash, then waves.
    anim('intro', 120, 'oneShot', [
        swap('wingPose', (0, 'wingNone'), (40, 'wingHalf'), (46, 'wingUp'), (106, 'wingHalf'), (112, 'wingNone')),
        *wing_out((0, 0), (40, 0), (54, 1, BACK), (100, 1), (112, 0, IN), (120, 0)),
        track('root', 'y', (0, 30), (12, -46, OUT), (24, 0, IN), (120, 0)),
        *[track('root', p, (0, 0.2), (12, 1.0 if p == 'scaleX' else 1.12, BACK), (24, 1.14 if p == 'scaleX' else 0.84, IN), (32, 0.97 if p == 'scaleX' else 1.05, OUT),
                (40, 1), (120, 1)) for p in ('scaleX', 'scaleY')],
        track('root', 'rotation', (0, -12), (12, 6, OUT), (24, 0), (120, 0)),
        track('wing', 'rotation', (0, 0), (46, -8), (58, 14, BACK), (70, -8), (82, 12), (94, -4), (106, 0), (120, 0)),
        track('head', 'rotation', (0, 0), (24, -4, OUT), (34, 3), (48, 6, BACK), (100, 5), (116, 0), (120, 0)),
        track('tuft', 'rotation', (0, -10), (14, 14, OUT), (26, -10), (38, 6), (52, -3), (70, 0), (120, 0)),
        track('tail', 'rotation', (0, 0), (26, 10, OUT), (40, -8), (60, 6), (80, -4), (100, 0), (120, 0)),
    ], BODY, BODY_SOLO),
    # A happy double nod: "good choice".
    anim('nod', 48, 'oneShot', [
        track('head', 'rotation', (0, 0), (7, -8, OUT), (15, 3), (23, -6, OUT), (31, 2), (40, 0, OUT), (48, 0)),
        track('head', 'y', (0, 0), (7, 3, OUT), (15, -1.5), (23, 2.5, OUT), (31, -1), (40, 0), (48, 0)),
        track('torso', 'scaleY', (0, 1), (7, 0.97, OUT), (15, 1.02), (23, 0.98), (34, 1), (48, 1)),
        track('tuft', 'rotation', (0, 0), (9, 12, OUT), (17, -6), (25, 9), (33, -3), (44, 0), (48, 0)),
        track('tail', 'rotation', (0, 0), (10, -10, OUT), (22, 4), (34, -6), (46, 0)),
        *wing_out((0, 0), (48, 0)),
    ], BODY, BODY_SOLO),
    # Listening to a question: head tilted, eyes on the options (lookY from the app), breathing slowly.
    anim('curious', 180, 'loop', [
        track('head', 'rotation', (0, -6), (60, -10), (110, -10), (150, -5), (180, -6)),
        track('head', 'y', (0, 1), (60, 2), (150, 0.5), (180, 1)),
        track('torso', 'scaleY', (0, 1), (90, 1.025), (180, 1)),
        track('torso', 'scaleX', (0, 1), (90, 0.99), (180, 1)),
        track('tail', 'rotation', (0, 0), (40, -7), (70, 0), (130, -5), (160, 0), (180, 0)),
        track('tuft', 'rotation', (0, 2), (90, 6), (180, 2)),
        *wing_out((0, 0), (180, 0)),
    ], BODY, BODY_SOLO),
    # "Your turn": the wing points down at the answers and taps twice, again and again.
    anim('point', 120, 'loop', [
        swap('wingPose', (0, 'wingHalf')),
        track('wing', 'rotation', (0, -38), (10, -28, OUT), (18, -40, IN), (28, -28, OUT), (36, -38, IN), (120, -38)),
        track('head', 'rotation', (0, -7), (60, -9), (120, -7)),
        track('root', 'rotation', (0, -2), (120, -2)),
        track('torso', 'scaleY', (0, 1), (10, 1.015, OUT), (18, 1), (28, 1.015, OUT), (36, 1), (120, 1)),
        track('tuft', 'rotation', (0, 0), (12, 4), (20, -2), (30, 4), (40, 0), (120, 0)),
    ], BODY, BODY_SOLO),
]

# ---------------------------------------------------------------- layer: Face (eyes, blinks included)
# One layer owns both eyes, so a blink and an expression can never fight over them.
FACE_SOLO = ['eyeLPose', 'eyeRPose']
FACE = props(['eyeL', 'eyeR'], ['scaleY'])
def eyes(*keys):
    """keys: (frame, 'Open' | 'Happy' | 'Blink' | 'Sleepy'), for both eyes at once.
    Each swap is hidden in a squash: the eye flattens over two frames, swaps while it is a sliver,
    then springs back over three. So a blink reads as lids closing, not a picture changing."""
    squash = [(0, 1)]
    for f, _ in keys[1:]:
        for k in ((f - 2, 1), (f - 1, 0.2, IN), (f, 0.4), (f + 3, 1, OUT)):
            if k[0] > squash[-1][0]:
                squash.append(k)
    return [t for s in 'LR' for t in (swap(f'eye{s}Pose', *[(f, f'eye{s}{p}') for f, p in keys]), track(f'eye{s}', 'scaleY', *squash))]
def blinks(*at, hold=6):
    return [k for a in at for k in ((a, 'Blink'), (a + hold, 'Open'))]
face = [
    anim('faceNeutral', 300, 'loop', eyes((0, 'Open'), *blinks(110, 256, 268)), FACE, FACE_SOLO),
    anim('faceHappy', 102, 'oneShot', eyes((0, 'Open'), (12, 'Happy'), (86, 'Open')), FACE, FACE_SOLO),
    # Startled, then heavy sleepy lids while it sinks in.
    anim('faceSad', 120, 'oneShot', eyes((0, 'Open'), *blinks(10), (24, 'Sleepy'), (100, 'Open')), FACE, FACE_SOLO),
    anim('faceThink', 180, 'loop', eyes((0, 'Open'), *blinks(120)), FACE, FACE_SOLO),
    anim('faceWave', 120, 'oneShot', eyes((0, 'Open'), (20, 'Happy'), (96, 'Open')), FACE, FACE_SOLO),
    anim('faceDance', 192, 'oneShot', eyes((0, 'Open'), (8, 'Happy'), (178, 'Open')), FACE, FACE_SOLO),
    anim('faceIntro', 120, 'oneShot', eyes((0, 'Blink'), (14, 'Open'), (50, 'Happy'), (104, 'Open')), FACE, FACE_SOLO),
    anim('faceNod', 48, 'oneShot', eyes((0, 'Open'), (5, 'Happy'), (40, 'Open')), FACE, FACE_SOLO),
]

# ---------------------------------------------------------------- layer: Mouth (speech and visemes)
MOUTH = props(['mouth'], ['scaleX', 'scaleY'])
MOUTH_SOLO = ['mouthPose']
def mouth(*keys):
    """keys: (frame, mouth shape). Each change comes with a small squash and stretch of the bill,
    so speech reads as a moving bill rather than pictures changing."""
    pulse = [(0, 1)]
    for f, _ in keys[1:]:
        for k in ((f - 1, 0.93, IN), (f, 1.06), (f + 3, 1, OUT)):
            if k[0] > pulse[-1][0]:
                pulse.append(k)
    return [swap('mouthPose', *keys), track('mouth', 'scaleY', *pulse)]
mouth_anims = [
    anim('mouthRest', 2, 'loop', [], MOUTH, MOUTH_SOLO),
    # Stand-in speech for when there is no audio: syllables that differ in shape and length.
    anim('mouthTalk', 96, 'loop', [
        *mouth((0, 'mClosed'), (5, 'mSlight'), (11, 'mWide'), (19, 'mSlight'), (24, 'mClosed'), (30, 'mO'), (39, 'mSlight'),
               (45, 'mClosed'), (50, 'mWide'), (60, 'mSmile'), (68, 'mSlight'), (74, 'mO'), (82, 'mClosed')),
    ], MOUTH, MOUTH_SOLO),
    anim('mouthHappy', 102, 'oneShot', [*mouth((0, 'mClosed'), (10, 'mWide'), (78, 'mSmile'), (96, 'mClosed')),
                                        track('mouth', 'scaleX', (0, 1), (14, 1.08, BACK), (70, 1.04), (90, 1), (102, 1))], MOUTH, MOUTH_SOLO),
    anim('mouthSad', 120, 'oneShot', [*mouth((0, 'mClosed'), (6, 'mO'), (22, 'mSlight'), (100, 'mClosed'))], MOUTH, MOUTH_SOLO),
    anim('mouthWave', 120, 'oneShot', [*mouth((0, 'mClosed'), (16, 'mSmile'), (100, 'mClosed'))], MOUTH, MOUTH_SOLO),
    anim('mouthIntro', 120, 'oneShot', [*mouth((0, 'mClosed'), (12, 'mWide'), (26, 'mSmile'), (110, 'mClosed'))], MOUTH, MOUTH_SOLO),
    anim('mouthNod', 48, 'oneShot', [*mouth((0, 'mClosed'), (5, 'mSmile'), (42, 'mClosed'))], MOUTH, MOUTH_SOLO),
    # A cheer on every beat.
    anim('mouthDance', 192, 'oneShot', [*mouth((0, 'mClosed'), (8, 'mSmile'), (12, 'mWide'), (24, 'mSmile'), (60, 'mWide'), (72, 'mSmile'),
                                             (108, 'mWide'), (120, 'mSmile'), (156, 'mWide'), (172, 'mSmile'), (184, 'mClosed'))], MOUTH, MOUTH_SOLO),
]
# Visemes, selected with the `mouthShape` number input. A duck bill has fewer shapes than a human mouth.
VISEMES = {1: 'mWide', 2: 'mSlight', 3: 'mO', 4: 'mClosed', 5: 'mSmile'}   # A/I, E, O/U, M/B/P, F/V and smiles
mouth_anims += [anim(f'vis{n}', 2, 'loop', [swap('mouthPose', (0, m))], MOUTH, MOUTH_SOLO) for n, m in VISEMES.items()]

# ---------------------------------------------------------------- layers: LookX, LookY (gaze, 1D blends)
def look(name, prop, amount):
    return anim(name, 2, 'loop', [track(f'look{s}', prop, (0, amount), (2, amount)) for s in 'LR'], [])
look_anims = [look('lookLeft', 'x', -3.5), look('lookMidX', 'x', 0), look('lookRight', 'x', 3.5),
              look('lookUp', 'y', -3.5), look('lookMidY', 'y', 0), look('lookDown', 'y', 3)]

# ---------------------------------------------------------------- layer: Fx (hearts)
FX = props(list(HEARTS), ['opacity', 'x', 'y', 'scaleX', 'scaleY', 'rotation'])
def heart(hid, d, side):
    """One heart starting `d` frames in: pops, floats up with a sway, fades."""
    return [
        track(hid, 'opacity', (0, 0), (d, 0), (d + 4, 1, OUT), (d + 58, 1), (d + 80, 0, IN), (110, 0)),
        track(hid, 'y', (0, 0), (d, 12), (d + 80, -70, OUT), (110, -70)),
        track(hid, 'x', (0, 0), (d, 0), (d + 20, 8 * side), (d + 40, -6 * side), (d + 60, 4 * side), (d + 80, 0), (110, 0)),
        *[track(hid, p, (0, 0.2), (d, 0.2), (d + 10, 1.15, BACK), (d + 18, 1), (d + 80, 0.8), (110, 0.8)) for p in ('scaleX', 'scaleY')],
        track(hid, 'rotation', (0, -12 * side), (d + 10, 8 * side, BACK), (d + 50, -6 * side), (d + 80, 4 * side), (110, 0)),
    ]
fx = [
    anim('fxNone', 2, 'loop', [], FX),
    anim('fxHearts', 110, 'oneShot', [*heart('heart1', 0, -1), *heart('heart3', 7, 1), *heart('heart2', 14, 1)], FX),
]

animations = [*body, *face, *mouth_anims, *look_anims, *fx]
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
        {'name': 'dance', 'type': 'trigger'}, {'name': 'hello', 'type': 'trigger'}, {'name': 'nod', 'type': 'trigger'},
        {'name': 'isCurious', 'type': 'bool', 'initial': False}, {'name': 'isPointing', 'type': 'bool', 'initial': False},
        {'name': 'isThinking', 'type': 'bool', 'initial': False}, {'name': 'isSpeaking', 'type': 'bool', 'initial': False},
        {'name': 'mouthShape', 'type': 'number', 'initial': 0},
        {'name': 'lookX', 'type': 'number', 'initial': 0}, {'name': 'lookY', 'type': 'number', 'initial': 0},
    ],
    'layers': [
        {'name': 'Body', 'states': states(['idle', 'think', 'speak', 'wave', 'correct', 'wrong', 'dance', 'intro', 'nod', 'curious', 'point']), 'transitions': [
            {'from': 'entry', 'to': 'idle'},
            *one_shot('correct', 'isCorrect', 'idle'), *one_shot('wrong', 'isWrong', 'idle'), *one_shot('wave', 'wave', 'idle'), *one_shot('dance', 'dance', 'idle'), *one_shot('intro', 'hello', 'idle', 0), *one_shot('nod', 'nod', 'idle'),
            *toggle('curious', 'isCurious', 'idle', 300), *toggle('point', 'isPointing', 'idle'),
            *toggle('think', 'isThinking', 'idle'), *toggle('speak', 'isSpeaking', 'idle', 160)]},
        {'name': 'Face', 'states': states(['faceNeutral', 'faceHappy', 'faceSad', 'faceThink', 'faceWave', 'faceDance', 'faceIntro', 'faceNod']), 'transitions': [
            {'from': 'entry', 'to': 'faceNeutral'},
            *one_shot('faceHappy', 'isCorrect', 'faceNeutral', 0), *one_shot('faceSad', 'isWrong', 'faceNeutral', 0),
            *one_shot('faceWave', 'wave', 'faceNeutral', 0), *one_shot('faceDance', 'dance', 'faceNeutral', 0), *one_shot('faceIntro', 'hello', 'faceNeutral', 0), *one_shot('faceNod', 'nod', 'faceNeutral', 0), *toggle('faceThink', 'isThinking', 'faceNeutral', 0)]},
        {'name': 'Mouth', 'states': states([a['name'] for a in mouth_anims]), 'transitions': [
            {'from': 'entry', 'to': 'mouthRest'},
            *one_shot('mouthHappy', 'isCorrect', 'mouthRest', 0), *one_shot('mouthSad', 'isWrong', 'mouthRest', 0),
            *one_shot('mouthWave', 'wave', 'mouthRest', 0), *one_shot('mouthDance', 'dance', 'mouthRest', 0), *one_shot('mouthIntro', 'hello', 'mouthRest', 0), *one_shot('mouthNod', 'nod', 'mouthRest', 0), *toggle('mouthTalk', 'isSpeaking', 'mouthRest', 0),
            *[t for n in VISEMES for t in (
                {'from': 'any', 'to': f'vis{n}', 'durationMs': 0, 'condition': {'input': 'mouthShape', 'op': '==', 'value': n}},
                {'from': f'vis{n}', 'to': 'mouthRest', 'durationMs': 0, 'condition': {'input': 'mouthShape', 'op': '==', 'value': 0}})]]},
        {'name': 'Fx', 'states': states(['fxNone', 'fxHearts']), 'transitions': [
            {'from': 'entry', 'to': 'fxNone'},
            *one_shot('fxHearts', 'isCorrect', 'fxNone', 0),
            {'from': 'any', 'to': 'fxHearts', 'durationMs': 0, 'condition': {'input': 'dance'}}]},
        blend_layer('LookX', 'lookX', 'lookLeft', 'lookMidX', 'lookRight'),
        blend_layer('LookY', 'lookY', 'lookUp', 'lookMidY', 'lookDown'),
    ],
}

scene = {'artboard': {'name': 'Duck', 'width': W, 'height': H}, 'groups': groups, 'shapes': shapes,
         'animations': animations, 'stateMachine': state_machine}
json.dump({'outPath': out_riv, 'scene': scene, 'previewTime': 0.2}, open(out_args, 'w'))
print('shapes', len(shapes), 'groups', len(groups), 'animations', len(animations), 'layers', [l['name'] for l in state_machine['layers']])
