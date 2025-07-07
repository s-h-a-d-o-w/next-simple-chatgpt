import { isServer } from "@/utils/consts";
import { useState } from "react";

// Actual maximum is around 5 MB.
const LOCAL_STORAGE_QUOTA = 2.5 * 1024 * 1024; // 2.5MB

export function useStorageUsage() {
  const [storageUsage, setStorageUsage] = useState<number>();

  if (!isServer) {
    const history = localStorage.getItem("history");
    if (history) {
      const currentStorageUsage = history.length / LOCAL_STORAGE_QUOTA;
      if (currentStorageUsage !== storageUsage) {
        setStorageUsage(currentStorageUsage);
      }
    }
  }

  return storageUsage;
}
