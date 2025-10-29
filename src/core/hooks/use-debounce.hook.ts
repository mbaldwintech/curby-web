import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value`.
 *
 * @param value     The incoming value that may change often.
 * @param delayMs   How long to wait (in ms) after the last change before updating.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Set up a timer that updates the state after `delayMs`
    const timer = setTimeout(() => setDebounced(value), delayMs);

    // When `value` or `delayMs` changes, clear the previous timer
    // so only the most recent change is honoured.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
