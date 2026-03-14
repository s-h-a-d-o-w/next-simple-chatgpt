export const objectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Array<
    { [K in Extract<keyof T, string>]: [K, T[K]] }[Extract<keyof T, string>]
  >;
