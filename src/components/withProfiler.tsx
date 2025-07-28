import { isDev } from "@/utils/consts";
import { Profiler } from "react";

export function withProfiler<T>(
  Component: React.ComponentType<T>,
  passThrough = false,
): React.FC<T> {
  if (!isDev || passThrough) {
    return Component as React.FC<T>;
  }

  return function WithProfiler(props: T) {
    return (
      <Profiler
        id={Component.name}
        onRender={(id, phase, actualDuration, _, startTime) => {
          console.log(
            id,
            phase,
            actualDuration,
            startTime / 1000, // convert to seconds
          );
        }}
      >
        {/* @ts-expect-error I'd love to fix this but... no time. And who usually needs HOCs these days anyway? */}
        <Component {...props} />
      </Profiler>
    );
  };
}
