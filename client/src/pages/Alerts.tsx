import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertCircle, Bell, CheckCircle2, Trash2, Filter } from "lucide-react";
import { formatDateTime } from "@/lib/store";

export function Alerts() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Fetch all alerts
  const { data: alerts = [], isLoading, refetch } = trpc.alerts.list.useQuery({
    type: selectedType as any,
    severity: selectedSeverity as any,
  });

  // Fetch unread count
  const { data: unreadAlerts = [] } = trpc.alerts.getUnread.useQuery();

  // Mark as read mutation
  const markAsReadMutation = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Mark all as read mutation
  const markAllAsReadMutation = trpc.alerts.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Delete mutation
  const deleteMutation = trpc.alerts.delete.useMutation({
    onSuccess: () => refetch(),
  });

  // Filter alerts by search text
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert: any) =>
      alert.message.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [alerts, searchText]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "info":
      default:
        return "bg-blue-500/10 text-blue-700 border-blue-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return "📦";
      case "expiring_batch":
        return "⏰";
      case "late_delivery":
        return "🚚";
      case "quality_issue":
        return "⚠️";
      case "system":
        return "⚙️";
      default:
        return "📢";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Alerts & Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadAlerts.length} unread alert{unreadAlerts.length !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadAlerts.length > 0 && (
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            variant="outline"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search alerts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Alert Type</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  size="sm"
                  variant={selectedType === null ? "default" : "outline"}
                  onClick={() => setSelectedType(null)}
                >
                  All
                </Button>
                {["low_stock", "expiring_batch", "late_delivery", "quality_issue", "system"].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                  >
                    {type.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Severity</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  size="sm"
                  variant={selectedSeverity === null ? "default" : "outline"}
                  onClick={() => setSelectedSeverity(null)}
                >
                  All
                </Button>
                {["info", "warning", "critical"].map((severity) => (
                  <Button
                    key={severity}
                    size="sm"
                    variant={selectedSeverity === severity ? "default" : "outline"}
                    onClick={() => setSelectedSeverity(severity)}
                  >
                    {severity}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading alerts...
            </CardContent>
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No alerts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert: any) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.isRead === 0
                  ? "border-l-blue-500 bg-blue-50/30"
                  : "border-l-gray-300"
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="text-2xl mt-1">{getTypeIcon(alert.type)}</div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.message}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.isRead === 0 && (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.type.replace(/_/g, " ")} • {formatDateTime(alert.createdAt.toString())}
                      </p>
                      {alert.actionUrl && (
                        <a
                          href={alert.actionUrl}
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {alert.isRead === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate({ id: alert.id })}
                        disabled={markAsReadMutation.isPending}
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate({ id: alert.id })}
                      disabled={deleteMutation.isPending}
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{filteredAlerts.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredAlerts.filter((a: any) => a.isRead === 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAlerts.filter((a: any) => a.severity === "critical").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredAlerts.filter((a: any) => a.severity === "warning").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Info</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredAlerts.filter((a: any) => a.severity === "info").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
