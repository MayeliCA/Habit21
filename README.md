# Habit21: Time Management & Habit Formation System

**Habit21** is a web application designed for **students** to build habits using the **Time Blocking** method. Each day has its own independent schedule, and habit streaks work separately from schedule compliance — helping students consolidate habits in **21-day cycles** regardless of their variable routines.

---

## Tech Stack

- **Frontend:** React (Vite) + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Relational)
- **ORM:** Drizzle ORM
- **UI/UX:** Tailwind CSS + Shadcn/ui + Lucide React

---

## Activity Categories

All scheduled activities fall into one of four axes:

| Category | Label (Spanish) | Description |
|----------|----------------|-------------|
| `academic` | Eje Academico (Inversion) | Study, classes, homework |
| `vital` | Eje Vital (Mantenimiento) | Sleep, meals, exercise, hygiene |
| `personal` | Eje Personal (Recuperacion) | Rest, hobbies, social time |
| `escape` | Eje de Fuga (Distraccion) | Social media, entertainment, unproductive time |

---

## MVP Features (Phase 1)

### A. Schedule Generator
- **Per-day scheduling:** Each day of the week has its own independent set of activities (ideal for students with variable timetables).
- **Visual categorization:** Color-coded by activity axis (Academic, Vital, Personal, Escape).
- **Max 18 activities per day.**

### B. Daily Checklist
- **Dynamic task list:** Generated based on the current day's scheduled activities.
- **Real-time tracking:** Mark activities as done with immediate visual feedback.
- **Compliance bar:** Shows daily completion percentage.

### C. 21-Day Streaks (Habits)
- **Independent from schedule:** Streaks are separate from the daily checklist. You create a habit and mark it as done each day.
- **Simple logic:** Mark "done" → day advances. Forget to mark → streak resets automatically at midnight.
- **Multiple active streaks:** You can have several habits with active streaks simultaneously.
- **Visual progress:** "Day X of 21" progress bar with history of completed days.
- **Completion:** Reach day 22 → streak completed.

### D. Productivity Dashboard
- **Time analysis:** Hour distribution charts by category (daily, weekly, monthly).
- **Plan vs. Actual:** Detailed comparison of execution vs. planning.
- **Success metrics:** Global compliance rate, 7-day trend, monthly progress.

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET/POST | `/api/habits` | List / Create habits |
| PATCH/DELETE | `/api/habits/:id` | Update / Deactivate habit |
| GET/POST | `/api/schedule` | List / Create schedule activities |
| PATCH/DELETE | `/api/schedule/:id` | Update / Delete activity |
| GET | `/api/schedule/today` | Today's compliance status |
| GET | `/api/tasks` | Daily task list |
| PATCH | `/api/tasks/:id/toggle` | Toggle task done |
| GET | `/api/streaks` | List all streaks with previews |
| GET | `/api/streaks/:id` | Streak detail with log history |
| POST | `/api/streaks/habit/:habitId/start` | Start a new streak |
| POST | `/api/streaks/:id/log` | Mark today as done for a streak |
| GET | `/api/analytics` | Dashboard analytics |

---

## Project Structure

```
habit21/
├── client/          # React frontend (@habit21/client)
│   └── src/
│       ├── components/   # UI components (dashboard, schedule, streaks, layout)
│       ├── hooks/        # Custom hooks (useAuth, useStreak)
│       ├── i18n/         # Spanish translations
│       ├── lib/          # Utilities (API client)
│       └── pages/        # Page components (Dashboard, Schedule, Checklist, Habits, Login, Register)
├── server/          # Express backend (@habit21/server)
│   └── src/
│       ├── config/       # Environment config (Zod-validated)
│       ├── db/           # Drizzle schema + connection
│       ├── middleware/    # Auth + error handling
│       ├── modules/      # Business logic (auth, habits, schedule, tasks, streaks, analytics)
│       ├── routes/       # API route mounting
│       └── utils/        # Server utilities
├── shared/          # Shared TypeScript types (@habit21/shared)
│   └── src/types/        # Interfaces and type definitions
└── docker-compose.yml    # PostgreSQL database
```

---

## Getting Started

```bash
# Start the database
docker compose up -d

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start dev server (both client + server)
npm run dev
```

---

## AI Roles (Reference: AGENTS.md)

This project is developed under the supervision of three specialized agents:
1. **Fullstack Architect:** Monorepo structure, API design, and database schema.
2. **UI/UX Specialist:** Dashboard, Schedule Generator, and Shadcn/ui components.
3. **Business Logic Engineer:** 21-day streak algorithm and compliance validation.

---

**Note:** All source code and technical documentation are in **English**, while the user-facing interface is localized in **Spanish**.
