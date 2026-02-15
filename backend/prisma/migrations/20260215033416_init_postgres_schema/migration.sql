-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'INDIVIDUAL_PRO', 'TEAM_ENTERPRISE');

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "current_discipline_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enforcement_mode" TEXT NOT NULL DEFAULT 'NONE',
    "locked_until" TIMESTAMP(3),
    "acknowledgment_required" BOOLEAN NOT NULL DEFAULT false,
    "discipline_classification" TEXT NOT NULL DEFAULT 'UNRELIABLE',
    "classification_last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "max_seats" INTEGER NOT NULL DEFAULT 5,
    "enforcement_policy" TEXT,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "team_member_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_member_id")
);

-- CreateTable
CREATE TABLE "goals" (
    "goal_id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "actions" (
    "action_id" TEXT NOT NULL,
    "user_id" TEXT,
    "goal_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency_rule" TEXT NOT NULL,
    "window_start_time" TIMESTAMP(3) NOT NULL,
    "window_duration_minutes" INTEGER NOT NULL,
    "is_strict" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "implementation_intentions" (
    "intention_id" TEXT NOT NULL,
    "action_id" TEXT,
    "trigger_condition" TEXT NOT NULL,
    "response_action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "implementation_intentions_pkey" PRIMARY KEY ("intention_id")
);

-- CreateTable
CREATE TABLE "action_instances" (
    "instance_id" TEXT NOT NULL,
    "action_id" TEXT,
    "user_id" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "executed_at" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_instances_pkey" PRIMARY KEY ("instance_id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "prompt_id" TEXT NOT NULL,
    "instance_id" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "type" TEXT,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("prompt_id")
);

-- CreateTable
CREATE TABLE "discipline_scores" (
    "score_id" TEXT NOT NULL,
    "user_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "execution_rate" DECIMAL(65,30),
    "on_time_rate" DECIMAL(65,30),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discipline_scores_pkey" PRIMARY KEY ("score_id")
);

-- CreateTable
CREATE TABLE "habit_states" (
    "habit_id" TEXT NOT NULL,
    "action_id" TEXT,
    "current_streak" INTEGER DEFAULT 0,
    "habit_strength_score" INTEGER DEFAULT 0,
    "last_executed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_states_pkey" PRIMARY KEY ("habit_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "target_user_id" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "config_key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("config_key")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "subscription_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "outcomes" (
    "outcome_id" TEXT NOT NULL,
    "user_id" TEXT,
    "team_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION DEFAULT 0.0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),

    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("outcome_id")
);

-- CreateTable
CREATE TABLE "outcome_action_links" (
    "link_id" TEXT NOT NULL,
    "outcome_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,

    CONSTRAINT "outcome_action_links_pkey" PRIMARY KEY ("link_id")
);

-- CreateTable
CREATE TABLE "outcome_rules" (
    "rule_id" TEXT NOT NULL,
    "owner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "condition_json" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_val_tpl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outcome_rules_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "policies" (
    "policy_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "enforcement_mode" TEXT NOT NULL DEFAULT 'SOFT',
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("policy_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "policy_id" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "discipline_exceptions" (
    "exception_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "policy_id" TEXT,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),

    CONSTRAINT "discipline_exceptions_pkey" PRIMARY KEY ("exception_id")
);

-- CreateTable
CREATE TABLE "controls" (
    "control_id" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "control_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("control_id")
);

-- CreateTable
CREATE TABLE "control_mappings" (
    "mapping_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "policy_id" TEXT,
    "system_config_key" TEXT,
    "enforcement_mechanism" TEXT NOT NULL,
    "evidence_source" TEXT NOT NULL,

    CONSTRAINT "control_mappings_pkey" PRIMARY KEY ("mapping_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_scores_user_id_date_key" ON "discipline_scores"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_states_action_id_key" ON "habit_states"("action_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "outcome_action_links_outcome_id_instance_id_key" ON "outcome_action_links"("outcome_id", "instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "controls_framework_control_code_key" ON "controls"("framework", "control_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("goal_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "implementation_intentions" ADD CONSTRAINT "implementation_intentions_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("action_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_instances" ADD CONSTRAINT "action_instances_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("action_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_instances" ADD CONSTRAINT "action_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "action_instances"("instance_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_scores" ADD CONSTRAINT "discipline_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_states" ADD CONSTRAINT "habit_states_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("action_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_action_links" ADD CONSTRAINT "outcome_action_links_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_action_links" ADD CONSTRAINT "outcome_action_links_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "action_instances"("instance_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("policy_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_exceptions" ADD CONSTRAINT "discipline_exceptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_exceptions" ADD CONSTRAINT "discipline_exceptions_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("policy_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_mappings" ADD CONSTRAINT "control_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("control_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_mappings" ADD CONSTRAINT "control_mappings_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("policy_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_mappings" ADD CONSTRAINT "control_mappings_system_config_key_fkey" FOREIGN KEY ("system_config_key") REFERENCES "system_configs"("config_key") ON DELETE SET NULL ON UPDATE CASCADE;
