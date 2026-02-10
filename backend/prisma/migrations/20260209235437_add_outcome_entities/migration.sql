-- CreateTable
CREATE TABLE "outcomes" (
    "outcome_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "team_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence_score" REAL DEFAULT 0.0,
    "calculated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_from" DATETIME NOT NULL,
    "valid_until" DATETIME,
    CONSTRAINT "outcomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "outcomes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("team_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "outcome_action_links" (
    "link_id" TEXT NOT NULL PRIMARY KEY,
    "outcome_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    CONSTRAINT "outcome_action_links_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "outcomes" ("outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "outcome_action_links_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "action_instances" ("instance_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "outcome_rules" (
    "rule_id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "condition_json" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_val_tpl" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "outcome_action_links_outcome_id_instance_id_key" ON "outcome_action_links"("outcome_id", "instance_id");
