
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import PdfUploader from '@/components/PdfUploader';
import PdfViewer from '@/components/PdfViewer';
import TextExtractor from '@/components/TextExtractor';
import PdfEditor from '@/components/PdfEditor';
import SelectionMode from '@/components/SelectionMode';
import { toast } from 'sonner';
import { 
  extractTextFromPdf, 
  performOCROnPdf, 
  createPdfFromPages, 
  downloadPdf,
  downloadText
} from '@/utils/pdfUtils';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  const handlePdfSelected = (file: File) => {
    setPdfFile(file);
    setSelectedPages([]);
    setExtractedText('');
    toast.success(`Loaded ${file.name}`);
    setCurrentStep(2);
  };

  const handleSelectPage = (pageNum: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        // Remove page if already selected
        return prev.filter(p => p !== pageNum);
      } else {
        // Add page if not selected
        return [...prev, pageNum];
      }
    });
  };

  const handleSelectPages = (pages: number[]) => {
    setSelectedPages(pages);
  };

  const handleDocumentLoaded = (numPages: number) => {
    setNumPages(numPages);
  };

  const handleExtractText = async () => {
    if (!pdfFile || selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }
    
    setIsExtracting(true);
    
    try {
      // Try regular text extraction first
      let text = await extractTextFromPdf(pdfFile);
      
      // If very little text was extracted, try OCR
      if (text.trim().length < 100) {
        toast.info('Using OCR to extract text from image-based PDF. This may take a moment...');
        text = await performOCROnPdf(pdfFile, selectedPages);
      }
      
      setExtractedText(text);
      toast.success('Text extracted successfully');
    } catch (error) {
      console.error('Text extraction error:', error);
      toast.error('Failed to extract text');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSummarize = (text: string) => {
    // Mock summarization functionality
    toast.info('Summarization would be implemented here with a real AI backend');
    // In a real app, you would call an AI service here
  };

  const handleSaveText = (text: string, filename: string) => {
    downloadText(text, filename);
    toast.success(`Saved as ${filename}.txt`);
  };

  const handleCreatePdf = async (filename: string) => {
    if (!pdfFile || selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }
    
    setIsCreatingPdf(true);
    
    try {
      const pdfBytes = await createPdfFromPages(pdfFile, selectedPages, filename);
      downloadPdf(pdfBytes, filename);
      toast.success(`Created ${filename}.pdf`);
      setCurrentStep(3);
    } catch (error) {
      console.error('PDF creation error:', error);
      toast.error('Failed to create PDF');
    } finally {
      setIsCreatingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader currentStep={currentStep} setCurrentStep={setCurrentStep} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Upload Your PDF</h2>
            <PdfUploader onPdfSelected={handlePdfSelected} />
          </div>
        )}
        
        {currentStep === 2 && pdfFile && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Extract Content</h2>
            
            {/* Selection mode for pages */}
            <SelectionMode 
              numPages={numPages} 
              onSelectPages={handleSelectPages} 
            />
            
            <PdfViewer 
              file={pdfFile} 
              selectedPages={selectedPages} 
              onSelectPage={handleSelectPage} 
            />
            
            <TextExtractor 
              extractedText={extractedText}
              isExtracting={isExtracting}
              onExtractText={handleExtractText}
              onSummarize={handleSummarize}
              onSaveText={handleSaveText}
            />
            
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-app-blue hover:text-app-dark-blue underline font-medium"
              >
                Continue to Create PDF
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && pdfFile && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Create & Export</h2>
            
            {/* Selection mode for pages */}
            <SelectionMode 
              numPages={numPages} 
              onSelectPages={handleSelectPages} 
            />
            
            {/* Allow viewing and selecting pages even in export step */}
            <PdfViewer 
              file={pdfFile} 
              selectedPages={selectedPages} 
              onSelectPage={handleSelectPage} 
            />
            
            <PdfEditor 
              selectedPages={selectedPages}
              originalPdf={pdfFile}
              onCreatePdf={handleCreatePdf}
              isCreatingPdf={isCreatingPdf}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>BookScribe PDF Extractor - Extract, Summarize, Create</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
