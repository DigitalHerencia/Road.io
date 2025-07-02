CREATE TYPE "training_status" AS ENUM ('ASSIGNED','COMPLETED');

CREATE TABLE "training_programs" (
    "id" serial PRIMARY KEY NOT NULL,
    "org_id" integer NOT NULL REFERENCES "organizations"("id"),
    "title" varchar(100) NOT NULL,
    "description" text,
    "start_date" timestamp,
    "end_date" timestamp,
    "created_by_id" integer REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "driver_trainings" (
    "id" serial PRIMARY KEY NOT NULL,
    "org_id" integer NOT NULL REFERENCES "organizations"("id"),
    "driver_id" integer NOT NULL REFERENCES "drivers"("id"),
    "program_id" integer NOT NULL REFERENCES "training_programs"("id"),
    "status" training_status DEFAULT 'ASSIGNED' NOT NULL,
    "scheduled_at" timestamp,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "driver_benefits" (
    "id" serial PRIMARY KEY NOT NULL,
    "org_id" integer NOT NULL REFERENCES "organizations"("id"),
    "driver_id" integer NOT NULL REFERENCES "drivers"("id"),
    "type" varchar(50) NOT NULL,
    "amount" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "pay_statements" (
    "id" serial PRIMARY KEY NOT NULL,
    "org_id" integer NOT NULL REFERENCES "organizations"("id"),
    "driver_id" integer NOT NULL REFERENCES "drivers"("id"),
    "period_start" timestamp NOT NULL,
    "period_end" timestamp NOT NULL,
    "miles" integer NOT NULL,
    "rate_per_mile" integer NOT NULL,
    "per_diem" integer DEFAULT 0 NOT NULL,
    "benefits_deduction" integer DEFAULT 0 NOT NULL,
    "gross_pay" integer NOT NULL,
    "net_pay" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
