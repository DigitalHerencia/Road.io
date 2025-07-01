CREATE TYPE "public"."vehicle_status" AS ENUM('ACTIVE', 'MAINTENANCE', 'RETIRED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('TRACTOR', 'TRAILER', 'VAN', 'CAR', 'OTHER');--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "type" "vehicle_type";--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "insurance_provider" varchar(100);--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "insurance_policy_number" varchar(100);--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "owner_info" varchar(255);--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "status" "vehicle_status" DEFAULT 'ACTIVE' NOT NULL;
