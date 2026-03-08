export function loadJsonFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create an input element of type file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Set to accept only JSON files

    // Listen for file selection
    input.onchange = async (event) => {
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
    };

    // Trigger the file input dialog
    input.click();
  });
}
