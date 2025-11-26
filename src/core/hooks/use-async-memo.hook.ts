import React from 'react';

export const useAsyncMemo = <T>(factory: () => Promise<T>, deps: React.DependencyList = []): T | null => {
  const [value, setValue] = React.useState<T | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    factory().then((result) => {
      if (isMounted) {
        setValue(result);
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};
