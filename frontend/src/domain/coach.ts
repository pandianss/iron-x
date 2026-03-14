import { api } from './api';

export const CoachClient = {
  initialize: (coachName: string) =>
    api.post('/coach/initialize', { coachName }).then(r => r.data),

  getDashboard: (): Promise<CoachDashboardData> =>
    api.get('/coach/dashboard').then(r => r.data),
};

export interface ClientProfile {
  user_id: string;
  email: string;
  current_discipline_score: number;
  discipline_classification: string;
  trust_tier: string;
  enforcement_mode: string;
  locked_until: string | null;
  discipline_scores: Array<{ score: number; date: string }>;
  actions: Array<{ action_id: string; title: string; is_active: boolean }>;
}

export interface CoachDashboardData {
  total_clients: number;
  clients: ClientProfile[];
  summary: {
    avg_score: number;
    locked_count: number;
    unreliable_count: number;
    stable_count: number;
  };
}
