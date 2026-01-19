CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"igdb_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"cover_url" varchar(500),
	"last_played_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
