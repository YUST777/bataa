# Bataa

**Learn web development by doing.** Bataa is a friendly learning app for building real web-development skills through short daily tasks.

🌐 Live: [bataa.app](https://bataa.app)

## Folders

- `web/`: the website (React + TypeScript + Vite, API routes in `web/api`). Deployed to Cloudflare Pages (project `bataa`) by direct upload: `cd web && npm run deploy`.
- `mobile/`: the learning app (React + Vite), its Android wrapper in `mobile/android`, Supabase migrations in `mobile/supabase`, design files and references in `mobile/design`.
- `assignments/`: course work (market research, task 1, pitch deck, BMC, video).

## Run locally

```bash
cd web && npm install && npm run dev        # website on :5173
cd mobile && bun install && npm run dev     # app on :5174
cd mobile && npm run android:apk            # builds mobile/BataaMobile.apk
```
