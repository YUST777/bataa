# Mobile Network API and Database Schemas

Use this guide for Bataa-owned mobile contracts, offline learning, and progress synchronization. Do not call or imitate private Duolingo or Mimo endpoints. Do not store hearts, gems, leagues, or desktop-tutor state.

The current TanStack/Vite app can implement the local model with IndexedDB. A future native shell may map the same schema to Room/SQLite.

## Data boundaries

- **Catalog:** courses, units, lessons, tasks, concepts, glossary, and localized content.
- **Learner:** enrollment, goal, settings, lesson progress, attempts, projects, and review strength.
- **Session:** current task, draft, hints, validation response, and resume state.
- **Sync:** queued mutations, server revisions, idempotency keys, and conflicts.
- **Telemetry:** minimal product and learning events without raw learner code by default.

Keep animation and mascot state out of authoritative learning records.

## Recommended API surface

Version Bataa's own API, for example under `/v1`. Names below are contracts, not a claim that a backend already exists.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/v1/bootstrap` | Return learner summary, current course, next lesson, settings, and catalog revision. |
| `GET` | `/v1/courses` | List available mobile courses. |
| `GET` | `/v1/courses/{courseId}` | Return units, path state, and prerequisite summaries. |
| `GET` | `/v1/lessons/{lessonId}` | Return a versioned lesson definition and validators safe for the client. |
| `POST` | `/v1/lesson-sessions` | Start or resume an attempt and return a session ID. |
| `PUT` | `/v1/lesson-sessions/{sessionId}/draft` | Save current task index and learner draft. |
| `POST` | `/v1/lesson-sessions/{sessionId}/attempts` | Validate a task submission idempotently. |
| `POST` | `/v1/lesson-sessions/{sessionId}/complete` | Finalize accepted progress and return the completion summary. |
| `GET` | `/v1/review/due` | Return concepts and mistakes due for practice. |
| `POST` | `/v1/review-sessions` | Start a review session. |
| `GET` | `/v1/progress` | Return course, unit, lesson, and concept progress. |
| `PATCH` | `/v1/settings` | Update locale, daily goal, reminder, rest day, sound, and motion preferences. |
| `POST` | `/v1/sync/batch` | Reconcile queued offline mutations in causal order. |

Return only the lesson data required for the current flow. Keep authoring metadata and server-only validation secrets out of client payloads.

## Request and response contracts

### Start a lesson session

```json
{
  "lessonId": "web-design-1-button",
  "lessonVersion": 3,
  "locale": "ar",
  "resumeSessionId": null
}
```

```json
{
  "sessionId": "lsn_01J...",
  "lessonId": "web-design-1-button",
  "lessonVersion": 3,
  "currentTaskIndex": 0,
  "taskCount": 8,
  "resumeDraft": null,
  "serverRevision": 12
}
```

### Submit a task attempt

Require an `Idempotency-Key` header or payload field generated once per logical submission.

```json
{
  "taskId": "choose-semantic-element",
  "taskVersion": 2,
  "answer": { "optionId": "button" },
  "hintLevel": 0,
  "clientAttemptedAt": "2026-08-31T18:40:00Z"
}
```

```json
{
  "accepted": true,
  "checks": [
    {
      "id": "semantic-element",
      "status": "pass",
      "conceptId": "html-button",
      "message": {
        "ar": "صحيح — عنصر button مخصص للإجراءات القابلة للضغط.",
        "en": "Correct — button is the semantic element for an action."
      }
    }
  ],
  "nextTaskIndex": 1,
  "serverRevision": 13
}
```

Represent equivalent style solutions as warnings or passes. Fail only explicit requirements or the learning objective.

## Error model

Use one machine-readable envelope:

```ts
interface ApiError {
  code:
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONTENT_VERSION_MISMATCH'
    | 'VALIDATION_UNAVAILABLE'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'OFFLINE'
  message: { ar: string; en: string }
  retryable: boolean
  requestId: string
  details?: Record<string, unknown>
}
```

Learning corrections are successful API responses with failed checks, not transport errors. Preserve the learner's draft after every error.

## Local Room/SQLite-compatible schema

Use text IDs so client-generated attempts and server records can share identifiers. Store timestamps as UTC ISO strings or integer epoch values consistently.

```sql
CREATE TABLE catalog_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY NOT NULL,
  version INTEGER NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE units (
  id TEXT PRIMARY KEY NOT NULL,
  course_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  content_json TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY NOT NULL,
  unit_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  content_json TEXT NOT NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE learner_profile (
  learner_id TEXT PRIMARY KEY NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 10,
  rest_day INTEGER,
  reminder_time TEXT,
  reduced_motion INTEGER NOT NULL DEFAULT 0,
  sound_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  server_revision INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lesson_progress (
  lesson_id TEXT PRIMARY KEY NOT NULL,
  lesson_version INTEGER NOT NULL,
  status TEXT NOT NULL,
  current_task_index INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  updated_at TEXT NOT NULL,
  server_revision INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE lesson_drafts (
  session_id TEXT PRIMARY KEY NOT NULL,
  lesson_id TEXT NOT NULL,
  lesson_version INTEGER NOT NULL,
  task_id TEXT NOT NULL,
  task_index INTEGER NOT NULL,
  answer_json TEXT NOT NULL,
  hint_level INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE attempts (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_version INTEGER NOT NULL,
  answer_json TEXT NOT NULL,
  accepted INTEGER NOT NULL,
  checks_json TEXT NOT NULL,
  hint_level INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL,
  synced_at TEXT
);

CREATE TABLE concept_progress (
  concept_id TEXT PRIMARY KEY NOT NULL,
  successful_attempts INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  strength REAL NOT NULL DEFAULT 0,
  next_review_at TEXT,
  updated_at TEXT NOT NULL,
  server_revision INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sync_outbox (
  id TEXT PRIMARY KEY NOT NULL,
  operation TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error_code TEXT
);

CREATE INDEX idx_units_course_order ON units(course_id, sort_order);
CREATE INDEX idx_lessons_unit_order ON lessons(unit_id, sort_order);
CREATE INDEX idx_attempts_lesson_task ON attempts(lesson_id, task_id);
CREATE INDEX idx_review_due ON concept_progress(next_review_at);
CREATE INDEX idx_outbox_created ON sync_outbox(created_at);
```

For IndexedDB, preserve these entity boundaries and indexes even though the storage syntax differs.

## Offline-first rules

1. Cache the active course, current lesson, and next reasonable lesson before they are needed.
2. Save drafts locally first.
3. Give every mutation a stable idempotency key.
4. Queue mutations in `sync_outbox` and replay them in creation order.
5. Mark a task provisionally accepted offline only when its validator is deterministic and bundled with the lesson version.
6. Reconcile server-only validation without deleting learner work.
7. Never duplicate progress or rewards when retrying a request.
8. Show `Saved on this device` separately from `Synced` when connectivity matters.

## Conflict policy

- Course catalog: server version wins; migrate active progress by stable lesson/task IDs.
- Settings: use the newest explicit user change, with timestamp and device ID for tie-breaking.
- Accepted attempts: merge by attempt ID; never overwrite history.
- Lesson progress: take the furthest accepted task for the same lesson version.
- Drafts: keep the newest draft and offer recovery when two meaningful edits conflict.
- Completion: monotonic; a completed lesson must not become incomplete because of an older client.

## Review scheduling

Store concept evidence separately from raw XP. A review scheduler may consider:

- Time since successful practice.
- Number and type of mistakes.
- Hints required.
- Success on a different task format.
- Transfer performance in a later build task.

Keep the algorithm configurable and measurable. Do not claim mastery from one correct multiple-choice answer.

## Security and privacy

- Authenticate every learner-specific endpoint.
- Authorize lesson progress against the active learner, not a client-supplied user ID.
- Sandbox HTML/CSS preview from the application shell.
- Reject remote scripts and unsafe URLs in beginner lessons.
- Encrypt transport and protect stored credentials with platform facilities.
- Do not send raw code, email, or free-text explanations in analytics by default.
- Provide account export and deletion paths.
- Minimize data collected from minors and follow the launch market's legal requirements.

## Telemetry taxonomy

Use stable event names and common fields:

```ts
interface LearningEvent {
  eventId: string
  eventName:
    | 'onboarding_step_completed'
    | 'lesson_started'
    | 'lesson_resumed'
    | 'task_submitted'
    | 'hint_requested'
    | 'lesson_completed'
    | 'review_completed'
  occurredAt: string
  courseId?: string
  unitId?: string
  lessonId?: string
  lessonVersion?: number
  taskId?: string
  taskKind?: string
  locale: 'ar' | 'en'
  offline: boolean
}
```

Measure learning outcomes alongside engagement: transfer-task success, mistake resolution, delayed recall, project completion, and course progress. Do not optimize only for time in app, XP, or notification opens.

## Contract acceptance checks

- Retried submissions cannot duplicate attempts or progress.
- A learner can finish the cached lesson offline and sync later.
- A content-version mismatch preserves the draft and explains recovery.
- Completion remains completed across devices.
- Arabic and English messages share stable error/check codes.
- Private competitor endpoints and undocumented schemas are absent.
- Hearts, punitive streak state, and desktop-tutor data are absent.
