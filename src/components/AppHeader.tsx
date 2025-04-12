
import React from 'react';
import { FileText, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentStep, setCurrentStep }) => {
  const steps = [
    { id: 1, name: 'Upload PDF', icon: FileText },
    { id: 2, name: 'Extract', icon: BookOpen },
    { id: 3, name: 'Export', icon: Settings },
  ];

  return (
    <header className="bg-app-blue p-4 text-white">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">BookScribe</h1>
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "flex flex-col items-center text-sm p-2 rounded-md transition-colors",
                currentStep === step.id 
                  ? "bg-white/20" 
                  : "hover:bg-white/10"
              )}
            >
              <step.icon className="h-5 w-5 mb-1" />
              <span>{step.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
