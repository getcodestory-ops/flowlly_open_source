import { useCallback, useRef, useEffect } from "react";

function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        func(...args);
        lastRan.current = Date.now();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          func(...args);
          lastRan.current = Date.now();
        }, delay);
      }
    },
    [func, delay]
  ) as T;
}

export default useThrottle;
