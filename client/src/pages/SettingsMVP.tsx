import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Lock, Bell, Crown, Check, ArrowLeft, Users, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { trpc } from '@/lib/trpc';

export function SettingsMVP() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [teamMembers, setTeamMembers] = useState<{id: string; name: string; email: string; role: string}[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Partner');
  const [workspaceName, setWorkspaceName] = useState('TraceCore AI');
  const [userRole, setUserRole] = useState('admin');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Fetch user's profile picture
  const { data: profileData } = trpc.profile.getProfilePicture.useQuery();

  const handleSaveWorkspace = () => {
    toast.success('Workspace settings saved');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleProfilePictureUpload = (url: string) => {
    setProfilePictureUrl(url);
    toast.success('Profile picture updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage workspace and user preferences</p>
        </div>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>Upload and manage your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload
            currentImageUrl={profileData?.profilePictureUrl || profilePictureUrl}
            onUploadComplete={handleProfilePictureUpload}
          />
        </CardContent>
      </Card>

      {/* Workspace Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Workspace Settings
          </CardTitle>
          <CardDescription>Configure your workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Workspace Name</label>
            <Input
              placeholder="TraceCore AI"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Workspace ID</label>
            <Input
              placeholder="ws_123456"
              disabled
              className="mt-1 bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">Auto-generated workspace identifier</p>
          </div>
          <div>
            <label className="text-sm font-medium">Owner Email</label>
            <Input
              placeholder={user?.email || 'user@example.com'}
              disabled
              className="mt-1 bg-muted"
            />
          </div>
          <Button onClick={handleSaveWorkspace}>Save Workspace Settings</Button>
        </CardContent>
      </Card>

      {/* User Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            User Roles
          </CardTitle>
          <CardDescription>Manage user access levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your Role</label>
            <Select value={userRole} onValueChange={setUserRole}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="manager">Manager (Edit Access)</SelectItem>
                <SelectItem value="staff">Staff (View Only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Admin: Full access to all features | Manager: Can create/edit data | Staff: View only
            </p>
          </div>
          <Button onClick={handleSaveWorkspace}>Save Role Settings</Button>
        </CardContent>
      </Card>

      {/* Subscription & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Pro+ (Premium)</p>
              <p className="text-sm text-muted-foreground">✓ Active</p>
            </div>
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            You have access to all Pro+ features including advanced analytics, custom integrations, and priority support.
          </p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Email Notifications</label>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Alert Notifications</label>
            <input
              type="checkbox"
              checked={alertNotifications}
              onChange={(e) => setAlertNotifications(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <Button onClick={handleSaveNotifications}>Save Notification Preferences</Button>
        </CardContent>
      </Card>
      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Team Members</CardTitle>
              <CardDescription>Invite team members and set their access level</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddMember(!showAddMember)}>
              <Plus className="w-4 h-4 mr-1" />Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddMember && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Name</label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Smith" /></div>
                <div><label className="text-sm font-medium">Email</label><Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@company.com" /></div>
              </div>
              <div><label className="text-sm font-medium">Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                    <SelectItem value="Manager">Manager (Edit)</SelectItem>
                    <SelectItem value="Operator">Operator (Limited Edit)</SelectItem>
                    <SelectItem value="Partner">Partner (View Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {
                  if (!newName || !newEmail) { toast.error('Fill in name and email'); return; }
                  setTeamMembers([...teamMembers, { id: Date.now().toString(), name: newName, email: newEmail, role: newRole }]);
                  setNewName(''); setNewEmail(''); setNewRole('Partner'); setShowAddMember(false);
                  toast.success('Team member added');
                }}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {teamMembers.length === 0 && !showAddMember && (
            <p className="text-sm text-muted-foreground text-center py-4">No team members yet. Click "Add Member" to invite someone.</p>
          )}
          {teamMembers.map(m => (
            <div key={m.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div>
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{m.role}</span>
                <Button variant="ghost" size="icon" onClick={() => setTeamMembers(teamMembers.filter(t => t.id !== m.id))}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
