import { stringify } from "superjson";

// Save via temporary object URL and link clicking.
export function saveJsonFile(data: unknown, filename: string): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([stringify(data)], {
      type: "application/json",
    }),
  );
  link.download = filename;

  document.body.append(link);
  link.click();
  link.remove();
}
