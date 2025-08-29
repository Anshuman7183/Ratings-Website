import { useState, useEffect } from "react";

/**
 * Custom React hook to persist state in localStorage
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial state value if none is stored
 * @returns {[any, Function]} - [value, setValue] same as useState
 */
export function useLocalStorage(key, initialValue) {
  // initialize from localStorage (if present), otherwise fallback
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error("useLocalStorage init error", error);
      return initialValue;
    }
  });

  // whenever value changes, persist it
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("useLocalStorage set error", error);
    }
  }, [key, value]);

  return [value, setValue];
}
