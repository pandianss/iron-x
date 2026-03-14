import { api } from './api';

export const WitnessClient = {
  assignWitness: (actionId: string, witnessUserId: string) =>
    api.post(`/witness/actions/${actionId}/witness`, { witnessUserId }).then(r => r.data),

  removeWitness: (actionId: string) =>
    api.delete(`/witness/actions/${actionId}/witness`).then(r => r.data),

  getWatchedActions: () =>
    api.get('/witness/watching').then(r => r.data),

  getNotifications: () =>
    api.get('/witness/notifications').then(r => r.data),

  getEligibleWitnesses: () =>
    api.get('/witness/eligible').then(r => r.data),
};
