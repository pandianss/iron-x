import { createContext } from 'react';
import { type DisciplineState } from '../domain/discipline';
import { type TrajectoryIdentity } from '../domain/trajectory';

export interface DisciplineContextType {
    state: DisciplineState | null;
    identity: TrajectoryIdentity | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    refreshTrigger: number;
}

export const DisciplineContext = createContext<DisciplineContextType | undefined>(undefined);
