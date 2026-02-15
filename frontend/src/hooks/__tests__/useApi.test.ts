import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useApi } from '../useApi';

describe('useApi', () => {
    it('should start with initial state', () => {
        const mockApi = vi.fn();
        const { result } = renderHook(() => useApi(mockApi));

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle successful execution', async () => {
        const mockData = { foo: 'bar' };
        const mockApi = vi.fn().mockResolvedValue(mockData);
        const { result } = renderHook(() => useApi(mockApi));

        await act(async () => {
            await result.current.execute();
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle errors', async () => {
        const errorMessage = 'API Error';
        const mockApi = vi.fn().mockRejectedValue({ message: errorMessage });
        const { result } = renderHook(() => useApi(mockApi));

        try {
            await act(async () => {
                await result.current.execute();
            });
        } catch (e) {
            // Error is expected
        }

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
    });
});
