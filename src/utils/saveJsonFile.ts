import * as superjson from "superjson";

export function saveJsonFile(data: unknown, filename: string): void {
  // Create a blob with the JSON content
  const blob = new Blob([superjson.stringify(data)], {
    type: "application/json",
  });

  // Create a link element to download the blob
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  // Append the link to the body, click it, and then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
