CREATE TABLE "active_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"pair" text NOT NULL,
	"capital" numeric(18, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"range_min" numeric(18, 8),
	"range_max" numeric(18, 8),
	"num_grids" integer,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "active_operations" ADD CONSTRAINT "active_operations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;