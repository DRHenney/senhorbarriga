-- Adicionar tabela de operações ativas
CREATE TABLE IF NOT EXISTS "active_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"pair" text NOT NULL,
	"capital" decimal(18,2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"range_min" decimal(18,8),
	"range_max" decimal(18,8),
	"num_grids" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Adicionar foreign key para users
ALTER TABLE "active_operations" ADD CONSTRAINT "active_operations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE NO ACTION;
