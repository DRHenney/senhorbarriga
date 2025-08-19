CREATE TABLE "weekly_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pool_liquidity" numeric(18, 2) NOT NULL,
	"grid_bot" numeric(18, 2) NOT NULL,
	"total" numeric(18, 2) NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"record_date" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "weekly_records" ADD CONSTRAINT "weekly_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;