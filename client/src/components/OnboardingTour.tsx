/**
 * Onboarding Tour — Comprehensive guided walkthrough for new users
 * Covers: business setup, workflow customization, dashboard, settings, AI, voice commands
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ChevronRight, ChevronLeft, X, Check, Sparkles } from 'lucide-react';
import { WorkflowStageEditor } from './WorkflowStageEditor';

interface TourStep {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to TraceCore AI',
    description: 'Let\'s set up your business and get you started',
    details: [
      'Your business name: {{businessName}}',
      'Workflow type: {{workflowType}}',
      'Currency: {{currency}}',
      'Region: {{region}}',
    ],
    icon: Sparkles,
  },
  {
    id: 'workflow-overview',
    title: 'Your Workflow',
    description: 'Here\'s your customized workflow for your business',
    details: [
      'Your workflow is tailored to your {{workflowType}} business',
      'You can customize stage names anytime',
      'Example: Rename "Raw Materials" to "Toys" if needed',
      'Add or remove stages based on your needs',
    ],
    icon: Sparkles,
  },
  {
    id: 'customize-stages',
    title: 'Customize Workflow Stages',
    description: 'Rename your workflow stages to match your business',
    details: [
      'Click "Edit" next to each stage name',
      'Change "Raw Materials" to "Toys", "Inventory", etc.',
      'Click the checkmark to save your changes',
      'You can always reset to defaults if needed',
    ],
    icon: Sparkles,
  },
  {
    id: 'home-dashboard',
    title: 'Home Dashboard',
    description: 'Your command center for business operations',
    details: [
      'KPI cards show your business metrics at a glance',
      'Charts display production volume and order trends',
      'Core Operations section shows your workflow',
      'Recent activity and orders are listed below',
    ],
    icon: Sparkles,
  },
  {
    id: 'sidebar-navigation',
    title: 'Sidebar Navigation',
    description: 'Quick access to all your business tools',
    details: [
      'Home: Your main dashboard',
      'Workflow stages: Based on your selections',
      'Inventory Activity: Track all changes',
      'Reports: View analytics and insights',
      'Settings: Configure your business',
    ],
    icon: Sparkles,
  },
  {
    id: 'ai-setup',
    title: 'AI Assistant Setup',
    description: 'Configure your AI assistant for your business',
    details: [
      'Go to Settings → AI Assistant',
      'Set up your AI model preferences',
      'Configure automation rules',
      'Enable voice commands for hands-free operation',
    ],
    icon: Sparkles,
  },
  {
    id: 'settings',
    title: 'Settings & Configuration',
    description: 'Manage your business settings',
    details: [
      'Business Details: Update company information',
      'Email Templates: Customize banking details emails',
      'Workflow Configuration: View and edit your workflow',
      'Team Members: Add users to your workspace',
    ],
    icon: Sparkles,
  },
  {
    id: 'voice-commands',
    title: 'Voice Commands',
    description: 'Control TraceCore AI with your voice',
    details: [
      'Click the microphone icon to start voice command',
      'Say commands like "Add new product" or "Show orders"',
      'Commands are executed in real-time',
      'Perfect for hands-free operation while working',
    ],
    icon: Sparkles,
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Your first steps in TraceCore AI',
    details: [
      '1. Add your first product/supplier',
      '2. Create your first order',
      '3. Set up your workflow stages',
      '4. Configure your AI preferences',
    ],
    icon: Sparkles,
  },
];

interface OnboardingTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageEditorOpen?: (open: boolean) => void;
}

export function OnboardingTour({ open, onOpenChange, onStageEditorOpen }: OnboardingTourProps) {
  const { state } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [showStageEditor, setShowStageEditor] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  const getStepDetails = (details: string[]) => {
    return details.map(detail =>
      detail
        .replace('{{businessName}}', state.workspace.name || 'Your Business')
        .replace('{{workflowType}}', state.workspace.businessType || 'custom')
        .replace('{{currency}}', state.workspace.currency || 'ZAR')
        .replace('{{region}}', state.workspace.region || 'South Africa')
    );
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour complete
      onOpenChange(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCustomizeStages = () => {
    setShowStageEditor(true);
    if (onStageEditorOpen) {
      onStageEditorOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle>{step.title}</DialogTitle>
                <DialogDescription>{step.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
            </div>

            {/* Step details */}
            <div className="space-y-3">
              {getStepDetails(step.details).map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-semibold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-foreground pt-0.5">{detail}</p>
                </div>
              ))}
            </div>

            {/* Special action for customize stages step */}
            {step.id === 'customize-stages' && (
              <Button
                onClick={handleCustomizeStages}
                variant="outline"
                className="w-full"
              >
                Open Workflow Stage Editor
              </Button>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            </div>

            <div className="flex gap-2">
              {currentStep === TOUR_STEPS.length - 1 ? (
                <Button
                  onClick={() => onOpenChange(false)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Complete Tour
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Skip Tour
                  </Button>
                  <Button onClick={handleNext} className="gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Stage Editor Modal */}
      {showStageEditor && (
        <WorkflowStageEditor
          open={showStageEditor}
          onOpenChange={(isOpen) => {
            setShowStageEditor(isOpen);
            if (!isOpen && onStageEditorOpen) {
              onStageEditorOpen(false);
            }
          }}
        />
      )}
    </>
  );
}
