
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, BookOpen, FileDown, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

interface TextExtractorProps {
  extractedText: string;
  isExtracting: boolean;
  onExtractText: () => void;
  onSummarize: (text: string) => void;
  onSaveText: (text: string, filename: string) => void;
}

const TextExtractor: React.FC<TextExtractorProps> = ({ 
  extractedText, 
  isExtracting, 
  onExtractText,
  onSummarize,
  onSaveText
}) => {
  const [filename, setFilename] = useState('extracted-text');
  const [summaryMode, setSummaryMode] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!extractedText) {
      toast.error('Please extract text first');
      return;
    }
    
    setIsSummarizing(true);
    try {
      // Mock summarization to simulate AI processing
      // In a real app, you'd call your AI service here
      setTimeout(() => {
        const mockSummary = extractedText
          .split('.')
          .slice(0, 3)
          .join('.') + '.';
        setSummary(mockSummary);
        setSummaryMode(true);
        setIsSummarizing(false);
        toast.success('Summary generated successfully');
      }, 2000);
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error('Failed to generate summary');
      setIsSummarizing(false);
    }
  };

  const handleSaveText = () => {
    const textToSave = summaryMode ? summary : extractedText;
    if (!textToSave) {
      toast.error('No text to save');
      return;
    }
    onSaveText(textToSave, filename);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Text Extraction</h2>
          <Button
            onClick={onExtractText}
            disabled={isExtracting}
            className="bg-app-blue hover:bg-app-dark-blue"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Extract Text
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="extracted-text">Extracted Text</Label>
            <Textarea
              id="extracted-text"
              value={extractedText}
              readOnly
              className="font-mono h-48 resize-none"
              placeholder="Extracted text will appear here..."
            />
          </div>
          
          <div>
            <Label htmlFor="summary-text">
              {summaryMode ? "Summary" : "Summary will appear here"}
            </Label>
            <Textarea
              id="summary-text"
              value={summary}
              readOnly
              className="font-mono h-48 resize-none"
              placeholder="Generate a summary to see results..."
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleSummarize}
            disabled={!extractedText || isSummarizing}
            variant="outline"
            className="flex-1"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
          
          <div className="flex flex-1 gap-2">
            <div className="flex-grow">
              <Input
                placeholder="Enter filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSaveText}
              disabled={!extractedText && !summary}
              variant="outline"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Save as Text
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;
