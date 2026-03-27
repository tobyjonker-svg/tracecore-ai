/**
 * AI Setup Wizard Component
 * Guides users through configuring AI voice assistant
 */

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Zap, Mic, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface AIConfig {
  businessName: string;
  businessType: string;
  customPrompt: string;
  voiceEnabled: boolean;
  commandsEnabled: boolean;
  selectedCommands: string[];
}

interface AISetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: AIConfig) => void;
  initialConfig?: Partial<AIConfig>;
  businessType?: string;
  businessName?: string;
}

const WIZARD_STEPS = [
  { id: 'welcome', title: 'Welcome to AI Assistant', icon: Zap },
  { id: 'voice', title: 'Voice Commands', icon: Mic },
  { id: 'prompt', title: 'Custom Instructions', icon: MessageSquare },
  { id: 'commands', title: 'Select Commands', icon: Settings },
  { id: 'review', title: 'Review & Confirm', icon: Check },
];

const BUSINESS_PROMPTS: Record<string, string> = {
  'Herbal Products': 'You are an AI assistant for a herbal products manufacturing business. Help with inventory management, production scheduling, supplier communication, and quality control for herbal extracts and supplements.',
  'Mushroom Extract': 'You are an AI assistant for a mushroom extract manufacturing company. Assist with cultivation tracking, extraction processes, quality testing, and distribution management.',
  'Cosmetics': 'You are an AI assistant for a cosmetics manufacturing business. Help with product formulation, ingredient sourcing, batch management, and compliance tracking.',
  'Food Manufacturing': 'You are an AI assistant for a food manufacturing company. Assist with recipe management, food safety compliance, supplier coordination, and production scheduling.',
  'Nutraceuticals': 'You are an AI assistant for a nutraceuticals company. Help with supplement formulation, ingredient quality control, regulatory compliance, and distribution.',
  'Supplements': 'You are an AI assistant for a supplement manufacturing business. Assist with product development, quality assurance, supplier management, and customer support.',
  'Essential Oils': 'You are an AI assistant for an essential oils business. Help with sourcing, distillation processes, quality testing, and inventory management.',
  'Skincare': 'You are an AI assistant for a skincare manufacturing company. Assist with product formulation, ingredient sourcing, batch testing, and regulatory compliance.',
  'Beverages': 'You are an AI assistant for a beverage manufacturing business. Help with recipe management, quality control, production scheduling, and distribution.',
  'Spices': 'You are an AI assistant for a spice manufacturing company. Assist with sourcing, processing, quality testing, and inventory management.',
  'Herbal Tea': 'You are an AI assistant for a herbal tea company. Help with blend formulation, sourcing, quality control, and production management.',
  'Craft Goods': 'You are an AI assistant for a craft goods business. Assist with production planning, inventory management, quality control, and order fulfillment.',
  'Artisanal Products': 'You are an AI assistant for an artisanal products business. Help with production scheduling, quality management, inventory tracking, and customer support.',
};

const AVAILABLE_COMMANDS = [
  { id: 'inventory-check', name: 'Check Inventory', description: 'Get current stock levels for products' },
  { id: 'low-stock-alert', name: 'Low Stock Alert', description: 'Check which items are running low' },
  { id: 'production-status', name: 'Production Status', description: 'Get current production run status' },
  { id: 'supplier-info', name: 'Supplier Info', description: 'Get supplier contact and details' },
  { id: 'order-status', name: 'Order Status', description: 'Check pending and recent orders' },
  { id: 'create-order', name: 'Create Order', description: 'Create a new purchase order' },
  { id: 'schedule-production', name: 'Schedule Production', description: 'Schedule a new production run' },
  { id: 'quality-report', name: 'Quality Report', description: 'Get quality control data' },
];

export default function AISetupWizard({
  isOpen,
  onClose,
  onComplete,
  initialConfig,
  businessType = '',
  businessName = '',
}: AISetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<AIConfig>({
    businessName: initialConfig?.businessName || businessName || '',
    businessType: initialConfig?.businessType || businessType || '',
    customPrompt: initialConfig?.customPrompt || BUSINESS_PROMPTS[businessType] || '',
    voiceEnabled: initialConfig?.voiceEnabled ?? true,
    commandsEnabled: initialConfig?.commandsEnabled ?? true,
    selectedCommands: initialConfig?.selectedCommands || AVAILABLE_COMMANDS.slice(0, 4).map(c => c.id),
  });

  const step = WIZARD_STEPS[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(config);
      toast.success('AI Assistant configured successfully!');
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleCommand = (commandId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedCommands: prev.selectedCommands.includes(commandId)
        ? prev.selectedCommands.filter(id => id !== commandId)
        : [...prev.selectedCommands, commandId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Step {currentStep + 1} of {WIZARD_STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Let's set up your AI Assistant! This wizard will help you configure voice commands and custom instructions tailored to your business.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                  <Mic className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Voice Commands</p>
                    <p className="text-sm text-muted-foreground">Control your system hands-free with voice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Custom Instructions</p>
                    <p className="text-sm text-muted-foreground">Train AI with your business-specific workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Smart Commands</p>
                    <p className="text-sm text-muted-foreground">Pre-configured commands for common tasks</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  Enable Voice Commands?
                </Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, voiceEnabled: true }))}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      config.voiceEnabled
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/50 hover:border-border'
                    }`}
                  >
                    <Mic className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium text-foreground">Yes, Enable</p>
                    <p className="text-xs text-muted-foreground mt-1">Use voice to control the system</p>
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, voiceEnabled: false }))}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      !config.voiceEnabled
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/50 hover:border-border'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium text-foreground">Text Only</p>
                    <p className="text-xs text-muted-foreground mt-1">Use text commands instead</p>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {config.voiceEnabled
                    ? 'Voice commands allow you to control TraceCore AI hands-free. You can ask questions and give commands using your voice.'
                    : 'Text commands let you interact with AI through typed messages. You can still use all features without voice.'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Business Type
                </Label>
                <Input
                  value={config.businessType}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Custom Instructions for AI
                </Label>
                <Textarea
                  value={config.customPrompt}
                  onChange={(e) => setConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Enter custom instructions for your AI assistant..."
                  className="min-h-[200px] resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                These instructions will guide how the AI responds to your commands and questions.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Select which commands you want to enable for your AI assistant:
              </p>
              <div className="space-y-2">
                {AVAILABLE_COMMANDS.map(command => (
                  <button
                    key={command.id}
                    onClick={() => toggleCommand(command.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      config.selectedCommands.includes(command.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/50 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{command.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{command.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                        config.selectedCommands.includes(command.id)
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {config.selectedCommands.includes(command.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-medium text-foreground mb-3">Configuration Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Type:</span>
                    <span className="font-medium text-foreground">{config.businessType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voice Enabled:</span>
                    <span className="font-medium text-foreground">{config.voiceEnabled ? 'Yes' : 'Text Only'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commands Enabled:</span>
                    <span className="font-medium text-foreground">{config.selectedCommands.length} commands</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Custom Instructions:</p>
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground max-h-[150px] overflow-y-auto">
                  {config.customPrompt}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Complete Setup" to save your AI configuration and start using voice commands!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 gap-2"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
