import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Lock, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsMVP() {
  const { user } = useAuth();
  const [workspaceName, setWorkspaceName] = useState('TraceCore AI');
  const [userRole, setUserRole] = useState('admin');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertNotifications, setAlertNotifications] = useState(true);

  const handleSaveWorkspace = () => {
    toast.success('Workspace settings saved');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage workspace and user preferences</p>
      </div>

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
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts via email</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">In-App Alerts</p>
              <p className="text-sm text-muted-foreground">Show notifications in app</p>
            </div>
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

      {/* Workspace Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Workspace Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Workspace Created:</span>
            <span>March 29, 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subscription Plan:</span>
            <span>Professional</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Users:</span>
            <span>1 active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
