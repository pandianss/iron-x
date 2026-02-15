import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export const useApi = <T, Args extends unknown[]>(
    apiFunc: (...args: Args) => Promise<T>
) => {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: Args) => {
            setState({ data: null, loading: true, error: null });
            try {
                const data = await apiFunc(...args);
                setState({ data, loading: false, error: null });
                return data;
            } catch (err) {
                const axiosError = err as AxiosError<{ error: string }>;
                const errorMessage = axiosError.response?.data?.error || axiosError.message || 'An unexpected error occurred';
                setState({ data: null, loading: false, error: errorMessage });
                throw err;
            }
        },
        [apiFunc]
    );

    return { ...state, execute };
};
