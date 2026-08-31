# System Design Architecture: Interactive AI Learning Engine

## 1. Client-Side State Machine (MVI Pattern)

- Intent / User Actions:
  - SelectAnswer(optionId)
  - ClickScreenTarget(targetCoords, targetSelector)
  - SubmitCode(sourceCode)
  - RequestHint()
  - DismissMistakeDialog()

- Lesson State:
  - currentStepIndex: number
  - totalSteps: number
  - heartsRemaining: number (1-5)
  - currentStreak: number
  - activeHighlightBox: { x, y, width, height, label } | null
  - mistakeExplanation: { arabicTitle, arabicBody, fixHint } | null
  - xpEarned: number

## 2. Desktop Hook & Highlight Subsystem (Bataa Native)

- Process Inspector: Checks if target desktop software is installed (Blender, VS Code, Python).
- Overlay Window: Transparent click-through overlay capable of rendering glowing yellow bounding boxes around native window controls.
- Accessibility & Image Matching: Uses accessibility tree + visual matching to detect UI button coordinates.
- Audio & Mascot Synthesis: Natural Arabic TTS with reactive duck avatar expressions.

## 3. Offline Sync & Idempotency

- Lessons packaged into self-contained JSON units.
- Results stored in local SQLite/IndexedDB queue with UUID idempotency keys.
- Automatic background replay when network connection resumes.
