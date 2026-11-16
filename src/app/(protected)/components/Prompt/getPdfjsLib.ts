let pdfjsLib: typeof import("pdfjs-dist") | undefined;

// Load pdfjs-dist dynamically so that we don't get "Warning: Please use the `legacy` build in Node.js environments." on the server.
export async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    // Needs to be reachable for the client, don't know how to bundle this.
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjsLib;
}
