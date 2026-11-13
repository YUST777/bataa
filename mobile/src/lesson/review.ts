import { lessons } from '@/data/course'
import type { QuizTask, Task } from '@/types'

/** Up to five random questions from finished lessons (learn cards are not questions). */
export function reviewTasks(done: string[]): Task[] {
  const pool = lessons.filter((l) => done.includes(l.id)).flatMap((l) => l.tasks.filter((t): t is QuizTask => t.type !== 'learn'))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 5)
}
