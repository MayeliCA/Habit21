# 🚀 Habit21: Time Management & Habit Formation System

**Habit21** is a high-performance web application designed for habit formation using the **Time Blocking** method. The system automates Monday-to-Friday routines while allowing total flexibility on weekends, aiming for habit consolidation in 21-day cycles.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite) + TypeScript.
- **Backend:** Node.js + Express + TypeScript.
- **Database:** PostgreSQL (Relational).
- **UI/UX:** - **Tailwind CSS:** Atomic and responsive styling.
  - **Shadcn/ui:** Interface components (Calendars, Checkboxes).
  - **Lucide React:** Minimalist iconography.

---

## 📋 MVP Features (Phase 1)

### A. Intelligent Schedule Generator
* **Weekly Scheme:** Mirror interface to define fixed activities (Mon-Fri).
* **Flexibility:** Independent editor for Saturday and Sunday exceptions.
* **Categorization:** Visual color-coding by activity type (Sleep, Work, Rest, Exercise).

### B. Tracking System (Daily Checklist)
* **Compliance Mode:** Dynamic task list generated based on the current time block.
* **Real-time Tracking:** Immediate validation of task completion.

### C. Gamification: The 21-Day Streak
* **Visual Counter:** "Day X of 21" progress widget.
* **Streak Logic:** - Counter advances if daily compliance is **> 80%**.
    - If the threshold isn't met, the streak resets or stalls (configurable).

### D. Productivity Dashboard
* **Time Analysis:** Hour distribution charts by category.
* **Plan vs. Actual Report:** Detailed comparison of execution vs. planning.

---

## 🤖 AI Roles (Reference: AGENTS.md)
This project is developed under the supervision of three specialized agents:
1. **Fullstack Architect:** Structure and API design.
2. **UI/UX Specialist:** Interface and Shadcn components.
3. **Logic Engineer:** Gamification algorithms and streak logic.

---
**Note:** All source code and technical documentation are in **English**, while the final user interface is localized in **Spanish**.
