import { useCallback, useEffect, useState } from 'react';

export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    run().then(
      (data) => setState({ loading: false, data, error: null }),
      (error) => setState({ loading: false, data: null, error })
    );
  }, [run]);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
