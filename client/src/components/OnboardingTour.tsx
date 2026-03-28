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
  const [elementFound, setElementFound] = useState(true);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen) {
      setHighlightElement(null);
      return;
    }

    if (!step.target) {
      setElementFound(true);
      setHighlightElement(null);
      return;
    }

    try {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        setElementFound(true);
        updateTooltipPosition(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Element not found, but don't crash - just show the tooltip without highlight
        setHighlightElement(null);
        setElementFound(false);
        setTooltipPosition({ top: 100, left: 50 });
      }
    } catch (error) {
      // Invalid selector or other error - gracefully handle
      console.warn(`Tour step selector error: ${step.target}`, error);
      setHighlightElement(null);
      setElementFound(false);
      setTooltipPosition({ top: 100, left: 50 });
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
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Highlight Box */}
      {highlightElement && (
        <div
          className="fixed z-40 border-2 border-blue-500 rounded-lg pointer-events-none"
          style={{
            top: highlightElement.getBoundingClientRect().top - 4,
            left: highlightElement.getBoundingClientRect().left - 4,
            width: highlightElement.getBoundingClientRect().width + 8,
            height: highlightElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-6 max-w-sm"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{step.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground mb-4">{step.description}</p>

        {/* Element Not Found Warning */}
        {!elementFound && step.target && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mb-4">
            <p className="text-xs text-yellow-600">
              💡 Couldn't find the element on this page. Continue to the next step.
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-1 mb-4">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
