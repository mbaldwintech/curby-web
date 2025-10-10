type DebounceOptions = {
  leading?: boolean;
  trailing?: boolean;
};

export function debounce<Args extends unknown[], TResult>(
  func: (...args: Args) => TResult | Promise<TResult>,
  wait: number,
  options: DebounceOptions = {}
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;
  let pendingResolve: ((value: TResult) => void) | null = null;
  let pendingReject: ((reason?: unknown) => void) | null = null;

  const invoke = () => {
    if (!lastArgs) return;

    try {
      const result = func(...lastArgs);

      if (result instanceof Promise) {
        result.then(pendingResolve!).catch(pendingReject!);
      } else {
        pendingResolve?.(result);
      }
    } catch (err) {
      pendingReject?.(err);
    } finally {
      timeout = null;
      pendingResolve = null;
      pendingReject = null;
      lastArgs = null;
    }
  };

  const debounced = (...args: Args): Promise<TResult> => {
    return new Promise((resolve, reject) => {
      const shouldCallNow = options.leading && !timeout;

      lastArgs = args;
      pendingResolve = resolve;
      pendingReject = reject;

      if (timeout) clearTimeout(timeout);

      if (shouldCallNow) {
        try {
          const result = func(...args);
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      }

      if (options.trailing !== false) {
        timeout = setTimeout(invoke, wait);
      }
    });
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    lastArgs = null;
    pendingResolve = null;
    pendingReject = null;
  };

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      invoke();
    }
  };

  return debounced;
}
