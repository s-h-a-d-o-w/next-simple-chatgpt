import { useMemo } from "react";

export function HmrTimestamp() {
  const lastUpdate = useMemo<Date>(() => new Date(), []);

  return lastUpdate.toLocaleTimeString();
}

export default HmrTimestamp;
