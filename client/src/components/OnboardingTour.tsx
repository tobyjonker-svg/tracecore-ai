/**
 * OnboardingTour Component
 * Guided walkthrough for new users showing how to add suppliers and products
 */

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  highlightClass?: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function OnboardingTour({ steps, isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen || !step.target) {
      setHighlightElement(null);
      return;
    }

    const element = document.querySelector(step.target) as HTMLElement;
    if (element) {
      setHighlightElement(element);
      updateTooltipPosition(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isOpen, step.target]);

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const position = step.position || 'bottom';

    let top = rect.top;
    let left = rect.left;

    switch (position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - 150;
        break;
      case 'top':
        top = rect.top - 20;
        left = rect.left + rect.width / 2 - 150;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 60;
        left = rect.left - 320;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 60;
        left = rect.right + 20;
        break;
    }

    setTooltipPosition({ top: Math.max(10, top), left: Math.max(10, left) });
  };

  const handleNext = () => {
    if (step.action) {
      step.action();
    }
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onClose();
    onComplete?.();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 pointer-events-none" />

      {/* Highlight */}
      {highlightElement && (
        <div
          className="fixed border-2 border-primary rounded-lg pointer-events-none z-40 shadow-lg shadow-primary/50 animate-pulse"
          style={{
            top: highlightElement.getBoundingClientRect().top - 4,
            left: highlightElement.getBoundingClientRect().left - 4,
            width: highlightElement.getBoundingClientRect().width + 8,
            height: highlightElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed bg-card border border-border rounded-lg shadow-xl p-6 z-50 max-w-sm"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {/* Step Counter */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {step.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-1 mb-6">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            size="sm"
            className="flex-1 gap-1"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Tour
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip tour
        </button>
      </div>
    </>
  );
}
