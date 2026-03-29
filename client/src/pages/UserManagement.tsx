/**
 * TraceCore AI — User Management
 * Design: Soft-Dark Enterprise
 * - Team member management (invite, edit, delete)
 * - Role-based access control (Admin, Manager, Staff)
 * - Permission levels for different features
 * - User activity audit log
 */

import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type UserRole = 'admin' | 'manager' | 'staff';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: UserRole[];
}

const PERMISSIONS: Permission[] = [
  {
    id: 'view_dashboard',
    name: 'View Dashboard',
    description: 'Access the main dashboard and analytics',
    roles: ['admin', 'manager', 'staff'],
  },
  {
    id: 'manage_products',
    name: 'Manage Products',
    description: 'Create, edit, and delete products',
    roles: ['admin', 'manager'],
  },
  {
    id: 'manage_orders',
    name: 'Manage Orders',
    description: 'Create, edit, and delete orders',
    roles: ['admin', 'manager'],
  },
  {
    id: 'manage_production',
    name: 'Manage Production',
    description: 'Create and manage production runs',
    roles: ['admin', 'manager'],
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Invite, edit, and remove team members',
    roles: ['admin'],
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Access reports and analytics',
    roles: ['admin', 'manager'],
  },
  {
    id: 'manage_settings',
    name: 'Manage Settings',
    description: 'Configure workspace settings',
    roles: ['admin'],
  },
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    email: 'admin@tracecoreai.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2026-03-29T10:30:00Z',
  },
  {
    id: '2',
    email: 'manager@tracecoreai.com',
    name: 'John Manager',
    role: 'manager',
    status: 'active',
    joinedAt: '2024-02-20',
    lastActive: '2026-03-29T09:15:00Z',
  },
  {
    id: '3',
    email: 'staff@tracecoreai.com',
    name: 'Jane Staff',
    role: 'staff',
    status: 'active',
    joinedAt: '2024-03-10',
    lastActive: '2026-03-28T16:45:00Z',
  },
];

export function UserManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('staff');
  const [copied, setCopied] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) return;

    const newMember: TeamMember = {
      id: Math.random().toString(),
      email: inviteEmail,
      name: inviteName,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: '',
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('staff');
    setIsInviteOpen(false);
  };

  const handleUpdateRole = (memberId: string, newRole: UserRole) => {
    setTeamMembers(
      teamMembers.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      )
    );
    setIsEditOpen(false);
  };

  const handleRemove = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'manager':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'staff':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'inactive':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and permissions
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  placeholder="John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInvite} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          <CardDescription>
            Manage your workspace team and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${getRoleColor(member.role)} border`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                  <Badge className={`${getStatusColor(member.status)} border`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Dialog open={isEditOpen && selectedMember?.id === member.id} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Team Member</DialogTitle>
                        <DialogDescription>
                          Update {member.name}'s role and permissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground">Role</label>
                          <Select
                            value={member.role}
                            onValueChange={(newRole: any) => handleUpdateRole(member.id, newRole)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission Matrix
          </CardTitle>
          <CardDescription>
            Role-based access control for different features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Permission</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Admin</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Manager</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Staff</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{perm.name}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {perm.roles.includes('admin') && (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {perm.roles.includes('manager') && (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {perm.roles.includes('staff') && (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
