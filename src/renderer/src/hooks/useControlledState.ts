import { useState, useCallback } from 'react';

/**
 * Hook that manages state that can be both controlled and uncontrolled
 * Similar to how native form inputs work
 */
export function useControlledState<T>(
  value?: T,
  defaultValue?: T,
  onChange?: (value: T) => void
): [T | undefined, (value: T) => void] {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const finalValue = isControlled ? value : internalValue;
  
  const setValue = useCallback((newValue: T) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  }, [isControlled, onChange]);
  
  return [finalValue, setValue];
}