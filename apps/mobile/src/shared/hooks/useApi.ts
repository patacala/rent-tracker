import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<TArgs, TData> extends UseApiState<TData> {
  execute: (args: TArgs) => Promise<TData | null>;
  reset: () => void;
}

export function useApi<TArgs, TData>(
  apiFn: (args: TArgs) => Promise<{ data: TData; success: boolean }>,
): UseApiReturn<TArgs, TData> {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (args: TArgs): Promise<TData | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiFn(args);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [apiFn],
  );

  const reset = useCallback((): void => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
