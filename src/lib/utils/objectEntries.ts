export const objectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as { [K in Extract<keyof T, string>]: [K, T[K]] }[Extract<keyof T, string>][];
