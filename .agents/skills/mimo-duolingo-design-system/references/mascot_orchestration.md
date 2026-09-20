# Duck Mascot Orchestration

Treat the mascot as a teaching actor, not ambient decoration.

## Event states

| State | Trigger | Behavior | Exit |
| --- | --- | --- | --- |
| `idle` | No active message | Mostly still; occasional natural blink | New event |
| `introduce` | New screen or lesson | Faces dialogue and settles | Dialogue read or CTA available |
| `explain` | New concept | Small speaking motion synced to short text | Explanation completes |
| `point` | Target needs attention | Looks and points once toward the target | Target focused or acted upon |
| `wait` | Learner is working | Calm posture; no looping bounce | Input or timeout |
| `hint` | Hint requested | Points to relevant code or preview | Hint dismissed or input |
| `correct` | Submission fails | Supportive reaction, then explanation | Retry begins |
| `celebrate` | Task or lesson succeeds | One short expressive sequence | Return to neutral |

Do not play more than one communicative animation at once.

## Motion rules

- Keep idle motion nearly invisible; use an irregular blink instead of perpetual bobbing.
- Reserve large movement for a meaningful milestone.
- Keep instructional pointing under roughly one second, then hold a calm pose.
- Do not cover the editor, answer choices, bottom CTA, or system safe areas.
- Mirror directional gestures in RTL when they refer to screen position.
- Stop or reduce nonessential motion after user input begins.
- Avoid animation that shifts layout.

## Implementation guidance

- Use Rive for interactive state machines when a rigged mascot asset exists.
- Use SVG/CSS or Framer Motion for simple blink, look, or point states.
- Keep animation events driven by lesson state, not independent timers except for idle blinking.
- Load the neutral pose first so lesson content remains usable if the animation runtime fails.
- Expose a motion controller with semantic events rather than component-specific animation names.

```ts
type MascotEvent =
  | 'idle'
  | 'introduce'
  | 'explain'
  | 'point'
  | 'wait'
  | 'hint'
  | 'correct'
  | 'celebrate'

interface MascotCue {
  event: MascotEvent
  targetId?: string
  direction?: 'inline-start' | 'inline-end' | 'up' | 'down'
  dialogueKey?: string
  emphasis?: 'quiet' | 'normal' | 'milestone'
}
```

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Replace entrances with an instant pose change or crossfade.
- Replace pointing sweeps with a static pose and target outline.
- Replace celebrations with a still expression and brief color/icon feedback.
- Disable idle movement other than an optional slow blink.

Mascot dialogue must remain readable as text. Never make an animation the only instruction or feedback.
