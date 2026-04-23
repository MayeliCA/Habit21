import {
  boolean,
  date,
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

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  timezoneChangedAt: timestamp('timezone_changed_at', { withTimezone: true }),
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
  category: categoryEnum('category').default('vital').notNull(),
  description: text('description'),
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
  status: streakStatusEnum('status').default('active').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const habitLogs = pgTable(
  'habit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    streakId: uuid('streak_id')
      .references(() => streaks.id, { onDelete: 'cascade' })
      .notNull(),
    habitId: uuid('habit_id')
      .references(() => habits.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    date: date('date').notNull(),
    done: boolean('done').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('habit_log_streak_date_unq').on(table.streakId, table.date)],
);
