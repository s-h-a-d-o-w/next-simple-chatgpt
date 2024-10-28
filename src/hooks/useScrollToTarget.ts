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
      scrollToTarget();
    } else {
      stopScrolling = true;
    }

    return () => {
      stopScrolling = true;
    };
  }, [doScroll, target]);
}
