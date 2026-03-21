export function loadJsonFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        const content = await file.text();
        resolve(content);
      } catch {
        reject(new Error("Error reading file"));
      }
    });

    input.click();
  });
}
