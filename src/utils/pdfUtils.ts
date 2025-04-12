
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Extract text from PDF using PDF.js
export async function extractTextFromPdf(file: File): Promise<string> {
  console.log('Starting text extraction from PDF', file.name, file.size);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded into memory, size:', arrayBuffer.byteLength);
    
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF document loaded with', pdf.numPages, 'pages');
    
    let extractedText = '';
    
    // For large PDFs, we can limit the number of pages processed
    const maxPages = Math.min(pdf.numPages, 50); // Process at most 50 pages
    
    for (let i = 1; i <= maxPages; i++) {
      console.log(`Processing page ${i}/${maxPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      extractedText += `Page ${i}:\n${textItems}\n\n`;
    }
    
    if (pdf.numPages > maxPages) {
      extractedText += `\n... Showing first ${maxPages} pages only. The PDF has ${pdf.numPages} pages in total.\n`;
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error in extractTextFromPdf:', error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Perform OCR on PDF pages that don't have extractable text
export async function performOCROnPdf(file: File, pageNumbers: number[]): Promise<string> {
  console.log('Starting OCR on PDF', file.name, 'for pages:', pageNumbers);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let extractedText = '';
    
    // Process selected pages
    for (const pageNumber of pageNumbers) {
      try {
        console.log(`Processing OCR for page ${pageNumber}`);
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
        console.log(`Generated image for page ${pageNumber}, starting OCR`);
        
        // Perform OCR using Tesseract.js
        const { data } = await Tesseract.recognize(
          imageDataUrl,
          'eng', // English language
          { 
            logger: (m) => console.log(`OCR progress:`, m),
          }
        );
        
        extractedText += `Page ${pageNumber}:\n${data.text}\n\n`;
        console.log(`OCR completed for page ${pageNumber}`);
      } catch (error) {
        console.error(`Error processing page ${pageNumber}:`, error);
        extractedText += `Page ${pageNumber}: Error extracting text\n\n`;
      }
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error in performOCROnPdf:', error);
    throw new Error(`Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Create a new PDF from selected pages
export async function createPdfFromPages(
  originalPdf: File,
  selectedPages: number[],
  newFilename: string
): Promise<Uint8Array> {
  console.log('Creating new PDF from pages:', selectedPages);
  
  try {
    const arrayBuffer = await originalPdf.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);
    console.log('Original PDF loaded with', srcDoc.getPageCount(), 'pages');
    
    const newPdf = await PDFDocument.create();
    
    // Copy selected pages to new document
    for (const pageNumber of selectedPages) {
      // PDF page indices are 0-based internally
      if (pageNumber <= srcDoc.getPageCount()) {
        console.log(`Copying page ${pageNumber} to new PDF`);
        const [copiedPage] = await newPdf.copyPages(srcDoc, [pageNumber - 1]);
        newPdf.addPage(copiedPage);
      } else {
        console.warn(`Page ${pageNumber} is out of range and will be skipped`);
      }
    }
    
    console.log(`New PDF created with ${newPdf.getPageCount()} pages`);
    
    // Save document with compression to reduce file size
    return await newPdf.save({ addDefaultPage: false, useObjectStreams: true });
  } catch (error) {
    console.error('Error in createPdfFromPages:', error);
    throw new Error(`Failed to create PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
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
