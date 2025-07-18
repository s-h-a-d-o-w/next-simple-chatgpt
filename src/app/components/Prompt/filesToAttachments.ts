import { getPdfjsLib } from "@/utils/getPdfjsLib";

function convertFileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function convertPdfToImage(file: File): Promise<string[]> {
  const pdfjsLib = await getPdfjsLib();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  return await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, index) => {
      const page = await pdf.getPage(index + 1);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      return canvas.toDataURL("image/png");
    }),
  );
}

export async function filesToAttachments(files: File[]) {
  return (
    (
      await Promise.all(
        files.map(async (file) => {
          if (file.type === "application/pdf") {
            try {
              return (await convertPdfToImage(file)).map((dataURL, index) => ({
                name: `${file.name} - Page ${index + 1}`,
                contentType: "image/png",
                url: dataURL,
              }));
            } catch (error) {
              // TODO: render error in ui
              console.error("Error converting PDF to image:", error);
              return [];
            }
          } else {
            // image
            try {
              return [
                {
                  name: file.name,
                  contentType: file.type,
                  url: await convertFileToDataURL(file),
                },
              ];
            } catch (error) {
              // TODO: render error in ui
              console.error("Error converting file to data URL:", error);
              return [];
            }
          }
        }),
      )
    )
      // PDFs can produce multiple images, and multiple files might be selected, hence the nesting.
      // But in the end, we only care about individual images, not different files.
      .flat()
      // Filter out elements that errored
      .filter((file) => file !== undefined)
  );
}
