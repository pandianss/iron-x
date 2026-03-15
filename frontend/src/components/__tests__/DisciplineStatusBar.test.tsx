import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisciplineStatusBar } from '../cockpit/DisciplineStatusBar';
// Mock AuthClient
vi.mock('../../domain/auth', () => ({
  AuthClient: {
    getProfile: vi.fn().mockResolvedValue({
      user_id: 'user-1',
      team_memberships: [],
      teams_owned: []
    })
  }
}));

import { DisciplineContext } from '../../context/DisciplineContextInstance';

const mockState = {
  score: 85,
  classification: 'STABLE',
  compositePressure: 12,
  driftVectors: [],
  violationHorizon: { daysUntilBreach: null, criticalActions: [] },
  activeConstraints: { policiesActive: 0, lockedUntil: null, reducedPrivileges: [], frozenActions: [] },
  performanceMetrics: { weeklyCompletionRate: 90, averageLatency: 5, habitStrength: {} }
};

describe('DisciplineStatusBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (classification: string) => {
    return render(
      <DisciplineContext.Provider value={{ 
        state: { ...mockState, classification } as any,
        identity: null,
        loading: false,
        error: null,
        refresh: vi.fn(),
        refreshTrigger: 0
      }}>
        <DisciplineStatusBar />
      </DisciplineContext.Provider>
    );
  };

  it('renders "STABLE" label correctly', () => {
    renderWithContext('STABLE');
    expect(screen.getAllByText(/STABLE/i).length).toBeGreaterThan(0);
  });

  it('translates "ONBOARDING" to "Building track record"', () => {
    renderWithContext('ONBOARDING');
    expect(screen.getByText(/Building track record/i)).toBeDefined();
  });

  it('renders "RECOVERING" label correctly', () => {
    renderWithContext('RECOVERING');
    expect(screen.getByText(/RECOVERING/i)).toBeDefined();
  });

  it('renders "HIGH_RELIABILITY" label correctly', () => {
    renderWithContext('HIGH_RELIABILITY');
    expect(screen.getByText(/HIGH RELIABILITY/i)).toBeDefined();
  });
});
