/**
 * Email Template Customizer
 * Allows users to customize banking details email templates
 */

import { useState } from 'react';
import { Mail, Eye, Check, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EmailTemplate {
  companyName: string;
  companyLogo?: string;
  paymentTerms: string;
  customMessage: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankName: string;
  branchCode: string;
}

interface EmailTemplateCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
  initialTemplate?: EmailTemplate;
}

const DEFAULT_TEMPLATE: EmailTemplate = {
  companyName: 'TraceCore AI',
  paymentTerms: 'Payment due within 7 days of invoice date',
  customMessage: 'Thank you for choosing our service. Please transfer the payment to the account details below.',
  bankAccountHolder: 'T Jonker',
  bankAccountNumber: '63198166035',
  bankName: 'First National Bank',
  branchCode: '250155',
};

export function EmailTemplateCustomizer({
  isOpen,
  onClose,
  onSave,
  initialTemplate = DEFAULT_TEMPLATE,
}: EmailTemplateCustomizerProps) {
  const [template, setTemplate] = useState<EmailTemplate>(initialTemplate);
  const [showPreview, setShowPreview] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof EmailTemplate, value: string) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplate(prev => ({
          ...prev,
          companyLogo: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      toast.success('Logo uploaded');
    }
  };

  const handleSave = () => {
    if (!template.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    onSave(template);
    toast.success('Email template saved');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Email Template Customizer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              !showPreview
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              showPreview
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {!showPreview ? (
          /* Edit Tab */
          <div className="space-y-6">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company Information</h3>
              
              <div className="space-y-2">
                <Label className="text-sm">Company Name</Label>
                <Input
                  value={template.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your company name"
                  className="bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Company Logo</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload logo (max 2MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {template.companyLogo && (
                    <img
                      src={template.companyLogo}
                      alt="Logo preview"
                      className="w-12 h-12 rounded border border-border object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Payment Information</h3>
              
              <div className="space-y-2">
                <Label className="text-sm">Payment Terms</Label>
                <Input
                  value={template.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  placeholder="e.g., Payment due within 7 days"
                  className="bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Custom Message</Label>
                <textarea
                  value={template.customMessage}
                  onChange={(e) => handleInputChange('customMessage', e.target.value)}
                  placeholder="Add a custom message to the email..."
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
                  rows={4}
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Bank Account Details</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Account Holder</Label>
                  <Input
                    value={template.bankAccountHolder}
                    onChange={(e) => handleInputChange('bankAccountHolder', e.target.value)}
                    placeholder="Account holder name"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Account Number</Label>
                  <Input
                    value={template.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    placeholder="Account number"
                    className="bg-muted/50 border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Bank Name</Label>
                  <Input
                    value={template.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Bank name"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Branch Code</Label>
                  <Input
                    value={template.branchCode}
                    onChange={(e) => handleInputChange('branchCode', e.target.value)}
                    placeholder="Branch code"
                    className="bg-muted/50 border-border"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Tab */
          <div className="bg-white text-black p-6 rounded-lg space-y-4">
            {template.companyLogo && (
              <img src={template.companyLogo} alt="Logo" className="h-12 object-contain" />
            )}
            
            <p className="font-semibold text-lg">{template.companyName}</p>
            
            <p className="text-sm text-gray-600">{template.customMessage}</p>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="font-semibold text-sm mb-3">Bank Transfer Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Holder:</span>
                  <span className="font-medium">{template.bankAccountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-medium">{template.bankAccountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{template.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch Code:</span>
                  <span className="font-medium">{template.branchCode}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">{template.paymentTerms}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          <Button
            onClick={handleSave}
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
            Save Template
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
