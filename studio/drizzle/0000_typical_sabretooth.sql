CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"prompt" text NOT NULL,
	"metadata" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"group_id" text DEFAULT 'legacy_migration' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "group_id_idx" ON "assets" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "assets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "group_id_created_at_idx" ON "assets" USING btree ("group_id","created_at");--> statement-breakpoint
CREATE INDEX "type_idx" ON "assets" USING btree ("type");