# Network APIs, Room Database Schemas & Telemetry Taxonomies

## 1. Network API Endpoints & Transport Layer

### Duolingo Stack (Ktor 2.3.12 + Retrofit 2.9.0 + WebSockets)
- **Base Endpoint**: `https://android-api-v2.duolingo.com/` / `https://www.duolingo.com/2017-06-30/`
- **User Sync**: `GET /2017-06-30/users/{userId}?fields=id,streakData,currentCourse,health,gems`
- **Session Init**: `POST /2017-06-30/sessions` (Type: `LESSON`, `STORY`, `LEGENDARY`, `MATH`)
- **Session Finalize**: `PUT /2017-06-30/sessions/{sessionId}` with signed payload & client-side accuracy metrics.
- **Duolingo Max AI**: `POST /2017-06-30/ai/explain_my_answer` & WebSocket stream for speech roleplay.

### Mimo Stack (Auth0 OAuth2 + Retrofit 2 + Pusher Realtime)
- **Base Endpoint**: `https://api.getmimo.com/v2/`
- **User Sync**: `GET /v2/users/me`
- **Code Cloud Sync**: `POST /v1/code/save` (AutoSave service for multi-file playgrounds)
- **Realtime Channels**: `private-user-{userId}` (Pusher protocol for cross-device heart/streak sync).

---

## 2. Room SQLite Database Schemas

### Duolingo `DuoDatabase` (Room 2.6.1)
```sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` TEXT NOT NULL PRIMARY KEY,
    `username` TEXT NOT NULL,
    `streak` INTEGER NOT NULL DEFAULT 0,
    `gems` INTEGER NOT NULL DEFAULT 0,
    `hasPlus` INTEGER NOT NULL DEFAULT 0,
    `currentCourseId` TEXT NOT NULL,
    `hearts` INTEGER NOT NULL DEFAULT 5,
    `lastHeartRefillTimestamp` INTEGER NOT NULL,
    `rawJson` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `offline_sessions` (
    `sessionId` TEXT NOT NULL PRIMARY KEY,
    `type` TEXT NOT NULL,
    `courseId` TEXT NOT NULL,
    `challengesJson` TEXT NOT NULL,
    `cachedAt` INTEGER NOT NULL,
    `isConsumed` INTEGER NOT NULL DEFAULT 0
);
```

### Mimo Room Database
```sql
CREATE TABLE IF NOT EXISTS `tracks` (
    `id` INTEGER NOT NULL PRIMARY KEY,
    `title` TEXT NOT NULL,
    `sectionsJson` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `lesson_progress` (
    `lessonId` INTEGER NOT NULL PRIMARY KEY,
    `chapterId` INTEGER NOT NULL,
    `isCompleted` INTEGER NOT NULL DEFAULT 0,
    `score` INTEGER NOT NULL DEFAULT 0,
    `syncStatus` TEXT NOT NULL DEFAULT "SYNCED" -- "PENDING" | "SYNCED"
);
```
