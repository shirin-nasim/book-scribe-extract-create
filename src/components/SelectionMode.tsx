
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SelectionModeProps {
  numPages: number | null;
  onSelectPages: (pages: number[]) => void;
}

const SelectionMode: React.FC<SelectionModeProps> = ({ numPages, onSelectPages }) => {
  const [pageRangeStart, setPageRangeStart] = useState<string>('');
  const [pageRangeEnd, setPageRangeEnd] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterNumber, setChapterNumber] = useState<string>('');

  const handlePageRangeSelection = () => {
    const start = parseInt(pageRangeStart);
    const end = parseInt(pageRangeEnd);
    
    if (isNaN(start) || isNaN(end)) {
      toast.error('Please enter valid page numbers');
      return;
    }
    
    if (start < 1 || (numPages && end > numPages)) {
      toast.error(`Page range must be between 1 and ${numPages || 'last page'}`);
      return;
    }
    
    if (start > end) {
      toast.error('Start page must be less than or equal to end page');
      return;
    }
    
    const selectedPages = [];
    for (let i = start; i <= end; i++) {
      selectedPages.push(i);
    }
    
    onSelectPages(selectedPages);
    toast.success(`Selected pages ${start} to ${end}`);
  };

  const handleChapterSelection = () => {
    if (!chapterTitle && !chapterNumber) {
      toast.error('Please enter either chapter title or number');
      return;
    }
    
    // In a real app, this would search the PDF content for chapter headers
    // For now, we'll simulate chapter detection with some fake data
    let chapterPages: number[] = [];
    
    if (chapterNumber) {
      const num = parseInt(chapterNumber);
      if (isNaN(num)) {
        toast.error('Please enter a valid chapter number');
        return;
      }
      
      // Simulate chapter detection based on chapter number
      // In a real app, you would use AI/ML to detect chapter boundaries
      const chaptersSimulation: Record<number, number[]> = {
        1: [1, 2, 3, 4, 5],
        2: [6, 7, 8, 9, 10],
        3: [11, 12, 13, 14, 15],
        4: [16, 17, 18, 19, 20],
      };
      
      chapterPages = chaptersSimulation[num] || [];
      
      if (chapterPages.length === 0) {
        toast.error(`Chapter ${num} not found in the document`);
        return;
      }
    } else if (chapterTitle) {
      // Simulate chapter detection based on title
      // In a real app, you would use AI/ML to search for the title in the document
      const titleLower = chapterTitle.toLowerCase();
      if (titleLower.includes('introduction')) {
        chapterPages = [1, 2, 3];
      } else if (titleLower.includes('conclusion')) {
        chapterPages = [numPages ? numPages - 2 : 18, numPages ? numPages - 1 : 19, numPages || 20];
      } else {
        // Random simulation for any other title
        const startPage = Math.floor(Math.random() * (numPages || 15)) + 1;
        for (let i = 0; i < 3; i++) {
          if (numPages && startPage + i <= numPages) {
            chapterPages.push(startPage + i);
          }
        }
      }
    }
    
    if (chapterPages.length > 0) {
      onSelectPages(chapterPages);
      toast.success(`Selected ${chapterPages.length} pages for the chapter`);
    } else {
      toast.error('Could not detect chapter pages');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Select Pages</h2>
      
      <Tabs defaultValue="range" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="range">Page Range</TabsTrigger>
          <TabsTrigger value="chapter">Chapter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="range" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page-start">Start Page</Label>
              <Input
                id="page-start"
                type="number"
                min={1}
                max={numPages || undefined}
                placeholder="1"
                value={pageRangeStart}
                onChange={(e) => setPageRangeStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="page-end">End Page</Label>
              <Input
                id="page-end"
                type="number"
                min={1}
                max={numPages || undefined}
                placeholder={numPages?.toString() || "Last page"}
                value={pageRangeEnd}
                onChange={(e) => setPageRangeEnd(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handlePageRangeSelection}
            className="w-full bg-app-blue hover:bg-app-dark-blue"
          >
            Select Range
          </Button>
        </TabsContent>
        
        <TabsContent value="chapter" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="chapter-number">Chapter Number</Label>
            <Input
              id="chapter-number"
              type="number"
              min={1}
              placeholder="Enter chapter number (e.g., 1, 2, 3)"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="chapter-title">OR Chapter Title</Label>
            <Input
              id="chapter-title"
              type="text"
              placeholder="Enter chapter title (e.g., Introduction)"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleChapterSelection}
            className="w-full bg-app-blue hover:bg-app-dark-blue"
          >
            Find Chapter Pages
          </Button>
          
          <p className="text-sm text-gray-500 italic">
            Note: In this demo, chapter detection is simulated. In a full implementation, AI would analyze the document to accurately identify chapters.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelectionMode;
