import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Flame,
  Gem,
  Heart,
  Home,
  Lightbulb,
  LockKeyhole,
  Medal,
  Play,
  RotateCcw,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { APP_COPY, FIRST_LESSON, WEB_DEVELOPMENT_PATH, validateStep } from '../data/bataaContent'
import './bataa-app.css'

type Tab = 'home' | 'learn' | 'goals' | 'profile'
type Overlay = 'task' | 'lesson' | 'success' | 'progress' | 'streak' | 'shop' | 'leaderboard' | 'settings' | 'achievements' | 'info' | null
type LessonMode = 'learn' | 'review'
type InfoKind = 'account' | 'privacy' | 'logout'

interface ProgressState {
  completedSteps: number
  xp: number
  gems: number
  streak: number
  hearts: number
  boosts: {
    'Streak Freeze': number
    'Double XP': number
    'Hint Token': number
  }
}

const DEFAULT_PROGRESS: ProgressState = {
  completedSteps: 0,
  xp: 320,
  gems: 300,
  streak: 7,
  hearts: 5,
  boosts: { 'Streak Freeze': 0, 'Double XP': 0, 'Hint Token': 0 },
}

interface LessonDraft {
  stepId: string
  answer: string
  hintIndex: number
  previewTapped: boolean
}

interface SettingsState {
  reminder: boolean
  sounds: boolean
  darkMode: boolean
}

interface OnboardingAnswers {
  goal: string
  level: string
  time: string
}

const DEFAULT_SETTINGS: SettingsState = { reminder: true, sounds: true, darkMode: false }
const DEFAULT_ONBOARDING: OnboardingAnswers = { goal: 'Websites', level: 'New to code', time: '10 minutes' }

function earnedBadgeCount(progress: ProgressState) {
  return Number(progress.completedSteps >= FIRST_LESSON.steps.length) + Number(progress.streak >= 7) + Number(progress.streak >= 10)
}

const iconForTab: Record<Tab, typeof Home> = {
  home: Home,
  learn: BookOpen,
  goals: Trophy,
  profile: UserRound,
}

function loadProgress(): ProgressState {
  try {
    const raw = window.localStorage.getItem('bataa-progress')
    const parsed = raw ? JSON.parse(raw) as unknown : null
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_PROGRESS
    const value = parsed as Record<string, unknown>
    const numberOr = (key: keyof ProgressState, fallback: number, minimum = 0) => {
      const candidate = value[key]
      return typeof candidate === 'number' && Number.isFinite(candidate)
        ? Math.max(minimum, Math.floor(candidate))
        : fallback
    }
    const rawBoosts = value.boosts
    const boosts = rawBoosts && typeof rawBoosts === 'object' && !Array.isArray(rawBoosts)
      ? rawBoosts as Record<string, unknown>
      : {}
    const boostCount = (key: keyof ProgressState['boosts']) => {
      const candidate = boosts[key]
      return typeof candidate === 'number' && Number.isFinite(candidate) ? Math.max(0, Math.floor(candidate)) : 0
    }
    return {
      completedSteps: Math.min(FIRST_LESSON.steps.length, numberOr('completedSteps', DEFAULT_PROGRESS.completedSteps)),
      xp: numberOr('xp', DEFAULT_PROGRESS.xp),
      gems: numberOr('gems', DEFAULT_PROGRESS.gems),
      streak: numberOr('streak', DEFAULT_PROGRESS.streak),
      hearts: Math.min(5, numberOr('hearts', DEFAULT_PROGRESS.hearts)),
      boosts: {
        'Streak Freeze': boostCount('Streak Freeze'),
        'Double XP': boostCount('Double XP'),
        'Hint Token': boostCount('Hint Token'),
      },
    }
  } catch {
    return DEFAULT_PROGRESS
  }
}

function loadDrafts(): Record<string, LessonDraft> {
  try {
    const raw = window.localStorage.getItem('bataa-lesson-drafts')
    const parsed = raw ? JSON.parse(raw) as unknown : null
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const knownSteps = new Map(FIRST_LESSON.steps.map((step) => [step.id, step]))
    const drafts: Record<string, LessonDraft> = {}
    Object.entries(parsed as Record<string, unknown>).forEach(([stepId, candidate]) => {
      const step = knownSteps.get(stepId)
      if (!step || !candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return
      const value = candidate as Record<string, unknown>
      const answer = typeof value.answer === 'string' ? value.answer : step.starterCode ?? ''
      const rawHintIndex = typeof value.hintIndex === 'number' && Number.isFinite(value.hintIndex) ? Math.floor(value.hintIndex) : -1
      drafts[stepId] = {
        stepId,
        answer,
        hintIndex: Math.max(-1, Math.min(step.hints.length - 1, rawHintIndex)),
        previewTapped: value.previewTapped === true,
      }
    })
    return drafts
  } catch {
    return {}
  }
}

function loadSettings(): SettingsState {
  try {
    const raw = window.localStorage.getItem('bataa-settings')
    const parsed = raw ? JSON.parse(raw) as unknown : null
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_SETTINGS
    const value = parsed as Record<string, unknown>
    return {
      reminder: typeof value.reminder === 'boolean' ? value.reminder : DEFAULT_SETTINGS.reminder,
      sounds: typeof value.sounds === 'boolean' ? value.sounds : DEFAULT_SETTINGS.sounds,
      darkMode: typeof value.darkMode === 'boolean' ? value.darkMode : DEFAULT_SETTINGS.darkMode,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function loadOnboardingAnswers(): OnboardingAnswers {
  try {
    const raw = window.localStorage.getItem('bataa-onboarding-answers')
    const parsed = raw ? JSON.parse(raw) as unknown : null
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_ONBOARDING
    const value = parsed as Record<string, unknown>
    const goals = APP_COPY.onboarding.makeOptions as readonly string[]
    const levels = APP_COPY.onboarding.levelOptions as readonly string[]
    const times = APP_COPY.onboarding.timeOptions as readonly string[]
    return {
      goal: typeof value.goal === 'string' && goals.includes(value.goal) ? value.goal : DEFAULT_ONBOARDING.goal,
      level: typeof value.level === 'string' && levels.includes(value.level) ? value.level : DEFAULT_ONBOARDING.level,
      time: typeof value.time === 'string' && times.includes(value.time) ? value.time : DEFAULT_ONBOARDING.time,
    }
  } catch {
    return DEFAULT_ONBOARDING
  }
}

function AppIcon({ name, size = 20 }: { name: 'spark' | 'code' | 'target' | 'fire' | 'gem' | 'heart' | 'trophy'; size?: number }) {
  const icons = { spark: Sparkles, code: Code2, target: Target, fire: Flame, gem: Gem, heart: Heart, trophy: Trophy }
  const Icon = icons[name]
  return <Icon size={size} strokeWidth={2.2} aria-hidden="true" />
}

function StatPill({ icon, value, tone }: { icon: 'gem' | 'fire' | 'heart'; value: number; tone: string }) {
  return <div className={`stat-pill ${tone}`}><AppIcon name={icon} size={17} /><strong>{value}</strong></div>
}

function Mascot({ mood = 'happy', className = '' }: { mood?: 'happy' | 'celebrate' | 'wave'; className?: string }) {
  return (
    <div className={`mascot-wrap mascot-${mood} ${className}`} aria-label="Bataa duck mentor">
      <div className="mascot-halo" />
      <img src="/duck2.svg" alt="" className="mascot-image" />
      {mood === 'celebrate' && <Sparkles className="mascot-spark mascot-spark-one" size={22} />}
      {mood === 'celebrate' && <Sparkles className="mascot-spark mascot-spark-two" size={16} />}
    </div>
  )
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`progress-track ${className}`}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
}

function BottomNav({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {(Object.keys(iconForTab) as Tab[]).map((item) => {
        const Icon = iconForTab[item]
        const active = tab === item
        return (
          <button key={item} className={`nav-item ${active ? 'active' : ''}`} onClick={() => onTab(item)} aria-current={active ? 'page' : undefined}>
            <span className="nav-icon"><Icon size={21} strokeWidth={active ? 2.5 : 1.8} /></span>
            <span>{APP_COPY.navigation[item]}</span>
          </button>
        )
      })}
    </nav>
  )
}

function AppHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="app-header">
      {onBack ? <button className="icon-button header-back" onClick={onBack} aria-label="Go back"><ArrowLeft size={21} /></button> : <span className="header-placeholder" aria-hidden="true" />}
      <h1>{title}</h1>
      <div className="header-right">{right ?? <span className="header-spacer" />}</div>
    </header>
  )
}

function HomeScreen({ progress, onOpen, onViewPath }: { progress: ProgressState; onOpen: (overlay: Overlay) => void; onViewPath: () => void }) {
  const pct = Math.round((progress.completedSteps / FIRST_LESSON.steps.length) * 100)
  return (
    <div className="screen screen-home">
      <div className="home-topline">
        <div className="profile-greeting">
          <span className="home-wordmark" aria-label="Bataa">bataa</span>
          <div><span className="eyebrow">GOOD MORNING</span><strong>{APP_COPY.home.greeting('Jaques')}</strong></div>
        </div>
        <div className="top-stats"><StatPill icon="gem" value={progress.gems} tone="gold" /><StatPill icon="fire" value={progress.streak} tone="coral" /></div>
      </div>

      <section className="home-hero-card">
        <div className="hero-copy"><span className="eyebrow accent-eyebrow">YOUR DAILY BUILD</span><h2>You are about to code <em>amazing</em> things.</h2><p>{APP_COPY.home.nextUp}</p></div>
        <Mascot mood="happy" className="home-mascot" />
        <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
      </section>

      <section className="today-card" aria-labelledby="today-heading">
        <div className="section-row"><div><span className="eyebrow">{APP_COPY.labels.today}</span><h2 id="today-heading">{FIRST_LESSON.shortTitle}</h2></div><span className="time-chip"><ClockIcon /> {FIRST_LESSON.estimatedMinutes} min</span></div>
        <p>{FIRST_LESSON.description}</p>
        <div className="today-meta"><span><AppIcon name="code" size={16} /> {FIRST_LESSON.concepts[0]}</span><span>{progress.completedSteps}/{FIRST_LESSON.steps.length} steps</span></div>
        <ProgressBar value={pct} />
        <button className="primary-button" onClick={() => onOpen('task')}>{progress.completedSteps >= FIRST_LESSON.steps.length ? 'Review today’s task' : progress.completedSteps > 0 ? 'Continue today’s task' : APP_COPY.actions.startToday}<ChevronRight size={18} /></button>
      </section>

      <section className="path-preview">
        <div className="section-row"><h2>{APP_COPY.labels.continuePath}</h2><button className="text-button" onClick={onViewPath}>View path <ChevronRight size={16} /></button></div>
        <div className="path-list">
          {FIRST_LESSON.steps.map((step, index) => {
            const done = index < progress.completedSteps
            const current = index === progress.completedSteps
            const interactive = done || current
            return <button className={`path-step ${done ? 'done' : ''} ${current ? 'current' : ''} ${!interactive ? 'locked' : ''}`} key={step.id} onClick={interactive ? () => onOpen('task') : undefined} disabled={!interactive} aria-disabled={!interactive} title={!interactive ? 'Finish the previous step to unlock this step' : undefined}><span className="path-node">{done ? <Check size={15} /> : current ? <Code2 size={15} /> : <LockKeyhole size={14} />}</span><span><small>STEP {index + 1}</small><strong>{step.title.replace('Create the HTML structure', 'Create the HTML')}</strong></span>{interactive && <ChevronRight size={16} className="path-chevron" />}</button>
          })}
        </div>
      </section>

    </div>
  )
}

function ClockIcon() { return <span className="clock-icon"><span /></span> }

function TaskScreen({ progress, onBack, onStart, onCalendar }: { progress: ProgressState; onBack: () => void; onStart: () => void; onCalendar: () => void }) {
  const completed = progress.completedSteps
  return <div className="screen overlay-screen"><AppHeader title="Today’s Task" onBack={onBack} right={<button className="icon-button header-calendar" onClick={onCalendar} aria-label="Open streak calendar"><CalendarDays size={20} /></button>} />
    <main className="task-content">
      <section className="task-intro-card"><div className="task-intro-copy"><span className="day-label">DAY 1 <span className="dot-separator">•</span> {FIRST_LESSON.estimatedMinutes} MIN</span><h2>{FIRST_LESSON.shortTitle}</h2><p>{FIRST_LESSON.description}</p><div className="concept-row">{FIRST_LESSON.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div></div><div className="task-code-orb"><Code2 size={30} /></div></section>
      <div className="task-section-heading"><div><span className="eyebrow">YOUR PROGRESS</span><h2>Steps <span>({completed}/{FIRST_LESSON.steps.length})</span></h2></div><span className="task-percent">{Math.round((completed / FIRST_LESSON.steps.length) * 100)}%</span></div>
      <ProgressBar value={(completed / FIRST_LESSON.steps.length) * 100} className="task-progress" />
      <div className="step-list">{FIRST_LESSON.steps.map((step, index) => { const done = index < completed; const current = index === completed; return <div className={`task-step-row ${done ? 'done' : ''} ${current ? 'current' : ''}`} key={step.id}><span className="task-step-number">{done ? <Check size={16} /> : index + 1}</span><div><strong>{step.title}</strong><p>{step.goal}</p></div>{done ? <span className="done-label">Done</span> : current ? <span className="current-label">Next</span> : <LockKeyhole size={17} className="step-lock" />}</div> })}</div>
      <div className="task-bottom-note"><CircleHelp size={18} /><span>Every step is a small, real piece of a web page.</span></div>
      <button className="primary-button task-start-button" onClick={onStart}>{completed === FIRST_LESSON.steps.length ? 'Review lesson' : APP_COPY.actions.startLesson}<Play size={17} fill="currentColor" /></button>
    </main>
  </div>
}

function LearnScreen({ progress, onOpen }: { progress: ProgressState; onOpen: (overlay: Overlay) => void }) {
  const total = WEB_DEVELOPMENT_PATH.lessons.length
  const [section, setSection] = useState<'paths' | 'practice' | 'saved'>('paths')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState('All skills')
  const tabs: Array<{ id: typeof section; label: string }> = [{ id: 'paths', label: 'Paths' }, { id: 'practice', label: 'Practice' }, { id: 'saved', label: 'Saved' }]
  const visibleUnits = filter === 'All skills'
    ? WEB_DEVELOPMENT_PATH.units
    : WEB_DEVELOPMENT_PATH.units.filter((unit) => {
      const query = filter.toLowerCase()
      return unit.title.toLowerCase().includes(query) || unit.description.toLowerCase().includes(query) || unit.lessonIds.some((lessonId) => WEB_DEVELOPMENT_PATH.lessons.find((lesson) => lesson.id === lessonId)?.concepts.some((concept) => concept.toLowerCase().includes(query)))
    })

  return <div className="screen"><AppHeader title="Learn" right={<button className="icon-button" onClick={() => setFilterOpen((value) => !value)} aria-expanded={filterOpen} aria-label="Filter courses"><SlidersHorizontal size={19} /></button>} />
    <main className="learn-content"><div className="learn-tabs">{tabs.map((tab) => <button key={tab.id} className={section === tab.id ? 'selected' : ''} onClick={() => setSection(tab.id)}>{tab.label}</button>)}</div>
      {filterOpen && <div className="filter-panel" role="group" aria-label="Course filters">{['All skills', 'HTML', 'CSS'].map((option) => <button key={option} className={filter === option ? 'selected' : ''} onClick={() => { setFilter(option); setFilterOpen(false) }} aria-pressed={filter === option}>{option}<Check size={14} /></button>)}</div>}
      {section === 'paths' && <><section className="featured-path-card"><div className="featured-path-top"><div><span className="eyebrow accent-eyebrow">FEATURED PATH</span><h2>{WEB_DEVELOPMENT_PATH.title}</h2><p>{filter === 'All skills' ? WEB_DEVELOPMENT_PATH.subtitle : `${filter} practice inside a guided path.`}</p></div><div className="path-badge"><Code2 size={23} /><span>01</span></div></div><div className="featured-progress-row"><span>{progress.completedSteps > 0 ? 'In progress' : 'Ready to start'}</span><strong>{Math.round((progress.completedSteps / (total * 4)) * 100)}%</strong></div><ProgressBar value={(progress.completedSteps / (total * 4)) * 100} /><button className="secondary-button" onClick={() => onOpen('task')}>{progress.completedSteps ? 'Continue path' : 'Start path'} <ChevronRight size={17} /></button></section><div className="section-row learn-section-title"><div><span className="eyebrow">THE CURRICULUM</span><h2>Build your first web component</h2></div><span className="lesson-count">7 days</span></div><div className="unit-list">{visibleUnits.map((unit) => {
        const unitIndex = WEB_DEVELOPMENT_PATH.units.indexOf(unit)
        const content = <><div className="unit-number">{unit.locked ? <LockKeyhole size={16} /> : unitIndex + 1}</div><div className="unit-copy"><div className="unit-title-row"><strong>{unit.title}</strong>{unit.locked ? <span className="locked-label">LOCKED</span> : <span className="available-label">{unit.lessonIds.length} lessons</span>}</div><p>{unit.description}</p>{!unit.locked && <div className="unit-mini-progress"><ProgressBar value={(progress.completedSteps / FIRST_LESSON.steps.length) * 100} /><span>{progress.completedSteps > 0 ? `${Math.min(progress.completedSteps, FIRST_LESSON.steps.length)} of ${FIRST_LESSON.steps.length} steps` : 'Not started'}</span></div>}</div></>
        return unit.locked ? <div className="unit-card locked" key={unit.id} aria-disabled="true">{content}</div> : <button type="button" className="unit-card" key={unit.id} onClick={() => onOpen('task')}>{content}<ChevronRight size={18} className="unit-chevron" /></button>
      })}</div></>}
      {section === 'practice' && <section className="empty-state"><span className="empty-state-icon"><Target size={25} /></span><span className="eyebrow accent-eyebrow">PRACTICE MODE</span><h2>Turn a concept into a habit.</h2><p>Review a finished step or start today’s guided lesson. Practice stays short, focused, and useful.</p><button className="secondary-button" onClick={() => onOpen('task')}>Open today’s practice <ChevronRight size={17} /></button></section>}
      {section === 'saved' && (progress.completedSteps >= FIRST_LESSON.steps.length ? <section className="saved-project-card"><span className="empty-state-icon"><Code2 size={25} /></span><span className="eyebrow accent-eyebrow">SAVED PROJECT</span><h2>Code a Button</h2><p>Your first button build is ready to revisit and improve.</p><button className="secondary-button" onClick={() => onOpen('task')}>Reopen the project <ChevronRight size={17} /></button></section> : <section className="empty-state"><span className="empty-state-icon"><BookOpen size={25} /></span><span className="eyebrow accent-eyebrow">YOUR SAVED WORK</span><h2>No saved projects yet.</h2><p>Finish a lesson to save your first small project and come back to it whenever you want.</p><button className="secondary-button" onClick={() => onOpen('task')}>Start your first build <ChevronRight size={17} /></button></section>)}
    </main>
  </div>
}

function GoalsScreen({ progress, onOpen }: { progress: ProgressState; onOpen: (overlay: Overlay) => void }) {
  const lessonStepCount = FIRST_LESSON.steps.length
  const dailyPercent = Math.min(100, Math.round((progress.completedSteps / lessonStepCount) * 100))
  const [section, setSection] = useState<'today' | 'weekly' | 'badges'>('today')
  const tabs: Array<{ id: typeof section; label: string }> = [{ id: 'today', label: 'Today' }, { id: 'weekly', label: 'This week' }, { id: 'badges', label: 'Badges' }]
  const earnedXp = Math.max(0, progress.xp - DEFAULT_PROGRESS.xp)
  return <div className="screen"><AppHeader title="Goals" right={<div className="goal-bell"><Target size={18} /><span>3</span></div>} /><main className="goals-content"><div className="goal-tabs">{tabs.map((tab) => <button key={tab.id} className={section === tab.id ? 'selected' : ''} onClick={() => setSection(tab.id)}>{tab.label}</button>)}</div>{section === 'today' && <><section className="goal-summary"><div><span className="eyebrow">YOUR MOMENTUM</span><h2>Keep your streak moving.</h2><p>One focused lesson is enough for today.</p></div><div className="goal-ring"><strong>{progress.streak}</strong><span>days</span></div></section><div className="goal-list"><GoalCard icon={<Check />} title="Complete today’s lesson" detail={`${Math.min(progress.completedSteps, lessonStepCount)}/${lessonStepCount} steps`} value={dailyPercent} complete={progress.completedSteps >= lessonStepCount} onClick={() => onOpen('task')} /><GoalCard icon={<Zap />} title="Earn 20 XP" detail={`${Math.min(earnedXp, 20)}/20 XP`} value={Math.min(100, earnedXp * 5)} complete={earnedXp >= 20} onClick={() => onOpen('task')} /><GoalCard icon={<Flame />} title="Code 2 days in a row" detail={`${progress.streak >= 2 ? 2 : 1}/2 days`} value={progress.streak >= 2 ? 100 : 50} complete={progress.streak >= 2} onClick={() => onOpen('streak')} /></div></>}{section === 'weekly' && <section className="empty-state goal-empty"><span className="empty-state-icon"><CalendarDays size={25} /></span><span className="eyebrow accent-eyebrow">WEEKLY GOALS</span><h2>Finish your first build.</h2><p>Complete all {lessonStepCount} steps in Code a Button to unlock your weekly builder badge.</p><ProgressBar value={dailyPercent} /><button className="secondary-button" onClick={() => onOpen('task')}>Continue this week <ChevronRight size={17} /></button></section>}{section === 'badges' && <section className="empty-state goal-empty"><span className="empty-state-icon"><Award size={25} /></span><span className="eyebrow accent-eyebrow">ACHIEVEMENTS</span><h2>{earnedBadgeCount(progress) ? 'Your badges are growing.' : 'Your first badge is close.'}</h2><p>{earnedBadgeCount(progress) ? `${earnedBadgeCount(progress)} badge${earnedBadgeCount(progress) === 1 ? '' : 's'} earned. Keep building to collect them all.` : 'Finish all four steps in Code a Button to earn the First button badge.'}</p><button className="secondary-button" onClick={() => onOpen('achievements')}>View achievements <ChevronRight size={17} /></button></section>}<section className="goals-shortcuts"><button onClick={() => onOpen('progress')}><span className="shortcut-icon purple"><Target size={18} /></span><span><strong>Your progress</strong><small>See skills and weekly activity</small></span><ChevronRight size={18} /></button><button onClick={() => onOpen('leaderboard')}><span className="shortcut-icon purple"><Trophy size={18} /></span><span><strong>Leaderboard</strong><small>See how you compare</small></span><ChevronRight size={18} /></button><button onClick={() => onOpen('streak')}><span className="shortcut-icon orange"><Flame size={18} /></span><span><strong>Streak calendar</strong><small>Protect your momentum</small></span><ChevronRight size={18} /></button></section></main></div>
}

function GoalCard({ icon, title, detail, value, complete, onClick }: { icon: ReactNode; title: string; detail: string; value: number; complete?: boolean; onClick: () => void }) {
  return <button className={`goal-card ${complete ? 'complete' : ''}`} onClick={onClick}><span className="goal-icon">{complete ? <Check size={19} /> : icon}</span><span className="goal-copy"><strong>{title}</strong><small>{detail}</small><ProgressBar value={value} /></span><span className="goal-value">{complete ? 'Done' : `${Math.round(value)}%`}</span></button>
}

function ProfileScreen({ progress, onOpen }: { progress: ProgressState; onOpen: (overlay: Overlay) => void }) {
  return <div className="screen"><header className="profile-header"><button className="icon-button" aria-label="Open settings" onClick={() => onOpen('settings')}><Settings size={20} /></button></header><main className="profile-content"><Mascot mood="wave" className="profile-mascot" /><h1>Jaques</h1><p className="profile-tagline">Keep coding, keep growing.</p><span className="level-chip"><Medal size={15} /> Level 3 · Web Builder</span><div className="profile-stats"><StatItem icon={<Flame size={20} />} value={progress.streak} label="Day streak" /><StatItem icon={<StarIcon />} value={progress.xp} label="Total XP" /><StatItem icon={<Trophy size={20} />} value={earnedBadgeCount(progress)} label="Badges" /></div><section className="profile-menu"><button onClick={() => onOpen('achievements')}><span><Award size={19} /> Achievements</span><ChevronRight size={18} /></button><button onClick={() => onOpen('shop')}><span><ShoppingBag size={19} /> Shop</span><ChevronRight size={18} /></button><button onClick={() => onOpen('settings')}><span><Settings size={19} /> Settings</span><ChevronRight size={18} /></button></section></main></div>
}

function StarIcon() { return <Sparkles size={20} /> }
function StatItem({ icon, value, label }: { icon: ReactNode; value: number; label: string }) { return <div><span className="profile-stat-icon">{icon}</span><strong>{value}</strong><small>{label}</small></div> }

function ProgressScreen({ progress, onBack }: { progress: ProgressState; onBack: () => void }) {
  const activeDays = Math.min(7, Math.max(progress.streak, progress.completedSteps > 0 ? 1 : 0))
  const week = Array.from({ length: 7 }, (_, index) => index < activeDays)
  const htmlSkill = progress.completedSteps >= 1 ? 100 : 0
  const cssSkill = progress.completedSteps >= 3 ? 100 : progress.completedSteps >= 2 ? 60 : 0
  const levelXp = Math.min(250, Math.max(0, progress.xp - DEFAULT_PROGRESS.xp))
  return <div className="screen overlay-screen"><AppHeader title="Your progress" onBack={onBack} /><main className="progress-content"><section className="level-card"><div className="level-medal"><strong>3</strong></div><div><span className="eyebrow accent-eyebrow">CURRENT LEVEL</span><h2>Web Builder</h2><p>{levelXp} / 250 XP to level 4</p><ProgressBar value={(levelXp / 250) * 100} /></div></section><span className="eyebrow progress-section-label">STATS</span><div className="progress-stat-grid"><StatItem icon={<Flame size={20} />} value={progress.streak} label="Day streak" /><StatItem icon={<StarIcon />} value={progress.xp} label="Total XP" /><StatItem icon={<Trophy size={20} />} value={earnedBadgeCount(progress)} label="Badges" /></div><section className="activity-card"><div className="section-row"><div><span className="eyebrow">THIS WEEK</span><h2>Weekly activity</h2></div><span className="activity-total">{week.filter(Boolean).length} days</span></div><div className="activity-days">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className={week[index] ? 'active' : ''}><span>{week[index] ? <Check size={14} /> : ''}</span><small>{day}</small></div>)}</div></section><section className="skills-card"><div className="section-row"><div><span className="eyebrow">SKILLS</span><h2>What you can do</h2></div></div><SkillRow name="HTML" value={htmlSkill} color="orange" /><SkillRow name="CSS" value={cssSkill} color="coral" /><SkillRow name="JavaScript" value={0} color="purple" /></section></main></div>
}
function SkillRow({ name, value, color }: { name: string; value: number; color: string }) { return <div className="skill-row"><span>{name}</span><div className="skill-bar"><i className={color} style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div> }

function LessonScreen({ progress, mode, drafts, onDraftChange, onClearDraft, onBack, onComplete }: { progress: ProgressState; mode: LessonMode; drafts: Record<string, LessonDraft>; onDraftChange: (draft: LessonDraft) => void; onClearDraft: (stepId: string) => void; onBack: () => void; onComplete: (step: number, reward: number, mode: LessonMode) => void }) {
  const [reviewStepIndex, setReviewStepIndex] = useState(0)
  const [reviewedSteps, setReviewedSteps] = useState<Set<string>>(() => new Set())
  const stepIndex = mode === 'review' ? reviewStepIndex : Math.min(progress.completedSteps, FIRST_LESSON.steps.length - 1)
  const step = FIRST_LESSON.steps[stepIndex]
  const savedDraft = drafts[step.id]
  const [answer, setAnswer] = useState(savedDraft?.answer ?? (step.choices ? '' : step.starterCode ?? ''))
  const [hintIndex, setHintIndex] = useState(savedDraft?.hintIndex ?? -1)
  const [feedback, setFeedback] = useState<{ valid: boolean; message: string } | null>(null)
  const [previewTapped, setPreviewTapped] = useState(savedDraft?.previewTapped ?? false)
  const [isChecking, setIsChecking] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const checkTimerRef = useRef<number | null>(null)
  const completionTimerRef = useRef<number | null>(null)
  const checkingRef = useRef(false)
  const completionQueuedRef = useRef(false)

  useEffect(() => {
    const draft = drafts[step.id]
    setAnswer(draft?.answer ?? (step.choices ? '' : step.starterCode ?? ''))
    setHintIndex(draft?.hintIndex ?? -1)
    setFeedback(null)
    setPreviewTapped(draft?.previewTapped ?? false)
    setShowWhy(false)
    completionQueuedRef.current = false
    return () => {
      if (checkTimerRef.current !== null) window.clearTimeout(checkTimerRef.current)
      if (completionTimerRef.current !== null) window.clearTimeout(completionTimerRef.current)
      checkTimerRef.current = null
      completionTimerRef.current = null
      checkingRef.current = false
      completionQueuedRef.current = false
    }
  }, [step.id])

  const persistDraft = (next: Partial<LessonDraft> = {}) => onDraftChange({ stepId: step.id, answer, hintIndex, previewTapped, ...next })
  const previewStyle = useMemo(() => {
    if (stepIndex === 0) return undefined
    const choiceLabel = step.choices?.find((choice) => choice.id === answer)?.label
    const previewSource = choiceLabel ?? answer
    const hasDeclaration = (property: string) => {
      const name = property === 'background' ? 'background(?:-color)?' : property
      return new RegExp(`(?:^|[;{\\n])\\s*${name}\\s*:`, 'i').test(previewSource)
    }
    return { background: hasDeclaration('background') ? '#ff8500' : '#e9d6bd', color: hasDeclaration('color') ? '#fff' : '#3f2716', padding: hasDeclaration('padding') ? '11px 18px' : '8px 14px', borderRadius: hasDeclaration('border-radius') ? '11px' : '5px' }
  }, [answer, step, stepIndex])

  const check = () => {
    if (isChecking || checkingRef.current || completionQueuedRef.current) return
    checkingRef.current = true
    setIsChecking(true)
    checkTimerRef.current = window.setTimeout(() => {
      checkTimerRef.current = null
      const result = validateStep(step, answer, previewTapped)
      setFeedback(result)
      checkingRef.current = false
      setIsChecking(false)
      if (!result.valid) return
      completionQueuedRef.current = true
      completionTimerRef.current = window.setTimeout(() => {
        completionTimerRef.current = null
        if (mode === 'review') {
          onClearDraft(step.id)
          const nextReviewedSteps = new Set(reviewedSteps)
          nextReviewedSteps.add(step.id)
          setReviewedSteps(nextReviewedSteps)
          if (nextReviewedSteps.size < FIRST_LESSON.steps.length) {
            const nextIndex = FIRST_LESSON.steps.findIndex((reviewStep) => !nextReviewedSteps.has(reviewStep.id))
            completionQueuedRef.current = false
            setReviewStepIndex(nextIndex === -1 ? stepIndex : nextIndex)
          } else {
            onComplete(step.stepNumber, step.xp, mode)
          }
        } else {
          onClearDraft(step.id)
          onComplete(step.stepNumber, step.xp, mode)
        }
      }, 420)
    }, 280)
  }

  const cleanAnswer = step.choices ? '' : (step.starterCode ?? '')
  const dirty = answer !== cleanAnswer || hintIndex >= 0 || previewTapped || isChecking || completionQueuedRef.current
  const requestClose = () => { if (dirty) setShowCloseConfirm(true); else onBack() }
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (showCloseConfirm) setShowCloseConfirm(false)
      else requestClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dirty, showCloseConfirm])
  const keepDraftAndClose = () => { persistDraft(); setShowCloseConfirm(false); onBack() }
  const leaveLesson = () => { onClearDraft(step.id); setShowCloseConfirm(false); onBack() }
  const isPreview = step.kind === 'preview-interaction'
  const isChoice = Boolean(step.choices)
  const highlighted = feedback?.valid ? 'valid' : feedback ? 'invalid' : ''
  const progressValue = mode === 'review' ? (reviewedSteps.size / FIRST_LESSON.steps.length) * 100 : (progress.completedSteps / FIRST_LESSON.steps.length) * 100
  return <div className="screen overlay-screen lesson-screen"><header className="lesson-header"><button className="icon-button" onClick={requestClose} aria-label={APP_COPY.lesson.closeLabel}><X size={20} /></button><div className="lesson-progress-wrap"><span className="eyebrow">{mode === 'review' ? 'REVIEW' : 'DAY 1'}</span><ProgressBar value={progressValue} /></div><StatPill icon="heart" value={progress.hearts} tone="heart" /></header><main className="lesson-content">{mode === 'review' && <div className="review-step-nav" aria-label="Review steps">{FIRST_LESSON.steps.map((reviewStep, index) => <button type="button" key={reviewStep.id} className={`${index === stepIndex ? 'selected ' : ''}${reviewedSteps.has(reviewStep.id) ? 'reviewed' : ''}`} onClick={() => { if (isChecking || completionQueuedRef.current) return; setReviewStepIndex(index); setFeedback(null) }} disabled={isChecking || completionQueuedRef.current} aria-label={`Review step ${index + 1}${reviewedSteps.has(reviewStep.id) ? ', completed' : ''}`}>{index + 1}</button>)}</div>}<div className="step-kicker"><span>{APP_COPY.lesson.progressLabel(step.stepNumber, FIRST_LESSON.steps.length)}</span><span className="lesson-xp"><Zap size={14} /> {mode === 'review' ? 'Practice' : `+${step.xp} XP`}</span></div><h1>{step.title}</h1><p className="lesson-goal">{step.goal}</p><section className="concept-card"><span className="concept-icon"><Lightbulb size={18} /></span><div><strong>Why this matters</strong><p>{step.explanation}</p></div></section>{isChoice && <section className={`choice-panel ${highlighted}`}><div className="panel-heading"><span>CHOOSE ONE</span><span className="editor-label"><Lightbulb size={14} /> No typing needed</span></div><p className="choice-help">Tap the answer that best matches the goal.</p><div className="choice-options" role="group" aria-label="Answer choices">{(step.choices ?? []).map((choice, index) => <button type="button" key={choice.id} className={`choice-option ${answer === choice.id ? 'selected' : ''}`} aria-pressed={answer === choice.id} onClick={() => { if (isChecking || completionQueuedRef.current) return; setAnswer(choice.id); persistDraft({ answer: choice.id }); if (feedback) setFeedback(null) }} disabled={isChecking || completionQueuedRef.current}><span className="choice-marker">{String.fromCharCode(65 + index)}</span><span><strong>{choice.label}</strong>{choice.description && <small>{choice.description}</small>}</span></button>)}</div>{feedback && !feedback.valid && <div className="editor-marker"><CircleHelp size={15} /> {feedback.message}</div>}</section>}{isPreview ? <section className="practice-panel preview-only"><div className="panel-heading"><span>{step.preview.label}</span><span className="preview-live"><span /> LIVE</span></div><div className="preview-stage"><button className={`demo-button ${previewTapped ? 'pressed' : ''}`} style={previewStyle} onClick={() => { if (completionQueuedRef.current) return; setPreviewTapped(true); persistDraft({ previewTapped: true }) }} disabled={isChecking || completionQueuedRef.current}>Click me</button>{previewTapped && <span className="preview-confirm"><Check size={15} /> Button responded</span>}</div></section> : <><section className={`practice-panel ${highlighted} ${isChoice ? 'choice-editor-hidden' : ''}`}><div className="panel-heading"><span>{step.language?.toUpperCase()} EDITOR</span><span className="editor-label"><Code2 size={14} /> {mode === 'review' ? 'Review practice' : 'Guided practice'}</span></div><textarea aria-label={`${step.language} code editor`} spellCheck={false} value={answer} disabled={isChecking || completionQueuedRef.current} onChange={(event) => { const nextAnswer = event.target.value; setAnswer(nextAnswer); persistDraft({ answer: nextAnswer }); if (feedback) setFeedback(null) }} />{feedback && !feedback.valid && <div className="editor-marker"><CircleHelp size={15} /> {feedback.message}</div>}</section><section className="preview-card"><div className="panel-heading"><span>{APP_COPY.labels.preview}</span><span className="preview-live"><span /> UPDATES LIVE</span></div><div className="preview-stage"><button className={`demo-button ${previewTapped ? 'pressed' : ''}`} style={previewStyle} onClick={() => { if (completionQueuedRef.current) return; setPreviewTapped(true); persistDraft({ previewTapped: true }) }} disabled={isChecking || completionQueuedRef.current} aria-label="Try the preview button">Click me</button>{previewTapped && <span className="preview-confirm"><Check size={15} /> Preview responded</span>}</div><p><EyeIcon /> {step.preview.observation}</p></section></>}{feedback?.valid && <div className="feedback feedback-success" role="status" aria-live="polite"><Check size={18} /><span>{feedback.message}</span></div>}{feedback && !feedback.valid && <div className="feedback feedback-error" role="alert" aria-live="polite"><CircleHelp size={18} /><span>{APP_COPY.lesson.wrongTitle}. {APP_COPY.lesson.wrongBody}</span></div>}<div className="lesson-actions"><button className={`primary-button check-button ${isChecking ? 'loading' : ''}`} onClick={check} disabled={isChecking || completionQueuedRef.current}>{isChecking ? APP_COPY.lesson.checking : mode === 'review' ? 'Check review' : isPreview ? 'Check my test' : APP_COPY.lesson.checkReady}<Check size={17} /></button><button className="hint-button" onClick={() => { const nextHintIndex = Math.min(hintIndex + 1, step.hints.length - 1); setHintIndex(nextHintIndex); persistDraft({ hintIndex: nextHintIndex }) }} disabled={isChecking || completionQueuedRef.current}><Lightbulb size={17} /> {hintIndex >= 0 ? step.hints[hintIndex].label : APP_COPY.actions.showHint}</button></div>{hintIndex >= 0 && <div className="hint-card"><span className="hint-bulb"><Lightbulb size={17} /></span><p>{step.hints[hintIndex].text}</p>{hintIndex < step.hints.length - 1 && <button onClick={() => { const nextHintIndex = hintIndex + 1; setHintIndex(nextHintIndex); persistDraft({ hintIndex: nextHintIndex }) }} disabled={isChecking || completionQueuedRef.current}>Another clue <ChevronRight size={15} /></button>}</div>}<div className="lesson-bottom-tools"><button onClick={() => { const nextAnswer = step.choices ? '' : (step.starterCode ?? ''); setAnswer(nextAnswer); setFeedback(null); setHintIndex(-1); setPreviewTapped(false); onClearDraft(step.id) }} disabled={isChecking || completionQueuedRef.current}><RotateCcw size={15} /> Reset step</button><button onClick={() => setShowWhy((value) => !value)} aria-expanded={showWhy}>{APP_COPY.actions.why} <CircleHelp size={15} /></button></div>{showWhy && <div className="why-panel" role="region" aria-label="Why this works"><strong>How this works</strong><p>{step.explanation}</p></div>}</main>{showCloseConfirm && <div className="close-confirm-backdrop" role="presentation"><section className="close-confirm" role="dialog" aria-modal="true" aria-labelledby="close-confirm-title"><span className="concept-icon"><CircleHelp size={18} /></span><h2 id="close-confirm-title">{APP_COPY.lesson.unsavedTitle}</h2><p>{APP_COPY.lesson.unsavedBody}</p><div className="close-confirm-actions"><button className="primary-button" onClick={keepDraftAndClose}>{APP_COPY.actions.keepDraft}</button><button className="secondary-button" onClick={leaveLesson}>{APP_COPY.actions.leaveLesson}</button><button className="text-button" onClick={() => setShowCloseConfirm(false)}>Stay</button></div></section></div>}</div>
}

function EyeIcon() { return <span className="eye-mini" /> }

function SuccessScreen({ progress, mode, onContinue }: { progress: ProgressState; mode: LessonMode; onContinue: () => void }) {
  const finishedDaily = mode === 'learn' && progress.completedSteps >= FIRST_LESSON.steps.length
  const reviewComplete = mode === 'review'
  return <div className="screen overlay-screen success-screen"><button className="icon-button success-close" onClick={onContinue} aria-label="Close celebration"><X size={20} /></button><main className="success-content"><Mascot mood="celebrate" className="success-mascot" /><div className="success-star"><Sparkles size={28} fill="currentColor" /></div><span className="eyebrow accent-eyebrow">{reviewComplete ? 'PRACTICE COMPLETE' : finishedDaily ? 'DAILY WIN' : 'STEP COMPLETE'}</span><h1>{reviewComplete ? 'Nice review!' : APP_COPY.success.title}</h1><p>{reviewComplete ? 'You revisited every step in today’s task.' : finishedDaily ? APP_COPY.success.dailyComplete : `You completed Step ${progress.completedSteps}.`}</p><p className="success-encouragement">{reviewComplete ? 'Review keeps the details fresh.' : APP_COPY.success.encouragement}</p>{!reviewComplete && <div className="reward-grid"><div className="reward-card"><span className="reward-icon xp"><Zap size={22} fill="currentColor" /></span><strong>+{finishedDaily ? FIRST_LESSON.completionReward.xp : 10} XP</strong><small>Progress earned</small></div><div className="reward-card"><span className="reward-icon streak"><Flame size={22} fill="currentColor" /></span><strong>{progress.streak} day streak</strong><small>Keep it going</small></div></div>}{finishedDaily && <section className="recap-card"><span className="recap-icon"><BookOpen size={17} /></span><div><strong>{APP_COPY.success.recapTitle}</strong><p>{APP_COPY.success.recapBody}</p></div></section>}<button className="primary-button success-continue" onClick={onContinue}>{reviewComplete ? 'Back to home' : finishedDaily ? 'See my path' : APP_COPY.actions.continue}<ChevronRight size={18} /></button></main></div>
}

function StreakScreen({ progress, onBack }: { progress: ProgressState; onBack: () => void }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const milestoneReached = progress.streak >= 10
  const daysToMilestone = Math.max(0, 10 - progress.streak)
  return <div className="screen overlay-screen"><AppHeader title="Day streak" onBack={onBack} /><main className="streak-content"><div className="streak-total"><div className="streak-flame"><Flame size={44} fill="currentColor" /></div><strong>{progress.streak}</strong><span>days in a row</span></div><div className="week-strip">{days.map((day, index) => <div key={`${day}-${index}`} className={index < Math.min(7, progress.streak) ? 'active' : index === 6 ? 'today' : ''}><span>{index < progress.streak ? <Check size={15} /> : ''}</span><small>{day}</small></div>)}</div><section className="streak-message"><span className="message-icon"><Sparkles size={18} /></span><div><strong>{milestoneReached ? 'Milestone reached!' : 'Great job!'}</strong><p>{milestoneReached ? 'You unlocked the ten-day builder badge.' : 'You’re building an amazing habit, one small lesson at a time.'}</p></div></section><section className="streak-next"><span className="eyebrow">NEXT MILESTONE</span><div className="milestone-row"><strong>10 day streak</strong><span>{Math.min(progress.streak, 10)}/10</span></div><ProgressBar value={(progress.streak / 10) * 100} /><p>{milestoneReached ? 'Keep learning to protect your momentum.' : `${daysToMilestone} more learning day${daysToMilestone === 1 ? '' : 's'} unlock${daysToMilestone === 1 ? 's' : ''} a streak badge.`}</p></section></main></div>
}

function ShopScreen({ progress, onBack, onPurchase }: { progress: ProgressState; onBack: () => void; onPurchase: (cost: number, title: string) => void }) {
  const [section, setSection] = useState<'boosts' | 'themes'>('boosts')
  const [notice, setNotice] = useState('')
  const items = [{ icon: <ShieldIcon />, title: 'Streak Freeze', detail: 'Protect one missed day', price: 100, tone: 'blue' }, { icon: <Zap size={28} fill="currentColor" />, title: 'Double XP', detail: 'For your next 30 min', price: 150, tone: 'purple' }, { icon: <Lightbulb size={28} />, title: 'Hint Token', detail: 'Get a gentle clue', price: 100, tone: 'gold' }, { icon: <Heart size={28} fill="currentColor" />, title: 'Heart Refill', detail: 'Restore your focus', price: 80, tone: 'coral' }]
  const buy = (cost: number, title: string) => {
    if (progress.gems < cost) {
      setNotice(`You need ${cost - progress.gems} more gems for ${title}.`)
      return
    }
    if (title === 'Heart Refill' && progress.hearts >= 5) {
      setNotice('Your hearts are already full. Save this boost for later.')
      return
    }
    onPurchase(cost, title)
    setNotice(title === 'Heart Refill' ? 'Hearts refilled. Keep building.' : `${title} added to your learning boosts.`)
  }
  return <div className="screen overlay-screen"><AppHeader title="Shop" onBack={onBack} right={<StatPill icon="gem" value={progress.gems} tone="gold" />} /><main className="shop-content"><div className="shop-tabs"><button className={section === 'boosts' ? 'selected' : ''} onClick={() => setSection('boosts')}>Boosts</button><button className={section === 'themes' ? 'selected' : ''} onClick={() => setSection('themes')}>Themes</button></div>{section === 'boosts' ? <><section className="shop-intro"><div><span className="eyebrow">OPTIONAL EXTRAS</span><h2>Support your learning.</h2><p>Spend gems on gentle boosts. The lessons are always yours.</p></div><ShoppingBag size={31} /></section><div className="shop-grid">{items.map((item) => { const owned = item.title in progress.boosts ? progress.boosts[item.title as keyof ProgressState['boosts']] : null; return <button className="shop-item" key={item.title} onClick={() => buy(item.price, item.title)}><span className={`shop-art ${item.tone}`}>{item.icon}</span><strong>{item.title}</strong><small>{item.detail}</small>{owned !== null && <span className="shop-owned">Owned: {owned}</span>}<span className="shop-price"><Gem size={16} /> {item.price}</span></button> })}</div></> : <section className="empty-state"><span className="empty-state-icon"><Sparkles size={25} /></span><span className="eyebrow accent-eyebrow">COSMETIC THEMES</span><h2>Make your learning space yours.</h2><p>Theme packs will unlock as you complete projects. Your lessons never require a purchase.</p><button className="secondary-button" onClick={() => setNotice('Finish your first project to unlock a theme.')}>How do I unlock themes? <CircleHelp size={17} /></button></section>}{notice && <div className="shop-notice" role="status" aria-live="polite"><Check size={16} /> {notice}</div>}</main></div>
}
function ShieldIcon() { return <span className="shield-icon"><Check size={14} /></span> }

function LeaderboardScreen({ progress, onBack }: { progress: ProgressState; onBack: () => void }) {
  const [section, setSection] = useState<'global' | 'friends' | 'country'>('global')
  const roster = section === 'friends' ? [{ name: 'Maya', xp: 950, tone: 'coral' }, { name: 'You', xp: progress.xp, tone: 'you' }, { name: 'Zain', xp: 280, tone: 'purple' }] : section === 'country' ? [{ name: 'Omar', xp: 780, tone: 'green' }, { name: 'You', xp: progress.xp, tone: 'you' }, { name: 'Zain', xp: 280, tone: 'purple' }] : [{ name: 'Alex', xp: 1250, tone: 'blue' }, { name: 'Maya', xp: 950, tone: 'coral' }, { name: 'Omar', xp: 780, tone: 'green' }, { name: 'You', xp: progress.xp, tone: 'you' }, { name: 'Zain', xp: 280, tone: 'purple' }]
  const people = [...roster].sort((a, b) => b.xp - a.xp).map((person, index) => ({ ...person, rank: index + 1 }))
  const tabs: Array<{ id: typeof section; label: string }> = [{ id: 'global', label: 'Global' }, { id: 'friends', label: 'Friends' }, { id: 'country', label: 'Country' }]
  return <div className="screen overlay-screen"><AppHeader title="Leaderboard" onBack={onBack} /><main className="leaderboard-content"><div className="leaderboard-tabs">{tabs.map((tab) => <button key={tab.id} className={section === tab.id ? 'selected' : ''} onClick={() => setSection(tab.id)}>{tab.label}</button>)}</div><section className="leaderboard-intro"><Trophy size={30} /><div><strong>Weekly builders</strong><p>Learn together, one XP at a time.</p></div></section><div className="leader-list">{people.map((person) => <div className={`leader-row ${person.name === 'You' ? 'you' : ''}`} key={person.name}><span className={`rank rank-${person.rank}`}>{person.rank}</span><span className={`leader-avatar ${person.tone}`}>{person.name.slice(0, 1)}</span><strong>{person.name}</strong><span className="leader-xp">{person.xp} XP</span></div>)}</div><p className="leader-note"><Sparkles size={15} /> Your row is highlighted so you always know where you stand.</p></main></div>
}

function SettingsScreen({ settings, onChange, onInfo, onBack }: { settings: SettingsState; onChange: (next: SettingsState) => void; onInfo: (kind: InfoKind) => void; onBack: () => void }) {
  return <div className="screen overlay-screen"><AppHeader title="Settings" onBack={onBack} /><main className="settings-content"><SettingsGroup title="Preferences"><SettingToggle label="Daily reminder" value={settings.reminder} onChange={(value) => onChange({ ...settings, reminder: value })} /><SettingToggle label="Sound effects" value={settings.sounds} onChange={(value) => onChange({ ...settings, sounds: value })} /><SettingToggle label="Dark mode" value={settings.darkMode} onChange={(value) => onChange({ ...settings, darkMode: value })} /><div className="setting-row setting-static"><span>Language</span><span className="setting-value">English only</span></div></SettingsGroup><SettingsGroup title="Account"><button type="button" className="setting-row" onClick={() => onInfo('account')}><span>Manage account</span><ChevronRight size={17} /></button><button type="button" className="setting-row" onClick={() => onInfo('privacy')}><span>Privacy and data</span><ChevronRight size={17} /></button><button type="button" className="setting-row danger" onClick={() => onInfo('logout')}><span>Log out</span><ChevronRight size={17} /></button></SettingsGroup><section className="settings-footer"><span className="avatar avatar-tiny"><img src="/duck.svg" alt="" /></span><p>Bataa is English-only for this first release.<br /><small>Version 0.1 · Your progress stays on this device.</small></p></section></main></div>
}
function SettingsGroup({ title, children }: { title: string; children: ReactNode }) { return <section className="settings-group"><span className="eyebrow">{title}</span><div className="settings-card">{children}</div></section> }
function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <label className="setting-row"><span>{label}</span><span className={`toggle ${value ? 'on' : ''}`}><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /><span /></span></label> }

function InfoScreen({ kind, onBack }: { kind: InfoKind; onBack: () => void }) {
  const copy: Record<InfoKind, { title: string; eyebrow: string; body: string; action: string }> = {
    account: { title: 'Manage account', eyebrow: 'ACCOUNT', body: 'Account creation and sign-in will arrive in a later release. You can keep learning without an account, and your progress stays on this device.', action: 'Back to settings' },
    privacy: { title: 'Privacy and data', eyebrow: 'YOUR DATA', body: 'Bataa stores lesson progress, drafts, and preferences locally in this browser. Nothing is sent to a server in this prototype.', action: 'Back to settings' },
    logout: { title: 'Log out', eyebrow: 'ACCOUNT', body: 'There is no active account session to end yet. Your local progress is safe, so you can keep learning.', action: 'Keep learning' },
  }
  const selected = copy[kind]
  return <div className="screen overlay-screen info-screen"><AppHeader title={selected.title} onBack={onBack} /><main className="info-content"><span className="empty-state-icon"><CircleHelp size={25} /></span><span className="eyebrow accent-eyebrow">{selected.eyebrow}</span><h2>{selected.title}</h2><p>{selected.body}</p><button className="primary-button" onClick={onBack}>{selected.action}</button></main></div>
}

function AchievementsScreen({ progress, onBack }: { progress: ProgressState; onBack: () => void }) {
  const badges = [{ title: 'First button', detail: 'Complete all four steps in Code a Button.', unlocked: progress.completedSteps >= FIRST_LESSON.steps.length, icon: <Code2 size={20} /> }, { title: 'Seven day spark', detail: 'Keep a seven-day learning streak.', unlocked: progress.streak >= 7, icon: <Flame size={20} /> }, { title: 'Ten day builder', detail: 'Reach a ten-day learning streak.', unlocked: progress.streak >= 10, icon: <Medal size={20} /> }]
  return <div className="screen overlay-screen"><AppHeader title="Achievements" onBack={onBack} /><main className="achievements-content"><section className="achievement-summary"><span className="achievement-summary-icon"><Award size={24} /></span><div><span className="eyebrow accent-eyebrow">YOUR COLLECTION</span><h2>{earnedBadgeCount(progress)} of {badges.length} badges</h2><p>Every badge marks a real learning habit.</p></div></section><div className="achievement-list">{badges.map((badge) => <article className={`achievement-card ${badge.unlocked ? 'unlocked' : 'locked'}`} key={badge.title}><span className="achievement-icon">{badge.icon}</span><div><strong>{badge.title}</strong><p>{badge.detail}</p></div><span className="achievement-status">{badge.unlocked ? <Check size={16} /> : <LockKeyhole size={15} />}</span></article>)}</div><section className="learn-tip"><Sparkles size={20} /><div><strong>Keep building</strong><p>Short, consistent practice turns into skills you can use.</p></div></section></main></div>
}

export function BataaApp() {
  const [tab, setTab] = useState<Tab>('home')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [progress, setProgress] = useState<ProgressState>(loadProgress)
  const [drafts, setDrafts] = useState<Record<string, LessonDraft>>(loadDrafts)
  const [settings, setSettings] = useState<SettingsState>(loadSettings)
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers>(loadOnboardingAnswers)
  const [onboarding, setOnboarding] = useState(() => { try { return !window.localStorage.getItem('bataa-onboarding-complete') } catch { return false } })
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [lessonMode, setLessonMode] = useState<LessonMode>('learn')
  const [successMode, setSuccessMode] = useState<LessonMode>('learn')
  const [infoKind, setInfoKind] = useState<InfoKind>('account')

  useEffect(() => { try { window.localStorage.setItem('bataa-progress', JSON.stringify(progress)) } catch { /* local persistence is optional */ } }, [progress])
  useEffect(() => { try { window.localStorage.setItem('bataa-lesson-drafts', JSON.stringify(drafts)) } catch { /* local persistence is optional */ } }, [drafts])
  useEffect(() => { try { window.localStorage.setItem('bataa-settings', JSON.stringify(settings)) } catch { /* local persistence is optional */ } }, [settings])
  useEffect(() => { try { window.localStorage.setItem('bataa-onboarding-answers', JSON.stringify(onboardingAnswers)) } catch { /* local persistence is optional */ } }, [onboardingAnswers])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && overlay && overlay !== 'lesson') setOverlay(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [overlay])

  const open = (next: Overlay) => setOverlay(next)
  const close = () => setOverlay(null)
  const startLesson = () => {
    const nextMode: LessonMode = progress.completedSteps >= FIRST_LESSON.steps.length ? 'review' : 'learn'
    setLessonMode(nextMode)
    setOverlay('lesson')
  }
  const updateDraft = (draft: LessonDraft) => setDrafts((current) => ({ ...current, [draft.stepId]: draft }))
  const clearDraft = (stepId: string) => setDrafts((current) => {
    if (!current[stepId]) return current
    const next = { ...current }
    delete next[stepId]
    return next
  })
  const openInfo = (kind: InfoKind) => { setInfoKind(kind); setOverlay('info') }
  const completeStep = (step: number, reward: number, mode: LessonMode) => {
    setSuccessMode(mode)
    if (mode === 'review') {
      setOverlay('success')
      return
    }
    setProgress((current) => {
      const isNewStep = step > current.completedSteps
      const completedSteps = Math.max(current.completedSteps, step)
      const isDaily = completedSteps >= FIRST_LESSON.steps.length
      const dailyJustFinished = isDaily && current.completedSteps < FIRST_LESSON.steps.length
      return {
        ...current,
        completedSteps,
        xp: current.xp + (isNewStep ? (dailyJustFinished ? FIRST_LESSON.completionReward.xp : reward) : 0),
        gems: current.gems + (dailyJustFinished ? FIRST_LESSON.completionReward.gems : 0),
        streak: dailyJustFinished ? current.streak + 1 : current.streak,
      }
    })
    setOverlay('success')
  }
  const handleTab = (next: Tab) => { setTab(next); setOverlay(null) }

  const screen = tab === 'home' ? <HomeScreen progress={progress} onOpen={open} onViewPath={() => { setTab('learn'); setOverlay(null) }} /> : tab === 'learn' ? <LearnScreen progress={progress} onOpen={open} /> : tab === 'goals' ? <GoalsScreen progress={progress} onOpen={open} /> : <ProfileScreen progress={progress} onOpen={open} />

  const finishOnboarding = () => { setOnboarding(false); try { window.localStorage.setItem('bataa-onboarding-complete', '1') } catch { /* no-op */ } }
  if (onboarding) return <OnboardingScreen step={onboardingStep} answers={onboardingAnswers} onChange={(next) => setOnboardingAnswers((current) => ({ ...current, ...next }))} onNext={() => { if (onboardingStep >= 3) finishOnboarding(); else setOnboardingStep((value) => value + 1) }} onBack={() => setOnboardingStep((value) => Math.max(0, value - 1))} onSkip={finishOnboarding} />

  return <div className="bataa-app-root" data-theme={settings.darkMode ? 'dark' : 'light'}><div className="app-device" data-theme={settings.darkMode ? 'dark' : 'light'}>{screen}{overlay === 'task' && <TaskScreen progress={progress} onBack={close} onStart={startLesson} onCalendar={() => setOverlay('streak')} />}{overlay === 'lesson' && <LessonScreen progress={progress} mode={lessonMode} drafts={drafts} onDraftChange={updateDraft} onClearDraft={clearDraft} onBack={close} onComplete={(step, reward, mode) => completeStep(step, reward, mode)} />}{overlay === 'success' && <SuccessScreen progress={progress} mode={successMode} onContinue={() => { if (successMode === 'learn' && progress.completedSteps < FIRST_LESSON.steps.length) { setLessonMode('learn'); setOverlay('lesson') } else { close(); setTab(successMode === 'learn' && progress.completedSteps >= FIRST_LESSON.steps.length ? 'learn' : 'home') } }} />}{overlay === 'progress' && <ProgressScreen progress={progress} onBack={close} />}{overlay === 'streak' && <StreakScreen progress={progress} onBack={close} />}{overlay === 'shop' && <ShopScreen progress={progress} onBack={close} onPurchase={(cost, title) => setProgress((current) => { const boostKey = title === 'Streak Freeze' || title === 'Double XP' || title === 'Hint Token' ? title : null; return { ...current, gems: Math.max(0, current.gems - cost), hearts: title === 'Heart Refill' ? 5 : current.hearts, boosts: boostKey ? { ...current.boosts, [boostKey]: current.boosts[boostKey] + 1 } : current.boosts } })} />}{overlay === 'leaderboard' && <LeaderboardScreen progress={progress} onBack={close} />}{overlay === 'achievements' && <AchievementsScreen progress={progress} onBack={close} />}{overlay === 'settings' && <SettingsScreen settings={settings} onChange={setSettings} onInfo={openInfo} onBack={close} />}{overlay === 'info' && <InfoScreen kind={infoKind} onBack={() => setOverlay('settings')} />}{overlay === null && <BottomNav tab={tab} onTab={handleTab} />}</div></div>
}

function OnboardingScreen({ step, answers, onChange, onNext, onBack, onSkip }: { step: number; answers: OnboardingAnswers; onChange: (next: Partial<OnboardingAnswers>) => void; onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const content = [
    { title: APP_COPY.onboarding.welcomeTitle, body: APP_COPY.onboarding.welcomeBody, visual: <Mascot mood="happy" className="onboarding-mascot" /> },
    { title: APP_COPY.onboarding.makeTitle, body: 'Choose a focus for your first build.', visual: <div className="onboarding-code-card"><span>&lt;button&gt;</span><strong>Click me</strong><span>&lt;/button&gt;</span></div> },
    { title: APP_COPY.onboarding.levelTitle, body: 'Bataa will tune the first challenges to your starting point.', visual: <div className="onboarding-level-card"><Medal size={42} /><strong>{answers.level}</strong></div> },
    { title: APP_COPY.onboarding.timeTitle, body: APP_COPY.onboarding.saveProgress, visual: <div className="onboarding-time-options">{APP_COPY.onboarding.timeOptions.map((time) => <button type="button" className={answers.time === time ? 'selected' : ''} onClick={() => onChange({ time })} key={time} aria-pressed={answers.time === time}>{time}</button>)}</div> },
  ][Math.min(step, 3)]

  return (
    <div className="bataa-app-root onboarding-root">
      <div className="app-device onboarding-device">
        <main className="onboarding-content">
          <div className="onboarding-progress"><button type="button" className="text-button onboarding-back" onClick={onBack} disabled={step === 0} aria-label="Back"><ArrowLeft size={16} /></button><a href="/" className="brand-wordmark" style={{ textDecoration: 'none' }}>bataa</a><span>{step + 1} / 4</span></div>
          <div className="onboarding-visual">{content.visual}</div>
          <span className="eyebrow accent-eyebrow">A SMALL STEP EVERY DAY</span>
          <h1>{content.title}</h1>
          <p>{content.body}</p>
          {step === 1 && <div className="onboarding-choice-row">{APP_COPY.onboarding.makeOptions.map((option) => <button type="button" className={answers.goal === option ? 'selected' : ''} onClick={() => onChange({ goal: option })} key={option} aria-pressed={answers.goal === option}>{option}</button>)}</div>}
          {step === 2 && <div className="onboarding-choice-row">{APP_COPY.onboarding.levelOptions.map((option) => <button type="button" className={answers.level === option ? 'selected' : ''} onClick={() => onChange({ level: option })} key={option} aria-pressed={answers.level === option}>{option}</button>)}</div>}
          {step === 3 && <p className="onboarding-selection-note">{answers.goal} · {answers.level} · {answers.time}</p>}
          <button className="primary-button onboarding-next" onClick={onNext}>{step === 3 ? APP_COPY.onboarding.begin : 'Next'} <ChevronRight size={18} /></button>
          <button className="text-button onboarding-skip" onClick={onSkip}>{APP_COPY.onboarding.skipAccount}</button>
        </main>
      </div>
    </div>
  )
}
