import { useCallback, useRef, useEffect } from "react";

function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  //   useEffect(() => {
  //     return () => {
  //       if (timeoutRef.current) {
  //         clearTimeout(timeoutRef.current);
  //       }
  //     };
  //   }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  ) as T;
}

export default useDebounce;
