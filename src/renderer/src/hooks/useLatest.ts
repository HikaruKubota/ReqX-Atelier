import { useRef } from 'react';

/**
 * Returns a mutable ref object that always contains the latest value provided.
 *
 * Useful for accessing the most recent value inside callbacks or effects without triggering re-renders.
 *
 * @param value - The value to store in the ref
 * @returns A ref object whose `.current` property is always updated to the latest value
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
