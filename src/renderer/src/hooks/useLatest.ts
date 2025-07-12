import { useRef } from 'react';

/**
 * Custom hook that keeps a ref with the latest value.
 * This eliminates the need for useEffect to sync refs with state values.
 *
 * @param value The value to keep in the ref
 * @returns A ref object that always contains the latest value
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
