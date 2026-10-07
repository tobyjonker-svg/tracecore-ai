import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, RefreshCw, Trash2, Clock, CheckCircle, XCircle, Activity, Database, Cpu } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview"|"clients">("overview");
  const { data: stats, refetch: refetchStats } = trpc.admin.stats.useQuery();
  const { data: users, refetch: refetchUsers } = trpc.admin.users.useQuery();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => { toast.success("Client removed"); refetchUsers(); },
  });
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); refetchUsers(); },
  });

  const platformCards = [
    {
      label: "Total Clients",
      value: stats?.users || 0,
      sub: "registered accounts",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Workspaces",
      value: stats?.workspaces || 0,
      sub: "active workspaces",
      icon: Activity,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Claude API Usage",
      value: "~R" + ((Number(stats?.users || 1) * 0.86)).toFixed(2),
      sub: "estimated monthly AI cost",
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Platform Revenue",
      value: "R" + (Number(stats?.users || 0) * 299).toLocaleString(),
      sub: "estimated MRR at R299/user",
      icon: Database,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-red-400" />
            <h1 className="text-2xl font-bold">Platform Admin</h1>
          </div>
          <p className="text-muted-foreground text-sm">SaaS Node — TraceCore AI client management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchStats(); refetchUsers(); }}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["overview", "clients"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {tab === "clients" ? `Clients (${(users as any[])?.length || 0})` : "Overview"}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platformCards.map((c, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", c.bg)}>
                    <c.icon className={cn("w-4 h-4", c.color)} />
                  </div>
                  <p className="text-xl font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{c.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform health note */}
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                Platform Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Server</p>
                  <p className="font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />DigitalOcean Frankfurt
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">AI Provider</p>
                  <p className="font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />Anthropic Claude Haiku
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Courier Integration</p>
                  <p className="font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />Shiplogic (TCG)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Database</p>
                  <p className="font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />MySQL — tracecore_db
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">eCommerce Sync</p>
                  <p className="font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />WooCommerce API
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Payments</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-yellow-400" />Paystack (pending)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue projection */}
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold text-sm mb-3">Revenue Projection</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { clients: stats?.users || 0, label: "Current" },
                  { clients: 50, label: "At 50 clients" },
                  { clients: 100, label: "Founder's 100" },
                ].map((r, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                    <p className="text-lg font-bold">R{(r.clients * 299).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CLIENTS */}
      {activeTab === "clients" && (
        <div className="space-y-3">
          {!users || (users as any[]).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No clients yet. Share your landing page to get signups.</p>
              </CardContent>
            </Card>
          ) : (users as any[]).map((u: any) => {
            const isAdmin = u.role === 'admin';
            const joinedDate = u.createdAt ? new Date(u.createdAt) : null;
            const daysSinceJoin = joinedDate ? Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const trialDaysLeft = Math.max(0, 7 - daysSinceJoin);
            const isTrialActive = trialDaysLeft > 0;

            return (
              <Card key={u.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{u.name}</p>
                        {isAdmin && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">Admin</span>
                        )}
                        {!isAdmin && isTrialActive && u.subscriptionStatus !== 'active' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
                            Trial — {trialDaysLeft}d left
                          </span>
                        )}
                        {!isAdmin && !isTrialActive && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                        {u.workspaceName && <span>Workspace: <strong className="text-foreground">{u.workspaceName}</strong></span>}
                        {joinedDate && <span>Joined: <strong className="text-foreground">{joinedDate.toLocaleDateString("en-ZA")}</strong></span>}
                        <span>Plan: <strong className="text-foreground">{isAdmin ? "Admin" : u.subscriptionStatus === 'active' ? "Pro" : isTrialActive ? "Trial" : "Expired"}</strong></span>
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'admin' })}>
                          Make Admin
                        </Button>
                        <Button size="sm" variant="outline"
                          className="text-red-400 hover:text-red-300 hover:border-red-500/30"
                          onClick={() => { if (confirm(`Remove ${u.name} from the platform?`)) deleteUserMutation.mutate({ userId: u.id }); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
