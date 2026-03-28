/**
 * TraceCore AI — Settings Page
 * Design: Soft-Dark Enterprise
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { BusinessType } from '@/lib/store';
import { Settings as SettingsIcon, Building2, Users, Bell, Shield, RefreshCw, ChevronRight, Zap, Plus, Edit2, Trash2, Check, X, Mic, Mail } from 'lucide-react';
import AISetupWizard from '@/components/AISetupWizard';
import { EmailTemplateCustomizer } from '@/components/EmailTemplateCustomizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const BUSINESS_TYPES: BusinessType[] = [
  'Herbal Medicine',
  'Mushroom Extracts',
  'Cosmetics',
  'Food Production',
  'Toy Manufacturing',
  'Nutraceuticals',
  'Supplements',
  'Essential Oils',
  'Skincare',
  'Beverages',
  'Spices & Seasonings',
  'Herbal Tea',
  'Craft Goods',
  'Artisanal Products',
  'Other',
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Operator';
}

export default function Settings() {
  const { state, dispatch } = useApp();
  const [workspaceName, setWorkspaceName] = useState(state.workspace.name);
  const [isAIWizardOpen, setIsAIWizardOpen] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType>(state.workspace.businessType);
  const [customCategory, setCustomCategory] = useState(state.workspace.customCategory ?? '');
  
  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingRole, setEditingRole] = useState<'Owner' | 'Manager' | 'Operator'>('Operator');
  const [showAddMember, setShowAddMember] = useState(false);
  
  // Workflow customization
  const [enableInputs, setEnableInputs] = useState(state.workspace.enableInputs ?? true);
  const [enableOrders, setEnableOrders] = useState(state.workspace.enableOrders ?? true);
  const [enableShipping, setEnableShipping] = useState(state.workspace.enableShipping ?? true);
  const [enableProductionRuns, setEnableProductionRuns] = useState(state.workspace.enableProductionRuns ?? true);
  
  // Save success state
  const [, navigate] = useLocation();
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Email template customization
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(false);

  const handleSaveWorkspace = () => {
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }
    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: {
        name: workspaceName,
        businessType,
        customCategory,
        enableInputs,
        enableOrders,
        enableShipping,
        enableProductionRuns,
      },
    });
    toast.success('Workspace settings saved');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000); // Reset after 5 seconds
  };

  const handleAddTeamMember = () => {
    if (!editingName.trim() || !editingEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: editingName,
      email: editingEmail,
      role: editingRole,
    };
    setTeamMembers([...teamMembers, newMember]);
    setEditingName('');
    setEditingEmail('');
    setEditingRole('Operator');
    setShowAddMember(false);
    toast.success('Team member added');
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditingName(member.name);
    setEditingEmail(member.email);
    setEditingRole(member.role);
  };

  const handleSaveTeamMember = () => {
    if (!editingName.trim() || !editingEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setTeamMembers(teamMembers.map(m =>
      m.id === editingMemberId
        ? { ...m, name: editingName, email: editingEmail, role: editingRole }
        : m
    ));
    setEditingMemberId(null);
    setEditingName('');
    setEditingEmail('');
    setEditingRole('Operator');
    toast.success('Team member updated');
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success('Team member removed');
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
    toast.success('Data reset to demo defaults');
    setTimeout(() => window.location.reload(), 500);
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6 page-enter max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configure your workspace, business type, team, and workflow.
        </p>
      </div>

      {/* Workspace Settings */}
      <div className="tc-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Workspace</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Workspace Name</Label>
            <Input
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              placeholder="Enter your business name"
              className="bg-muted/50 border-border focus:border-primary/50 max-w-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Business Type</Label>
            <Select value={businessType} onValueChange={v => setBusinessType(v as BusinessType)}>
              <SelectTrigger className="bg-muted/50 border-border max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {businessType === 'Other' && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Custom Category</Label>
              <Input
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="e.g. Woodworking Tools, Handmade Jewelry"
                className="bg-muted/50 border-border focus:border-primary/50 max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                Define your custom business category. The system will adapt terminology accordingly.
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveWorkspace} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
            {saveSuccess && (
              <Button
                onClick={() => navigate('/app?newUser=true')}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Explore Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Customization */}
      {/* Email Template Customization */}
      <div className="tc-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Email Templates</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Customize the banking details email sent to customers during payment.
        </p>
        <Button
          onClick={() => setIsEmailTemplateOpen(true)}
          className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
        >
          <Mail className="w-4 h-4" />
          Customize Email Template
        </Button>
      </div>

      {/* AI Assistant Setup */}
      <div className="tc-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">AI Assistant</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Configure voice commands and custom instructions for your AI assistant.
        </p>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {state.workspace.aiConfig?.setupCompleted ? '✓ AI Configured' : 'Setup AI Assistant'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {state.workspace.aiConfig?.setupCompleted
                ? `Voice: ${state.workspace.aiConfig.voiceEnabled ? 'Enabled' : 'Disabled'} • Commands: ${state.workspace.aiConfig.selectedCommands.length}`
                : 'Get started with voice commands'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAIWizardOpen(true)}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <Mic className="w-4 h-4" />
          {state.workspace.aiConfig?.setupCompleted ? 'Update AI Setup' : 'Setup AI Assistant'}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="tc-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Danger Zone</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Enable or disable features based on your business model. For example, service-based businesses might not need Orders or Shipping.
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={enableInputs}
              onChange={e => setEnableInputs(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Raw Inputs</p>
              <p className="text-xs text-muted-foreground">Track suppliers and raw materials</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={enableProductionRuns}
              onChange={e => setEnableProductionRuns(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Production Runs</p>
              <p className="text-xs text-muted-foreground">Track production batches and schedules</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={enableOrders}
              onChange={e => setEnableOrders(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Orders</p>
              <p className="text-xs text-muted-foreground">Manage customer orders and fulfillment</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={enableShipping}
              onChange={e => setEnableShipping(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Shipping</p>
              <p className="text-xs text-muted-foreground">Track shipments and delivery</p>
            </div>
          </label>
        </div>
        <Button onClick={handleSaveWorkspace} className="bg-primary hover:bg-primary/90 mt-4">
          Save Workflow Settings
        </Button>
      </div>

      {/* Team Members */}
      <div className="tc-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Team Members</h2>
          </div>
          {!showAddMember && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddMember(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          )}
        </div>

        {/* Add New Member Form */}
        {showAddMember && (
          <div className="mb-5 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Name</Label>
                <Input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  placeholder="Team member name"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                <Input
                  value={editingEmail}
                  onChange={e => setEditingEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Role</Label>
              <Select value={editingRole} onValueChange={v => setEditingRole(v as any)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTeamMember}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Check className="w-4 h-4" />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddMember(false);
                  setEditingName('');
                  setEditingEmail('');
                  setEditingRole('Operator');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-3">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No team members added yet. Click "Add Member" to get started.
            </p>
          ) : (
            teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between py-3 px-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                {editingMemberId === member.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        placeholder="Name"
                        className="bg-background border-border text-sm"
                      />
                      <Input
                        value={editingEmail}
                        onChange={e => setEditingEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="bg-background border-border text-sm"
                      />
                    </div>
                    <Select value={editingRole} onValueChange={v => setEditingRole(v as any)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Operator">Operator</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveTeamMember}
                        className="bg-primary hover:bg-primary/90 gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMemberId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-violet-500/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{getAvatarInitials(member.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        member.role === 'Owner'
                          ? 'text-primary bg-primary/10 border-primary/20'
                          : member.role === 'Manager'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-muted-foreground bg-muted border-border'
                      }`}>
                        {member.role}
                      </span>
                      <button
                        onClick={() => handleEditTeamMember(member)}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="tc-card border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Danger Zone</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Reset all data to demo defaults. This action cannot be undone.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          Reset to Demo Data
        </Button>
      </div>

      {/* Email Template Customizer Modal */}
      <EmailTemplateCustomizer
        isOpen={isEmailTemplateOpen}
        onClose={() => setIsEmailTemplateOpen(false)}
        onSave={(template) => {
          // Save template to localStorage or state
          localStorage.setItem('emailTemplate', JSON.stringify(template));
          toast.success('Email template saved successfully');
        }}
      />

      {/* AI Setup Wizard Modal */}
      <AISetupWizard
        isOpen={isAIWizardOpen}
        onClose={() => setIsAIWizardOpen(false)}
        onComplete={(config) => {
          dispatch({
            type: 'UPDATE_AI_CONFIG',
            payload: {
              voiceEnabled: config.voiceEnabled,
              commandsEnabled: config.commandsEnabled,
              customPrompt: config.customPrompt,
              selectedCommands: config.selectedCommands,
              setupCompleted: true,
            },
          });
        }}
        businessType={businessType}
        businessName={workspaceName}
      />
    </div>
  );
}
