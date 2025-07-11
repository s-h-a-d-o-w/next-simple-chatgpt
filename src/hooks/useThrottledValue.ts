import { throttle } from "lodash";
import { useEffect, useRef, useState } from "react";

export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttled, setThrottled] = useState(value);
  const throttledSetState = useRef(
    throttle((nextValue: T) => setThrottled(nextValue), delay),
  ).current;

  useEffect(() => {
    throttledSetState(value);
  }, [value, throttledSetState]);

  useEffect(() => {
    return () => throttledSetState.cancel();
  }, [throttledSetState]);

  return throttled;
}
