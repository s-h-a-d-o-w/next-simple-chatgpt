// Function to open file picker and read a JSON file, returning contents via a Promise
export function loadJsonFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create an input element of type file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Set to accept only JSON files

    // Listen for file selection
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      // Create a FileReader to read the file
      const reader = new FileReader();

      // Define what happens on file read
      reader.onload = (readEvent) => {
        const content = readEvent.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          reject(new Error("Failed to read file content as string"));
        }
      };

      // Handle file read errors
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      // Read the file as text
      reader.readAsText(file);
    };

    // Trigger the file input dialog
    input.click();
  });
}
