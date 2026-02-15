
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DisciplineClient, type DisciplineState } from '../domain/discipline';
import { TrajectoryClient, type TrajectoryIdentity } from '../domain/trajectory';
import { SocketClient } from '../domain/socket';
import { useAuth } from './AuthContext';

interface DisciplineContextType {
    state: DisciplineState | null;
    identity: TrajectoryIdentity | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    refreshTrigger: number;
}

const DisciplineContext = createContext<DisciplineContextType | undefined>(undefined);

export const useDiscipline = () => {
    const context = useContext(DisciplineContext);
    if (!context) {
        throw new Error('useDiscipline must be used within a DisciplineProvider');
    }
    return context;
};

export const DisciplineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [state, setState] = useState<DisciplineState | null>(null);
    const [identity, setIdentity] = useState<TrajectoryIdentity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(async () => {
        // Increment trigger to notify other listeners
        setRefreshTrigger(prev => prev + 1);
        try {
            const [stateData, identityData] = await Promise.all([
                DisciplineClient.getState(),
                TrajectoryClient.getIdentity()
            ]);
            setState(stateData);
            setIdentity(identityData);
            setError(null);
        } catch (err: any) {
            console.error('Failed to refresh discipline data', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        if (token) {
            refresh();
        }
    }, [token, refresh]);

    // WebSocket Connection
    useEffect(() => {
        if (!token) return;

        const socket = SocketClient.getInstance();
        socket.connect(token);

        const unsubscribe = socket.subscribe('SCORE_UPDATED', () => {
            console.log('[DisciplineContext] Received SCORE_UPDATED event');
            refresh();
        });

        return () => {
            unsubscribe();
            socket.disconnect();
        };
    }, [token, refresh]);

    return (
        <DisciplineContext.Provider value={{ state, identity, loading, error, refresh, refreshTrigger }}>
            {children}
        </DisciplineContext.Provider>
    );
};
