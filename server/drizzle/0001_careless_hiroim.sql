ALTER TABLE "habits" ADD COLUMN "category" "category" DEFAULT 'vital' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar(50) DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone_changed_at" timestamp with time zone;