import { isDev } from "@/utils/consts";
import { useEffect, useState } from "react";

// eslint-disable-next-line @next/next/no-assign-module-variable
declare const module: {
  hot?: {
    addStatusHandler: (handler: (status: string) => void) => void;
  };
};

const HmrTimestamp = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>();

  useEffect(() => {
    if (isDev && module.hot) {
      const updateTimestamp = () => {
        setLastUpdate(new Date());
      };

      module.hot.addStatusHandler((status) => {
        if (status === "idle") {
          updateTimestamp();
        }
      });

      setLastUpdate(new Date());
    }
  }, []);

  return lastUpdate ? lastUpdate.toLocaleTimeString() : null;
};

export default HmrTimestamp;
