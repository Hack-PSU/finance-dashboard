import { PDFDocument } from "pdf-lib";

const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;
const PAGE_MARGIN = 36;

async function appendFileAsPages(target: PDFDocument, file: File) {
  const bytes = await file.arrayBuffer();

  if (file.type === "application/pdf") {
    const sourceDoc = await PDFDocument.load(bytes);
    const pages = await target.copyPages(sourceDoc, sourceDoc.getPageIndices());
    pages.forEach((page) => target.addPage(page));
    return;
  }

  const image =
    file.type === "image/png"
      ? await target.embedPng(bytes)
      : await target.embedJpg(bytes);

  const maxWidth = LETTER_WIDTH - PAGE_MARGIN * 2;
  const maxHeight = LETTER_HEIGHT - PAGE_MARGIN * 2;
  const scaled = image.scaleToFit(maxWidth, maxHeight);

  const page = target.addPage([LETTER_WIDTH, LETTER_HEIGHT]);
  page.drawImage(image, {
    x: (LETTER_WIDTH - scaled.width) / 2,
    y: (LETTER_HEIGHT - scaled.height) / 2,
    width: scaled.width,
    height: scaled.height,
  });
}

export async function mergeReceiptAndBankStatement(
  receipt: File,
  bankStatement: File,
): Promise<File> {
  const mergedPdf = await PDFDocument.create();

  await appendFileAsPages(mergedPdf, receipt);
  await appendFileAsPages(mergedPdf, bankStatement);

  const mergedBytes = await mergedPdf.save();
  return new File([mergedBytes as BlobPart], "combined-receipt.pdf", {
    type: "application/pdf",
  });
}
