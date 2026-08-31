# Bataa Desktop Live Screen AI Tutor Engine

## 1. Native Desktop Hook Architecture

Bataa floats as a lightweight transparent desktop overlay on Windows / macOS / Linux, guiding learners inside real native desktop software (e.g. Blender, VS Code, Unreal Engine).

- Inspector: Detects active window and UI element coordinates using OS accessibility tree and visual matching.
- StateEngine: Computes current step (e.g. highlight "Create Object" in Blender).
- Overlay: Renders glowing yellow bounding box (#ffd600) around the exact native desktop control.
- Event Listener: Detects user click event -> verifies action -> triggers step success.
- Mascot AI: Plays harmonic piano combo chime and speaks Arabic voice explanation.

## 2. Glowing Bounding Box Visual Specification

- Stroke Color: #ffd600 (Vibrant Golden Yellow)
- Stroke Width: 3px solid
- Glow Radius: box-shadow: 0 0 16px rgba(255, 214, 0, 0.7), inset 0 0 8px rgba(255, 214, 0, 0.3)
- Pulse Animation: 2Hz breathing pulse (opacity: 0.85 to 1.0)
- Target Label: Floating pill tag positioned top: -28px displaying action in Arabic (e.g. انقر هنا لإنشاء مجسم).
