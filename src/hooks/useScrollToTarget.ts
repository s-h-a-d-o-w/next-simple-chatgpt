import { RefObject, useEffect } from "react";

export function useScrollToTarget(
  doScroll: boolean,
  target: RefObject<HTMLElement>,
) {
  useEffect(() => {
    let stopScrolling: boolean = false;

    if (doScroll) {
      const scrollToTarget = () => {
        requestAnimationFrame(() => {
          target.current?.scrollIntoView();
          if (!stopScrolling) {
            scrollToTarget();
          }
        });
      };

      // Slow devices might not paint the stop button correctly if we start scrolling immediately
      setTimeout(() => {
        scrollToTarget();
      }, 100);
    } else {
      stopScrolling = true;
    }

    return () => {
      stopScrolling = true;
    };
  }, [doScroll, target]);
}
