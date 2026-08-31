# Mascot Orchestration & Audio Psychoacoustics Engine

## 1. The Ascending Chromatic Scale Combo Formula (Duolingo Pattern)

Extracted audio tracks: 37 chromatic piano samples (`piano_c3.mp3` to `piano_c6.mp3`).

### The Psychological Audio Mechanism:
Instead of playing a static chime for every correct answer, the audio engine computes the current in-lesson combo streak k:

- Step 1 correct: C3 (Base note)
- Step 2 correct: D3 (Step up)
- Step 3 correct: E3 (Major third - uplifting)
- Step 4 correct: F3
- Step 5 correct: G3 (Fifth - strong resolution) + `duo_juicier_5_in_row_wabing.mp3` combo chime!
- Step 6 correct: A3
- Step 7 correct: B3 (Leading note)
- Step 8 correct: C4 (Octave completion - emotional peak)!
- 100% Lesson Finished: Harmonic C-Major Chord Fanfare + `correct_answer_perfect_lesson_lightning.mp3`.

---

## 2. Rive State Machine Architecture (`.riv`)

Both Duolingo (87 Rive files) and Mimo (28 Rive files) migrated from heavy Lottie JSONs to Rive vector runtimes:

### Key State Machines:
1. **Viseme Lip-Sync State Machine** (`visemelily.riv`, `visemezari.riv`, `visemebea.riv`):
   - Inputs: `viseme_id` (A, E, I, O, U, Consonant, Rest).
   - Dynamically morphs mouth geometry in real time to match spoken TTS audio.
2. **Streak Odometer State Machine** (`se_streak_odometer_v13.riv`, `combo_flame.riv`):
   - Inputs: `flame_intensity` (0 to 100), `is_streak_extended` (boolean), `sparkle_burst` (trigger).
   - Renders fluid fire particle simulations with zero CPU rasterization overhead.
3. **Mimo AI Tutor & Hearts** (`hearts.riv`, `transformation_pro.riv`):
   - Inputs: `hearts_count` (0-5), `is_heart_broken` (trigger), `refill_pulse` (boolean).
