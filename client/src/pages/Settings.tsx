/**
 * TraceCore AI — Settings Page
 * Design: Soft-Dark Enterprise
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BusinessType } from '@/lib/store';
import { Settings as SettingsIcon, Building2, Users, Bell, Shield, RefreshCw, ChevronRight } from 'lucide-react';
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
  'Other',
];

const TEAM_MEMBERS = [
  { name: 'Alex Chen', email: 'alex@mycoalchemy.com', role: 'Owner', avatar: 'AC' },
  { name: 'Sarah Kim', email: 'sarah@mycoalchemy.com', role: 'Manager', avatar: 'SK' },
  { name: 'Jordan Lee', email: 'jordan@mycoalchemy.com', role: 'Operator', avatar: 'JL' },
];

export default function Settings() {
  const { state, dispatch } = useApp();
  const [workspaceName, setWorkspaceName] = useState(state.workspace.name);
  const [businessType, setBusinessType] = useState<BusinessType>(state.workspace.businessType);
  const [customCategory, setCustomCategory] = useState(state.workspace.customCategory ?? '');
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSaveWorkspace = () => {
    toast.success('Workspace settings saved');
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
    toast.success('Data reset to demo defaults');
    setTimeout(() => window.location.reload(), 500);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="p-6 space-y-6 page-enter max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configure your workspace, business type, and team access.
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
          <Button onClick={handleSaveWorkspace} className="bg-primary hover:bg-primary/90">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Team Members */}
      <div className="tc-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Team Members</h2>
        </div>

        <div className="space-y-3 mb-5">
          {TEAM_MEMBERS.map(member => (
            <div key={member.email} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-violet-500/60 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{member.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                member.role === 'Owner'
                  ? 'text-primary bg-primary/10 border-primary/20'
                  : member.role === 'Manager'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-muted-foreground bg-muted border-border'
              }`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="bg-muted/50 border-border focus:border-primary/50 flex-1"
          />
          <Button type="submit" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
            Invite
          </Button>
        </form>
      </div>

      {/* Notifications */}
      <div className="tc-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Low stock alerts', description: 'Notify when product stock falls below threshold', enabled: true },
            { label: 'Order status updates', description: 'Notify on order status changes', enabled: true },
            { label: 'Production run completions', description: 'Notify when a production run is logged', enabled: false },
            { label: 'Weekly summary report', description: 'Receive weekly operations digest', enabled: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <button
                onClick={() => toast.info('Notification settings saved')}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  item.enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  item.enabled ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="tc-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-violet-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Integrations</h2>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Shopify', desc: 'Sync orders from your Shopify store', status: 'Available' },
            { name: 'QuickBooks', desc: 'Export financial data to QuickBooks', status: 'Coming Soon' },
            { name: 'Slack', desc: 'Receive alerts in your Slack workspace', status: 'Available' },
            { name: 'Xero', desc: 'Accounting integration', status: 'Coming Soon' },
          ].map(item => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  item.status === 'Available'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-muted-foreground bg-muted border-border'
                }`}>
                  {item.status}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="tc-card border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Reset Demo Data</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Reset all data back to the original demo state. This will clear any changes you've made during this session.
        </p>
        <Button
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          onClick={handleReset}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Demo Defaults
        </Button>
      </div>
    </div>
  );
}
