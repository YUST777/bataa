import { Suspense, lazy } from 'react'

/** What the duck is doing, driven by app events. */
export type Mood =
  | 'idle'
  | 'wave'
  | 'talk'
  | 'think'
  | 'happy'
  | 'oops'
  | 'dance'
  // Onboarding: hop into view and wave, listen to a question, nod at a choice, point at the answers.
  | 'hello'
  | 'curious'
  | 'nod'
  | 'point'

// The Rive runtime is large (its engine alone is about 2 MB), so it loads on its own. Screens with the duck
// paint at once with the egg-shaped placeholder (index.css .duck-loading) and the rig drops in when ready.
const DuckRig = lazy(() => import('./DuckRig').then((m) => ({ default: m.DuckRig })))

/** Bataa the duck (see DuckRig). `size` is roughly the duck's own width. */
export function Duck(props: { mood?: Mood; size?: number; className?: string }) {
  const width = (props.size ?? 96) * 1.4
  return (
    <Suspense fallback={<div aria-hidden className={`duck-loading pointer-events-none shrink-0 ${props.className ?? ''}`} style={{ width, height: (width * 500) / 480 }} />}>
      <DuckRig {...props} />
    </Suspense>
  )
}
