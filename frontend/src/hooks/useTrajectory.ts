import { useEffect } from 'react';
import { useApi } from './useApi';
import { TrajectoryClient } from '../domain/trajectory';

export const useTrajectoryHistory = (days: number = 30) => {
    const { data, loading, error, execute } = useApi(TrajectoryClient.getHistory);

    useEffect(() => {
        execute(days);
    }, [days, execute]);

    return { data, loading, error, refresh: () => execute(days) };
};

export const useTrajectoryProjection = () => {
    const { data, loading, error, execute } = useApi(TrajectoryClient.getProjectedScore);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refresh: execute };
};

export const useTrajectoryIdentity = () => {
    const { data, loading, error, execute } = useApi(TrajectoryClient.getIdentity);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refresh: execute };
};
