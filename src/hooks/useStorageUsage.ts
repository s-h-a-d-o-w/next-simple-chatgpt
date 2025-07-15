import { config } from "@/config";
import { isServer } from "@/utils/consts";
import { useState } from "react";

export function useStorageUsage() {
  const [storageUsage, setStorageUsage] = useState<number>();

  if (!isServer) {
    const history = localStorage.getItem("history");
    if (history) {
      const currentStorageUsage =
        history.length / config.storage.localStorageQuota;
      if (currentStorageUsage !== storageUsage) {
        setStorageUsage(currentStorageUsage);
      }
    }
  }

  return storageUsage;
}
