"""Builds the Rive scene spec for the Bataa duck from the imported SVG fragment.

Usage: python3 build_duck_scene.py <duck.scene.json from riv_import_svg> <out args.json> <out duck.riv>
The output is the argument file for rive-mcp's `riv_create` tool.
"""
import copy, json, sys

frag, out_args, out_riv = sys.argv[1:4]
K, OX, OY = 5, 0, 50          # SVG is 80x80; artboard is 400x450 with headroom for the hop
W, H = 400, 450
src = {s['id']: s for s in json.load(open(frag))['shapes']}

def pt(x, y): return (x * K + OX, y * K + OY)

# Rig: group id -> (parent, pivot in SVG units). Pivots are the joints parts rotate and scale about.
RIG = {
    'root':  (None,    (41, 75.5)),   # ground point: hop and squash
    'footL': ('root',  (35.5, 63.5)),
    'footR': ('root',  (50, 63.5)),
    'torso': ('root',  (42, 62)),     # breathing
    'wing':  ('torso', (27, 43)),     # shoulder
    'head':  ('torso', (40, 38)),     # neck
    'eyeL':  ('head',  (27.73, 22.98)),
    'eyeR':  ('head',  (43.22, 24.16)),
    'bill':  ('head',  (36.5, 29)),   # hinge where the bill meets the face
}
ABS = {g: pt(*p) for g, (_, p) in RIG.items()}
REST = {}
groups = []
for g, (parent, _) in RIG.items():
    px, py = ABS[parent] if parent else (0, 0)
    REST[g] = (ABS[g][0] - px, ABS[g][1] - py)
    groups.append({'id': g, 'x': REST[g][0], 'y': REST[g][1], **({'parent': parent} if parent else {})})

def scaled(shape_id, parent, new_id=None, clip=None):
    s = copy.deepcopy(src[shape_id])
    ax, ay = pt(s['x'], s['y'])
    s['x'], s['y'] = ax - ABS[parent][0], ay - ABS[parent][1]
    for sub in s['subpaths']:
        for p in sub['points']:
            p['x'] *= K; p['y'] *= K
            c = p.get('cubic')
            if c:
                c['inDistance'] *= K; c['outDistance'] *= K
    s['id'] = new_id or shape_id
    s['parent'] = parent
    if clip: s['clipBy'] = clip
    return s

def clip_shape(cid, kind, parent, cx, cy, w, h):
    ax, ay = pt(cx, cy)
    return {'id': cid, 'type': kind, 'parent': parent, 'x': ax - ABS[parent][0], 'y': ay - ABS[parent][1], 'width': w * K, 'height': h * K}

# dp12 is head and body in one path. It is drawn twice: once clipped to the head (moves with the
# neck) and once clipped to the body. The two copies overlap at the neck, so a tilt shows no seam.
shapes = [
    clip_shape('clipHead', 'ellipse', 'head', 40.5, 20.5, 42, 41.6),
    clip_shape('clipBody', 'rect', 'torso', 40, 52.3, 70, 29.4),
    *[scaled(f'dp{i}', 'footL') for i in range(0, 5)],
    *[scaled(f'dp{i}', 'footR') for i in range(5, 9)],
    *[scaled(f'dp{i}', 'wing') for i in range(9, 12)],
    scaled('dp12', 'torso', 'bodyFill', 'clipBody'),
    scaled('dp13', 'torso', 'bodyShadeA', 'clipBody'),
    scaled('dp14', 'torso', 'bodyShadeB'),
    scaled('dp12', 'head', 'headFill', 'clipHead'),
    scaled('dp13', 'head', 'headShade', 'clipHead'),
    scaled('dp15', 'head'),
    scaled('dp16', 'eyeL'), scaled('dp17', 'eyeL'),
    scaled('dp18', 'eyeR'), scaled('dp19', 'eyeR'),
    *[scaled(f'dp{i}', 'bill') for i in range(20, 24)],
]

def track(target, prop, *keys, ease='ease-in-out'):
    """keys: (frame, offset) pairs. x/y offsets are added to the group's rest position."""
    base = {'x': REST[target][0], 'y': REST[target][1], 'scaleX': 0, 'scaleY': 0, 'rotation': 0}[prop]
    return {'target': target, 'property': prop,
            'keyframes': [{'frame': f, 'value': base + v, **({'easing': ease} if i else {})} for i, (f, v) in enumerate(keys)]}

BLINK = lambda at: [(at, 1), (at + 5, 0.08), (at + 10, 1)]
def blink(at, last):
    keys = [(0, 1), *BLINK(at), (last, 1)]
    return [track('eyeL', 'scaleY', *keys), track('eyeR', 'scaleY', *keys)]

animations = [
    {'name': 'idle', 'fps': 60, 'duration': 240, 'loop': 'loop', 'tracks': [
        track('torso', 'scaleY', (0, 1), (120, 1.03), (240, 1)),
        track('head', 'rotation', (0, 0), (70, -2.5), (160, 2), (240, 0)),
        track('wing', 'rotation', (0, 0), (120, 5), (240, 0)),
        track('eyeL', 'scaleY', (0, 1), *BLINK(96), *BLINK(196), (240, 1)),
        track('eyeR', 'scaleY', (0, 1), *BLINK(96), *BLINK(196), (240, 1)),
    ]},
    {'name': 'wave', 'fps': 60, 'duration': 96, 'loop': 'oneShot', 'tracks': [
        track('wing', 'rotation', (0, 0), (12, 26), (28, -8), (44, 26), (60, -8), (76, 22), (96, 0)),
        track('head', 'rotation', (0, 0), (16, -6), (76, -6), (96, 0)),
        track('torso', 'scaleY', (0, 1), (14, 1.03), (96, 1)),
        *blink(50, 96),
    ]},
    {'name': 'talk', 'fps': 60, 'duration': 84, 'loop': 'oneShot', 'tracks': [
        track('bill', 'scaleY', (0, 1), (8, 1.45), (18, 1), (28, 1.4), (38, 1), (50, 1.5), (62, 1), (84, 1)),
        track('bill', 'rotation', (0, 0), (8, -5), (18, 0), (28, -4), (38, 0), (50, -6), (62, 0), (84, 0)),
        track('head', 'rotation', (0, 0), (10, -3), (30, 2), (52, -3), (84, 0)),
        track('head', 'y', (0, 0), (8, -3), (18, 0), (28, -3), (38, 0), (50, -4), (62, 0), (84, 0)),
    ]},
    {'name': 'happy', 'fps': 60, 'duration': 84, 'loop': 'oneShot', 'tracks': [
        track('root', 'scaleY', (0, 1), (8, 0.88), (16, 1.1), (30, 1.02), (40, 0.9), (48, 1.06), (60, 0.96), (72, 1), (84, 1)),
        track('root', 'scaleX', (0, 1), (8, 1.08), (16, 0.94), (30, 1), (40, 1.07), (48, 0.97), (60, 1.02), (72, 1), (84, 1)),
        track('root', 'y', (0, 0), (8, 0), (22, -46), (38, 0), (50, -16), (60, 0), (84, 0)),
        track('wing', 'rotation', (0, 0), (14, 34), (26, 10), (38, 34), (52, 8), (84, 0)),
        track('head', 'rotation', (0, 0), (14, -7), (38, 5), (60, -2), (84, 0)),
        track('eyeL', 'scaleY', (0, 1), (10, 0.3), (56, 0.3), (70, 1), (84, 1)),
        track('eyeR', 'scaleY', (0, 1), (10, 0.3), (56, 0.3), (70, 1), (84, 1)),
        track('footL', 'rotation', (0, 0), (20, 18), (38, 0), (84, 0)),
        track('footR', 'rotation', (0, 0), (20, -18), (38, 0), (84, 0)),
        track('bill', 'scaleY', (0, 1), (12, 1.4), (56, 1.4), (70, 1), (84, 1)),
    ]},
    {'name': 'oops', 'fps': 60, 'duration': 108, 'loop': 'oneShot', 'tracks': [
        track('head', 'rotation', (0, 0), (16, 11), (78, 11), (108, 0)),
        track('head', 'y', (0, 0), (16, 7), (78, 7), (108, 0)),
        track('root', 'scaleY', (0, 1), (16, 0.95), (78, 0.95), (108, 1)),
        track('wing', 'rotation', (0, 0), (16, -22), (78, -22), (108, 0)),
        track('eyeL', 'scaleY', (0, 1), (16, 0.62), (40, 0.62), (45, 0.08), (50, 0.62), (78, 0.62), (108, 1)),
        track('eyeR', 'scaleY', (0, 1), (16, 0.62), (40, 0.62), (45, 0.08), (50, 0.62), (78, 0.62), (108, 1)),
    ]},
    {'name': 'think', 'fps': 60, 'duration': 180, 'loop': 'loop', 'tracks': [
        track('head', 'rotation', (0, -8), (90, -10), (180, -8)),
        track('eyeL', 'x', (0, 4), (180, 4)), track('eyeL', 'y', (0, -5), (180, -5)),
        track('eyeR', 'x', (0, 5), (180, 5)), track('eyeR', 'y', (0, -6), (180, -6)),
        track('torso', 'scaleY', (0, 1), (90, 1.025), (180, 1)),
        track('wing', 'rotation', (0, 8), (90, 12), (180, 8)),
    ]},
]

ONE_SHOTS = ['wave', 'talk', 'happy', 'oops']
state_machine = {
    'name': 'Duck',
    'inputs': [*({'name': n, 'type': 'trigger'} for n in ONE_SHOTS), {'name': 'thinking', 'type': 'bool', 'initial': False}],
    'states': [{'name': a['name'], 'animation': a['name']} for a in animations],
    'transitions': [
        {'from': 'entry', 'to': 'idle'},
        # Any state: a trigger interrupts whatever is playing, with a short blend.
        *({'from': 'any', 'to': n, 'durationMs': 90, 'condition': {'input': n}} for n in ONE_SHOTS),
        *({'from': n, 'to': 'idle', 'durationMs': 180, 'exitTimeMs': round(next(a for a in animations if a['name'] == n)['duration'] / 60 * 1000)} for n in ONE_SHOTS),
        {'from': 'idle', 'to': 'think', 'durationMs': 220, 'condition': {'input': 'thinking'}},
        {'from': 'think', 'to': 'idle', 'durationMs': 220, 'condition': {'input': 'thinking', 'value': False}},
    ],
}

scene = {'artboard': {'name': 'Duck', 'width': W, 'height': H}, 'groups': groups, 'shapes': shapes, 'animations': animations, 'stateMachine': state_machine}
json.dump({'outPath': out_riv, 'scene': scene, 'previewTime': 0.2}, open(out_args, 'w'))
print('shapes', len(shapes), 'groups', len(groups), 'animations', [a['name'] for a in animations])
