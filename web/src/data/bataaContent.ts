/**
 * Product content and the small lesson engine used by Bataa's mobile
 * experience.  Copy is intentionally English-only in this MVP.
 *
 * The UI should render this data rather than hard-coding lesson strings.  That
 * keeps the visual prototype easy to expand while preserving one vocabulary
 * for concepts, rewards, and actions.
 */

export type ExerciseKind = 'code' | 'preview-interaction'

export type CodeLanguage = 'html' | 'css'

export interface Hint {
  /** The short label shown before the hint is opened. */
  label: string
  /** A useful clue, never the full answer on the first hint. */
  text: string
}

export interface CodeExpectation {
  language: CodeLanguage
  /** Text or regular expressions that must occur in the learner's code. */
  includes?: string[]
  patterns?: RegExp[]
  /** CSS property names that must have a declaration. */
  requiredProperties?: string[]
  /** CSS property names where demonstrating any one is enough. */
  atLeastOneProperties?: string[]
}

export interface PreviewSpec {
  /** Human-readable label above the rendered result. */
  label: string
  /** The HTML that the preview renderer can safely inject into a sandbox. */
  html: string
  /** Optional CSS that is scoped to the preview sandbox. */
  css?: string
  /** Short explanation of what the learner should notice. */
  observation: string
}

export interface LessonStep {
  id: string
  kind: ExerciseKind
  stepNumber: number
  title: string
  goal: string
  explanation: string
  language?: CodeLanguage
  starterCode?: string
  /** Beginner-friendly choices for recognition exercises. The id is stored in the draft. */
  choices?: Array<{ id: string; label: string; description?: string }>
  /** The choice id accepted by the lesson checker. */
  correctChoiceId?: string
  expectation?: CodeExpectation
  preview: PreviewSpec
  hints: Hint[]
  /** Shown after a correct check. */
  success: string
  /** XP awarded for demonstrating this step. */
  xp: number
}

export interface LessonDay {
  id: string
  dayNumber: number
  title: string
  shortTitle: string
  description: string
  outcome: string
  concepts: string[]
  estimatedMinutes: number
  steps: LessonStep[]
  completionReward: {
    xp: number
    gems: number
    badge?: string
  }
}

export interface LearningPath {
  id: string
  title: string
  subtitle: string
  description: string
  units: Array<{
    id: string
    title: string
    description: string
    lessonIds: string[]
    locked: boolean
  }>
  lessons: LessonDay[]
}

/** Stable labels used by navigation and the primary daily loop. */
export const APP_COPY = {
  appName: 'Bataa',
  mentorName: 'Bataa',
  navigation: {
    home: 'Home',
    learn: 'Learn',
    goals: 'Goals',
    profile: 'Profile',
  },
  actions: {
    startToday: "Start today's task",
    startLesson: 'Start lesson',
    continue: 'Continue',
    check: 'Check',
    tryAgain: 'Try again',
    showHint: 'Show a hint',
    why: 'Why does this work?',
    resetStep: 'Reset step',
    review: 'Review lesson',
    seePath: 'See my path',
    keepDraft: 'Keep my draft',
    leaveLesson: 'Leave lesson',
  },
  labels: {
    today: "Today's task",
    continuePath: 'Continue your path',
    steps: 'Steps',
    preview: 'Preview',
    daily: 'Daily',
    weekly: 'Weekly',
    level: 'Level',
    xp: 'XP',
    gems: 'Gems',
    streak: 'Day streak',
    hearts: 'Hearts',
    locked: 'Locked',
    complete: 'Complete',
    current: 'Current',
  },
  home: {
    greeting: (name: string) => `Hi, ${name}`,
    hero: 'You are about to code amazing things',
    heroAccent: 'amazing',
    nextUp: 'Your next small win is waiting.',
    noTaskTitle: "You're all caught up",
    noTaskBody: 'Take a victory lap, or review a lesson to keep your skills fresh.',
  },
  lesson: {
    closeLabel: 'Close lesson',
    progressLabel: (current: number, total: number) => `Step ${current} of ${total}`,
    checkReady: 'Check my code',
    checking: 'Checking your work…',
    previewHint: 'Look for the change you just made.',
    wrongTitle: 'Not quite yet',
    wrongBody: 'That is a useful attempt. Let’s find the one piece that needs a change.',
    offline: 'Your draft is safe on this device. Checking will be available when you are back online.',
    unsavedTitle: 'Keep your progress?',
    unsavedBody: 'You have an unfinished step. Keep the draft so you can return to it later.',
  },
  success: {
    title: 'Excellent!',
    stepDone: (step: number) => `You completed Step ${step}.`,
    encouragement: 'Keep going!',
    earned: 'You earned',
    streakAdded: (days: number) => `${days} day streak`,
    dailyComplete: 'Today’s task is complete.',
    recapTitle: 'What you learned',
    recapBody: 'HTML gives a page structure. CSS gives that structure its look and feel.',
  },
  onboarding: {
    welcomeTitle: 'Learn by doing with Bataa',
    welcomeBody: 'Build one small web skill each day with a friendly duck mentor beside you.',
    makeTitle: 'What do you want to make?',
    makeOptions: ['Websites', 'Interactive pages', 'A little of everything'],
    levelTitle: 'Where are you starting?',
    levelOptions: ['New to code', 'I know a few basics', 'I am getting back into it'],
    timeTitle: 'How much time do you have each day?',
    timeOptions: ['5 minutes', '10 minutes', '15 minutes'],
    languageNote: 'Your learning experience is in English. Code uses standard web terms.',
    begin: 'Start my first task',
    skipAccount: 'Try the first lesson without an account',
    saveProgress: 'Create an account later to save and sync your progress.',
  },
  errors: {
    genericSave: "We couldn't save your progress. Your draft is still on this device.",
    checkUnavailable: 'We cannot check this step right now. Keep practicing and try again soon.',
    syncConflict: 'This device has newer progress. Choose which version to keep.',
    noLeaderboard: 'Your leaderboard is warming up. Complete one lesson to join it.',
  },
} as const

const htmlButtonPattern = /<button\b[^>]*>[^<]*Click\s+me[^<]*<\/button>/i
const primaryButtonClassPattern = /class\s*=\s*["'][^"']*\bprimary-button\b[^"']*["']/i

/**
 * The first week intentionally moves from recognition to a tiny real build:
 * HTML structure, CSS styling, an interaction state, and a basic usability
 * check.  Each day is small enough for a 5–15 minute mobile session.
 */
export const WEB_DEVELOPMENT_PATH: LearningPath = {
  id: 'web-development',
  title: 'Web Development Path',
  subtitle: 'Learn step by step. Build real skills.',
  description: 'Start with one button and finish your first mini web section.',
  units: [
    {
      id: 'html-essentials',
      title: 'HTML Essentials',
      description: 'Give your page a clear, accessible structure.',
      lessonIds: ['day-1-button', 'day-2-style', 'day-3-hover', 'day-4-card'],
      locked: false,
    },
    {
      id: 'css-basics',
      title: 'CSS Basics',
      description: 'Make your ideas feel polished and easy to use.',
      lessonIds: ['day-5-image-link', 'day-6-responsive'],
      locked: true,
    },
    {
      id: 'javascript-basics',
      title: 'JavaScript Basics',
      description: 'Add behavior to your pages.',
      lessonIds: ['day-7-mini-project'],
      locked: true,
    },
    {
      id: 'mini-projects',
      title: 'Mini Projects',
      description: 'Turn your new skills into small portfolio pieces.',
      lessonIds: [],
      locked: true,
    },
  ],
  lessons: [
    {
      id: 'day-1-button',
      dayNumber: 1,
      title: 'Code a button',
      shortTitle: 'Code a Button',
      description: 'Let’s build your first HTML button.',
      outcome: 'Build a real button with a label that people can understand.',
      concepts: ['HTML elements', 'Opening and closing tags', 'Visible button text'],
      estimatedMinutes: 8,
      completionReward: { xp: 40, gems: 5, badge: 'First button' },
      steps: [
        {
          id: 'day-1-step-1',
          kind: 'code',
          stepNumber: 1,
          title: 'Create the HTML structure',
          goal: 'Add a button element with the words “Click me.”',
          explanation: 'HTML gives a page its structure. A button is an element with an opening tag, text, and a closing tag.',
          language: 'html',
          choices: [
            { id: 'paragraph', label: '<p>Click me</p>', description: 'A paragraph of text' },
            { id: 'button', label: '<button>Click me</button>', description: 'A control people can tap' },
            { id: 'heading', label: '<h2>Click me</h2>', description: 'A section heading' },
          ],
          correctChoiceId: 'button',
          expectation: {
            language: 'html',
            patterns: [htmlButtonPattern],
            includes: ['<button', '</button>', 'Click me'],
          },
          preview: {
            label: 'Preview',
            html: '<button class="primary-button">Click me</button>',
            observation: 'The label is visible and the control can be found at a glance.',
          },
          hints: [
            { label: 'Small hint', text: 'Put the words Click me between the opening and closing button tags.' },
            { label: 'One more clue', text: 'The text belongs after > and before </button>.' },
            { label: 'Show the pattern', text: '<button>Click me</button>' },
          ],
          success: 'Nice work. You gave the page a real, usable button.',
          xp: 10,
        },
        {
          id: 'day-1-step-2',
          kind: 'code',
          stepNumber: 2,
          title: 'Style the button',
          goal: 'Give the button color, space, and rounded corners.',
          explanation: 'CSS controls how an element looks. These properties make the button easier to notice and tap.',
          language: 'css',
          choices: [
            { id: 'font', label: 'font-size: 12px;', description: 'Changes text size' },
            { id: 'button-style', label: 'background: #ff8500;\ncolor: white;\npadding: 12px 20px;\nborder-radius: 12px;', description: 'Adds color, space, and rounded corners' },
            { id: 'position', label: 'position: absolute;', description: 'Moves an element on the page' },
          ],
          correctChoiceId: 'button-style',
          expectation: {
            language: 'css',
            requiredProperties: ['background', 'color', 'padding', 'border-radius'],
          },
          preview: {
            label: 'Preview',
            html: '<button class="primary-button">Click me</button>',
            css: '.primary-button { background: #ff8500; color: white; padding: 12px 20px; border: 0; border-radius: 12px; }',
            observation: 'The button has a clear color, comfortable space, and a friendly shape.',
          },
          hints: [
            { label: 'Small hint', text: 'You need one declaration for the background and one for the text color.' },
            { label: 'One more clue', text: 'Padding adds space inside the button. Border radius rounds its corners.' },
            { label: 'Show the properties', text: 'background, color, padding, border-radius' },
          ],
          success: 'Great styling. Your button now looks ready to use.',
          xp: 10,
        },
        {
          id: 'day-1-step-3',
          kind: 'code',
          stepNumber: 3,
          title: 'Add a hover effect',
          goal: 'Show a small visual change when the pointer is over the button.',
          explanation: 'Interaction states give people feedback. Phones do not have hover, so Bataa simulates this state in the preview.',
          language: 'css',
          choices: [
            { id: 'hover', label: '.primary-button:hover {\n  background: #db6700;\n}', description: 'Changes the button when the pointer is over it' },
            { id: 'focus', label: '.primary-button:focus {\n  outline: none;\n}', description: 'Changes the keyboard focus state' },
            { id: 'plain', label: '.primary-button {\n  background: #db6700;\n}', description: 'Changes the button all the time' },
          ],
          correctChoiceId: 'hover',
          expectation: {
            language: 'css',
            patterns: [/:hover\s*\{/i],
            atLeastOneProperties: ['background', 'color', 'transform', 'opacity'],
          },
          preview: {
            label: 'Preview',
            html: '<button class="primary-button">Press and hold me</button>',
            css: '.primary-button { background: #ff8500; color: white; padding: 12px 20px; border: 0; border-radius: 12px; transition: transform .15s ease, background .15s ease; } .primary-button:hover { background: #db6700; transform: translateY(-2px); }',
            observation: 'The simulated hover state makes the button feel responsive.',
          },
          hints: [
            { label: 'Small hint', text: 'A hover selector uses the button class followed by :hover.' },
            { label: 'One more clue', text: 'Inside the braces, change a visual property such as background or transform.' },
            { label: 'Show the selector', text: '.primary-button:hover { }' },
          ],
          success: 'That feedback makes the control feel alive.',
          xp: 10,
        },
        {
          id: 'day-1-step-4',
          kind: 'preview-interaction',
          stepNumber: 4,
          title: 'Test your button',
          goal: 'Tap the preview and confirm that the control responds.',
          explanation: 'A button should be visible, readable, and usable. Testing the result is part of writing code.',
          preview: {
            label: 'Try it yourself',
            html: '<button class="primary-button">Click me</button>',
            css: '.primary-button { background: #ff8500; color: white; padding: 12px 20px; border: 0; border-radius: 12px; }',
            observation: 'Tap the button. Bataa checks for a visible click response.',
          },
          hints: [
            { label: 'Small hint', text: 'Tap the button once, then look for the confirmation message.' },
            { label: 'Why test?', text: 'A page is not finished until a real person can use it.' },
          ],
          success: 'You tested the complete button and it responds as expected.',
          xp: 10,
        },
      ],
    },
    {
      id: 'day-2-style',
      dayNumber: 2,
      title: 'Style it',
      shortTitle: 'Style It',
      description: 'Turn a plain control into a clear, branded button.',
      outcome: 'Choose a visual hierarchy with color, space, and type.',
      concepts: ['Color roles', 'Spacing', 'Border radius'],
      estimatedMinutes: 10,
      completionReward: { xp: 50, gems: 5 },
      steps: [],
    },
    {
      id: 'day-3-hover',
      dayNumber: 3,
      title: 'Add a hover effect',
      shortTitle: 'Add Hover Effect',
      description: 'Make your button give immediate feedback.',
      outcome: 'Use a state change to communicate that the button is interactive.',
      concepts: ['Pseudo-classes', 'Transitions', 'Feedback'],
      estimatedMinutes: 10,
      completionReward: { xp: 50, gems: 5 },
      steps: [],
    },
    {
      id: 'day-4-card',
      dayNumber: 4,
      title: 'Build a card',
      shortTitle: 'Build a Card',
      description: 'Combine structure and spacing in a small profile card.',
      outcome: 'Group related information into a readable component.',
      concepts: ['Containers', 'Headings', 'Spacing scale'],
      estimatedMinutes: 12,
      completionReward: { xp: 60, gems: 6 },
      steps: [],
    },
    {
      id: 'day-5-image-link',
      dayNumber: 5,
      title: 'Add an image and link',
      shortTitle: 'Add an Image + Link',
      description: 'Make your card useful and accessible.',
      outcome: 'Add meaningful alternative text and a clear link label.',
      concepts: ['Images', 'Alt text', 'Links'],
      estimatedMinutes: 12,
      completionReward: { xp: 60, gems: 6 },
      steps: [],
    },
    {
      id: 'day-6-responsive',
      dayNumber: 6,
      title: 'Make it responsive',
      shortTitle: 'Make It Responsive',
      description: 'Help your component adapt to a smaller screen.',
      outcome: 'Use flexible widths and a media query to protect readability.',
      concepts: ['Max width', 'Flexible layout', 'Media queries'],
      estimatedMinutes: 15,
      completionReward: { xp: 70, gems: 7 },
      steps: [],
    },
    {
      id: 'day-7-mini-project',
      dayNumber: 7,
      title: 'Review your mini project',
      shortTitle: 'Mini Project Review',
      description: 'Combine your first week of skills in one finished section.',
      outcome: 'Build a small hero section with a heading, copy, and working button.',
      concepts: ['Composition', 'Accessibility check', 'Finishing details'],
      estimatedMinutes: 15,
      completionReward: { xp: 100, gems: 10, badge: 'First project' },
      steps: [],
    },
  ],
}

export interface ValidationResult {
  valid: boolean
  /** Friendly explanation shown immediately below the editor. */
  message: string
  /** Optional line-level clue for an editor marker. */
  focus?: string
}

function hasProperty(code: string, property: string): boolean {
  // Treat the common longhand background-color declaration as satisfying a
  // background requirement. Learners should be able to use either valid CSS
  // spelling without being marked wrong for formatting rather than intent.
  const propertyPattern = property === 'background' ? 'background(?:-color)?' : property
  return new RegExp(`(?:^|[;{\\n])\\s*${propertyPattern}\\s*:`, 'i').test(code)
}

/**
 * Lightweight checks for the first lesson. They deliberately test intent, not
 * exact formatting, so learners can use single-line or multi-line CSS.
 */
export function validateStep(step: LessonStep, answer: string, previewWasTapped = false): ValidationResult {
  if (step.kind === 'preview-interaction') {
    return previewWasTapped
      ? { valid: true, message: step.success }
      : { valid: false, message: 'Tap the preview button once so we can test its response.', focus: 'preview' }
  }

  if (step.choices) {
    if (!answer) return { valid: false, message: 'Choose one answer to continue.', focus: 'choices' }
    if (answer !== step.correctChoiceId) {
      return { valid: false, message: 'Not quite. Read the descriptions and choose the best answer.', focus: 'choices' }
    }
    return { valid: true, message: step.success }
  }

  const value = answer.trim()
  const expectation = step.expectation
  if (!expectation || !value) {
    return { valid: false, message: 'Add the code for this step, then check it again.', focus: 'editor' }
  }

  const missingText = expectation.includes?.find((text) => !value.toLowerCase().includes(text.toLowerCase()))
  if (missingText) {
    return {
      valid: false,
      message: `Your code is missing ${missingText}. Look at the highlighted part and try again.`,
      focus: 'editor',
    }
  }

  const failedPattern = expectation.patterns?.find((pattern) => !pattern.test(value))
  if (failedPattern) {
    if (step.id === 'day-1-step-1') {
      return { valid: false, message: 'Wrap “Click me” inside a button element.', focus: 'editor' }
    }
    if (step.id === 'day-1-step-3') {
      return { valid: false, message: 'Add a .primary-button:hover rule, then change one visual property inside it.', focus: 'editor' }
    }
    return { valid: false, message: 'The code structure is close, but one selector still needs attention.', focus: 'editor' }
  }

  if (step.id === 'day-1-step-3') {
    const hoverRule = value.match(/\.primary-button\s*:hover\s*\{([\s\S]*?)\}/i)?.[1] ?? ''
    const hasHoverChange = ['background', 'color', 'transform', 'opacity', 'box-shadow'].some((property) => hasProperty(hoverRule, property))
    if (!hasHoverChange) {
      return { valid: false, message: 'Change one visual property inside the hover rule, such as background or transform.', focus: 'editor' }
    }
    return { valid: true, message: step.success }
  }

  const missingProperty = expectation.requiredProperties?.find((property) => !hasProperty(value, property))
  if (missingProperty) {
    return {
      valid: false,
      message: `Add a ${missingProperty} declaration. It helps complete this visual change.`,
      focus: 'editor',
    }
  }

  const hasOneProperty = expectation.atLeastOneProperties?.some((property) => hasProperty(value, property))
  if (expectation.atLeastOneProperties && !hasOneProperty) {
    return {
      valid: false,
      message: `Change one visual property inside the hover rule, such as ${expectation.atLeastOneProperties.join(', ')}.`,
      focus: 'editor',
    }
  }

  return { valid: true, message: step.success }
}

export const FIRST_LESSON = WEB_DEVELOPMENT_PATH.lessons[0]
