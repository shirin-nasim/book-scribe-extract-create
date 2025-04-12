
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PdfEditorProps {
  selectedPages: number[];
  originalPdf: File | null;
  onCreatePdf: (filename: string) => Promise<void>;
  isCreatingPdf: boolean;
}

const PdfEditor: React.FC<PdfEditorProps> = ({ 
  selectedPages, 
  originalPdf, 
  onCreatePdf,
  isCreatingPdf
}) => {
  const [newFilename, setNewFilename] = useState('');

  const handleCreatePdf = async () => {
    if (!newFilename) {
      toast.error('Please enter a filename');
      return;
    }
    
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }
    
    if (!originalPdf) {
      toast.error('No PDF file loaded');
      return;
    }
    
    try {
      await onCreatePdf(newFilename);
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('Failed to create PDF');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Create New PDF</h2>
      
      {selectedPages.length > 0 ? (
        <div className="mb-4 p-4 bg-slate-100 rounded-lg">
          <h3 className="font-medium mb-2">Selected Pages: {selectedPages.length}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedPages.sort((a, b) => a - b).map(page => (
              <span key={page} className="px-3 py-1 bg-app-blue text-white rounded-full text-sm">
                Page {page}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">No pages selected. Please select pages to include in your new PDF.</p>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="new-filename">New PDF Filename</Label>
          <Input
            id="new-filename"
            placeholder="Enter a name for your new PDF"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleCreatePdf}
          disabled={isCreatingPdf || selectedPages.length === 0 || !newFilename}
          className="bg-app-blue hover:bg-app-dark-blue"
        >
          {isCreatingPdf ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating PDF...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Create & Download PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PdfEditor;
