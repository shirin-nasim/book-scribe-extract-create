
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { toast } from 'sonner';

interface PdfUploaderProps {
  onPdfSelected: (file: File) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onPdfSelected(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onPdfSelected(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-10 text-center ${
        isDragging ? 'border-app-blue bg-app-blue/10' : 'border-gray-300'
      } transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="bg-app-blue/10 p-4 rounded-full">
          <Upload className="h-12 w-12 text-app-blue" />
        </div>
        <h3 className="text-xl font-medium">Upload your PDF</h3>
        <p className="text-gray-500 mb-4">Drag and drop your PDF file here, or click to browse</p>
        
        <Button 
          onClick={triggerFileInput}
          className="bg-app-blue hover:bg-app-dark-blue"
        >
          <File className="h-4 w-4 mr-2" />
          Browse Files
        </Button>
      </div>
    </div>
  );
};

export default PdfUploader;
