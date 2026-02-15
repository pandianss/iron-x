import { useEffect } from 'react';
import { useApi } from './useApi';
import {
    getTrajectoryHistory,
    getProjectedScore,
    getTrajectoryIdentity,
} from '../api/trajectory';

export const useTrajectoryHistory = (days: number = 30) => {
    const { data, loading, error, execute } = useApi(getTrajectoryHistory);

    useEffect(() => {
        execute(days);
    }, [days, execute]);

    return { data, loading, error, refresh: () => execute(days) };
};

export const useTrajectoryProjection = () => {
    const { data, loading, error, execute } = useApi(getProjectedScore);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refresh: execute };
};

export const useTrajectoryIdentity = () => {
    const { data, loading, error, execute } = useApi(getTrajectoryIdentity);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refresh: execute };
};
