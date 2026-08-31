# Interactive Lesson Engine Specifications (Reverse-Engineered from Mimo & Duolingo)

## 1. Mimo Interactive Code Learning Engine

### Component Hierarchy (from `lesson_interactive_fillthegap_fragment.xml`):
1. `LessonDescriptionView` (`layout_lesson_description`): Formatted instructions with inline keyword highlights.
2. `DatabaseView` (`database_view`): Renders live SQL database table preview for database/SQL challenges.
3. `CodeHeaderView` (`codeheaderview`): File name tabs (e.g. `index.html`, `script.js`, `main.py`).
4. `CodeBodyView` (`codebodyview`): Read-only code block with blank interactive token slots.
5. `LessonOutputView` (`lesson_output_layout`): Real-time DOM preview or terminal output.
6. `InteractionKeyboardView` (`interaction_keyboard`): Specialized keyboard tray containing only valid syntax tokens (variables, brackets, keywords) to eliminate typing friction on mobile screens.
7. `ExecutableFilesFeedbackTestCaseView` (`challenge_test_case_view_interaction_keyboard`): Automated assertion test runner showing input, expected output, and actual execution output.

---

## 2. Duolingo Max AI Interaction Engine

### Component Hierarchy (from `fragment_roleplay_session_intro.xml` & `bottom_sheet_explain_my_answer.xml`):
1. `ActionBarView` (`toolbar`): Progress indicator, hearts remaining, and close action.
2. `PointingCardView` (`bubble`) & `JuicyTextView` (`bubbleText`): Speech bubble rendered with pointer triangle directing to active character.
3. Character Frame (`eddyWrapper`, `eddy`): Vector-layered character with contextual emotional expression.
4. AI Response Streamer: Renders step-by-step contextual reasoning for mistakes in conversational language.
5. `JuicyButton` (`continueButton`): Physical 3D button triggering next turn in roleplay dialogue.
