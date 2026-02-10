-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "actor_id" TEXT,
    "target_user_id" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_configs" (
    "config_key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_teams" (
    "team_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "max_seats" INTEGER NOT NULL DEFAULT 5,
    "enforcement_policy" TEXT,
    CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_teams" ("created_at", "name", "owner_id", "team_id") SELECT "created_at", "name", "owner_id", "team_id" FROM "teams";
DROP TABLE "teams";
ALTER TABLE "new_teams" RENAME TO "teams";
CREATE TABLE "new_users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "current_discipline_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enforcement_mode" TEXT NOT NULL DEFAULT 'NONE',
    "locked_until" DATETIME,
    "acknowledgment_required" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("created_at", "current_discipline_score", "email", "password_hash", "timezone", "user_id") SELECT "created_at", "current_discipline_score", "email", "password_hash", "timezone", "user_id" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
