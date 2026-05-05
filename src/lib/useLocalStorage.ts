import { useState, useEffect } from 'react';

// Persists state in localStorage so it survives page refreshes.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore write errors (e.g. private browsing quota limits)
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
