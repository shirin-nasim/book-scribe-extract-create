
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  file: File | null;
  selectedPages: number[];
  onSelectPage: (pageNum: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ file, selectedPages, onSelectPage }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadingError(null);
    toast.success(`PDF loaded successfully with ${numPages} pages`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoadingError('Failed to load PDF. The file might be too large or corrupted.');
    toast.error('Failed to load PDF. Try a smaller file or check if the file is corrupted.');
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  const togglePageSelection = () => {
    onSelectPage(pageNumber);
  };

  const isPageSelected = (pageNum: number) => {
    return selectedPages.includes(pageNum);
  };

  // Display file size in MB
  const getFileSizeInMB = () => {
    if (!file) return '';
    const fileSizeMB = file.size / (1024 * 1024);
    return `(${fileSizeMB.toFixed(2)} MB)`;
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-4 mb-4">
        {file && (
          <p className="mb-2 text-sm text-gray-500">
            Viewing: {file.name} {getFileSizeInMB()}
          </p>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-4 py-2">
              Page {pageNumber} of {numPages || '--'}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changePage(1)} 
              disabled={!numPages || pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
            >
              <Minimize className="h-4 w-4" />
            </Button>
            
            <span className="px-2 py-1">{Math.round(zoom * 100)}%</span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center border rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
          {loadingError ? (
            <div className="p-20 text-center text-red-500">
              {loadingError}
              <p className="mt-4 text-sm">
                Try uploading a smaller PDF file (less than 20MB) or check if your file is corrupted.
              </p>
            </div>
          ) : file ? (
            <Document 
              file={file} 
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-20 flex flex-col items-center justify-center">
                  <Skeleton className="h-[600px] w-[450px]" />
                  <p className="mt-4 text-gray-500">Loading PDF, this may take a moment for large files...</p>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={zoom}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<Skeleton className="h-[600px] w-[450px]" />}
                error={<div className="p-10 text-center text-red-500">Failed to load this page</div>}
              />
            </Document>
          ) : (
            <div className="p-20 text-center text-gray-500">No PDF file selected</div>
          )}
        </div>
      </div>
      
      {file && !loadingError && (
        <Button 
          onClick={togglePageSelection}
          variant={isPageSelected(pageNumber) ? "destructive" : "default"}
          className={isPageSelected(pageNumber) ? "" : "bg-app-blue hover:bg-app-dark-blue"}
        >
          {isPageSelected(pageNumber) ? "Remove from Selection" : "Add to Selection"}
        </Button>
      )}
      
      {selectedPages.length > 0 && (
        <div className="mt-4 p-4 bg-slate-100 rounded-lg w-full max-w-3xl">
          <h3 className="font-medium mb-2">Selected Pages: {selectedPages.length}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedPages.sort((a, b) => a - b).map(page => (
              <span key={page} className="px-3 py-1 bg-app-blue text-white rounded-full text-sm">
                Page {page}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
