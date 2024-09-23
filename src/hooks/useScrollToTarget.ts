import { RefObject, useEffect } from "react";

export function useScrollToTarget(
  doScroll: boolean,
  target: RefObject<HTMLElement>,
) {
  // Scroll to bottom while message loads
  useEffect(() => {
    let scrollingInterval: number | undefined;

    if (doScroll) {
      scrollingInterval = window.setInterval(() => {
        target.current?.scrollIntoView();
      }, 100);
    } else {
      clearInterval(scrollingInterval);
    }

    return () => {
      clearInterval(scrollingInterval);
    };
  }, [doScroll, target]);
}
