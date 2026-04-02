import {
  boolean,
  date,
  decimal,
  json,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const categoryEnum = pgEnum('category', ['academic', 'vital', 'personal', 'escape']);
export const streakStatusEnum = pgEnum('streak_status', ['active', 'completed', 'failed']);
export const failureModeEnum = pgEnum('failure_mode', ['reset', 'stall']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const scheduleActivities = pgTable('schedule_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  daysOfWeek: json('days_of_week').$type<number[]>().notNull(),
  time: varchar('time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  category: categoryEnum('category').notNull(),
  activity: varchar('activity', { length: 200 }).notNull(),
  sortOrder: smallint('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const scheduleActivityLogs = pgTable(
  'schedule_activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    activityId: uuid('activity_id')
      .references(() => scheduleActivities.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    date: date('date').notNull(),
    done: boolean('done').default(false).notNull(),
    doneAt: timestamp('done_at', { withTimezone: true }),
  },
  (table) => [unique('schedule_activity_log_unq').on(table.activityId, table.date)],
);

export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  failureMode: failureModeEnum('failure_mode').default('stall').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .references(() => habits.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: date('start_date').notNull(),
  currentDay: smallint('current_day').default(1).notNull(),
  completedDays: smallint('completed_days').default(0).notNull(),
  failedDays: smallint('failed_days').default(0).notNull(),
  status: streakStatusEnum('status').default('active').notNull(),
  failureMode: failureModeEnum('failure_mode').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dailyCompliance = pgTable(
  'daily_compliance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    streakId: uuid('streak_id')
      .references(() => streaks.id, { onDelete: 'cascade' })
      .notNull(),
    habitId: uuid('habit_id')
      .references(() => habits.id, { onDelete: 'cascade' })
      .notNull(),
    date: date('date').notNull(),
    totalTasks: smallint('total_tasks').notNull(),
    completedTasks: smallint('completed_tasks').notNull(),
    compliancePct: decimal('compliance_pct', { precision: 5, scale: 2 }).notNull(),
    passed: boolean('passed').notNull(),
    finalized: boolean('finalized').default(false).notNull(),
  },
  (table) => [unique('daily_compliance_streak_date_unq').on(table.streakId, table.date)],
);
