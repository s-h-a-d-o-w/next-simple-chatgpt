import useLocalStorageState from "use-local-storage-state";

export function useIsDarkMode() {
  return useLocalStorageState("darkMode", {
    defaultValue:
      typeof window === "undefined"
        ? false
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
  });
}
