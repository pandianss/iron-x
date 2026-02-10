-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "current_discipline_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_members" (
    "team_member_id" TEXT NOT NULL PRIMARY KEY,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("team_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "goal_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "actions" (
    "action_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "goal_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency_rule" TEXT NOT NULL,
    "window_start_time" DATETIME NOT NULL,
    "window_duration_minutes" INTEGER NOT NULL,
    "is_strict" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "actions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals" ("goal_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "implementation_intentions" (
    "intention_id" TEXT NOT NULL PRIMARY KEY,
    "action_id" TEXT,
    "trigger_condition" TEXT NOT NULL,
    "response_action" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "implementation_intentions_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions" ("action_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "action_instances" (
    "instance_id" TEXT NOT NULL PRIMARY KEY,
    "action_id" TEXT,
    "user_id" TEXT,
    "scheduled_date" DATETIME NOT NULL,
    "scheduled_start_time" DATETIME NOT NULL,
    "scheduled_end_time" DATETIME NOT NULL,
    "executed_at" DATETIME,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "action_instances_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions" ("action_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "action_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prompts" (
    "prompt_id" TEXT NOT NULL PRIMARY KEY,
    "instance_id" TEXT,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" DATETIME,
    "type" TEXT,
    CONSTRAINT "prompts_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "action_instances" ("instance_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discipline_scores" (
    "score_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "date" DATETIME NOT NULL,
    "score" INTEGER NOT NULL,
    "execution_rate" DECIMAL,
    "on_time_rate" DECIMAL,
    "calculated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discipline_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "habit_states" (
    "habit_id" TEXT NOT NULL PRIMARY KEY,
    "action_id" TEXT,
    "current_streak" INTEGER DEFAULT 0,
    "habit_strength_score" INTEGER DEFAULT 0,
    "last_executed_at" DATETIME,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "habit_states_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions" ("action_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_scores_user_id_date_key" ON "discipline_scores"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_states_action_id_key" ON "habit_states"("action_id");
