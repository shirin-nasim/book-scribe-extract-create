
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Extract text from PDF using PDF.js
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  
  let extractedText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map((item: any) => item.str).join(' ');
    extractedText += `Page ${i}:\n${textItems}\n\n`;
  }
  
  return extractedText;
}

// Perform OCR on PDF pages that don't have extractable text
export async function performOCROnPdf(file: File, pageNumbers: number[]): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  
  let extractedText = '';
  
  // Process selected pages
  for (const pageNumber of pageNumbers) {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better OCR
      
      // Render the PDF page onto a canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      if (!context) {
        throw new Error('Could not create canvas context');
      }
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Get image data URL from canvas
      const imageDataUrl = canvas.toDataURL('image/png');
      
      // Perform OCR using Tesseract.js
      const { data } = await Tesseract.recognize(
        imageDataUrl,
        'eng', // English language
        { 
          logger: (m) => console.log(m),
        }
      );
      
      extractedText += `Page ${pageNumber}:\n${data.text}\n\n`;
    } catch (error) {
      console.error(`Error processing page ${pageNumber}:`, error);
      extractedText += `Page ${pageNumber}: Error extracting text\n\n`;
    }
  }
  
  return extractedText;
}

// Create a new PDF from selected pages
export async function createPdfFromPages(
  originalPdf: File,
  selectedPages: number[],
  newFilename: string
): Promise<Uint8Array> {
  const arrayBuffer = await originalPdf.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  // Copy selected pages to new document
  for (const pageNumber of selectedPages) {
    // PDF page indices are 0-based internally
    const [copiedPage] = await newPdf.copyPages(srcDoc, [pageNumber - 1]);
    newPdf.addPage(copiedPage);
  }
  
  // Save document
  return await newPdf.save();
}

// Download a PDF file
export function downloadPdf(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download text as a file
export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
