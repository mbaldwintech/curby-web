import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseDataQueryResult<T> {
  data: T | null;
  loading: boolean;
  refresh: () => void;
  refreshing: boolean;
  error: string | null;
}

type CustomDependencyList = ReadonlyArray<unknown>;

export const useDataQuery = <T extends CustomDependencyList, D>(
  factory: () => Promise<D>,
  deps: T
): UseDataQueryResult<D> => {
  const hasLoaded = useRef(false);
  const [data, setData] = useState<D | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!hasLoaded.current) {
      setLoading(true);
      hasLoaded.current = true;
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      const result = await factory();
      setData(result);
    } catch (err) {
      setError((err as Error).message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, factory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, refresh: loadData, refreshing, error };
};
