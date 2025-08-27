# 🕐 Worker Time Management App

Track project hours, automatically calculate daily and monthly overtime, and give managers a clear view of team workloads.
Built as an MVP with TypeScript, React, Express, Prisma, and PostgreSQL.

**TL;DR**: Track hours, auto-calc daily/monthly overtime & pay, per-team summary for manager.

## 🔧 Tech Stack

- Trontend: React + Tailwind + TypeScript
- Backend: Express + Typescript
- DB: Prisma + PostgreSQL + Docker

## ✨ Highlights

- **Core features**
  - Real-time overtime & pay calculation (based on Taiwan Labour Standards Act) on create/update/delete (db single-transaction sync).
  - Session-based auth + CSRF protection (csrf-sync)
  - Role-based authorization for routes
  - Mail service ready for production to notify password reset
- **Dashboard**
  - **Employee**: view today and current month overtime hours and pay.
  - **Manager**: per-team summaries and visual chart.
  - **Administrator**: register new users and update user info (role, team, salary, etc.).
- Strict TypeScript, Zod validation, clean service/route split.

## 🎥 Demo Video

- **Video**: [(https://github.com/user-attachments/assets/b9909a87-a902-44a7-ab4f-765216abef8c)]

## 🚀 Quickstart(Local)

1. **Database**

   `docker compose up`

2. **Backend**

   ```bash
   cd apps/backend
   cp .env.example .env  # create if missing; see example below
   pnpm install
   pnpm prisma migrate dev
   pnpm prisma db seed   # optional, skip if you want an empty db
   pnpm run dev              # runs the API server
   ```

   Backend .env example

   ```bash
   # Required
   BACKEND_PORT=3001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dev"
   CORS_ORIGIN=http://localhost:5173
   ENV=dev
   SESSION_SECRET="replace-with-a-strong-secret"

   # Optional (mail, etc.) if used
   SMTP_HOST=
   SMTP_PORT=
   SMTP_USER=
   SMTP_PASS=
   ```

3. **Frontend (start a new terminal)**

   ```bash
   cd apps/frontend
   cp .env.example .env # VITE_API_URL=http://localhost:3001
   pnpm install
   pnpm run dev
   ```

   Frontend .env example

   ```bash
   VITE_API_URL="http://localhost:3001"  # or your backend origin
   ```
