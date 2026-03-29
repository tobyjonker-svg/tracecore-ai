import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, CheckCircle, Info, Zap } from "lucide-react";

interface Notification {
  id: string;
  type: "alert" | "success" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "Low Stock Alert",
      message: "Vitamin Powder stock below 50 units threshold",
      timestamp: new Date(Date.now() - 300000),
      read: false,
      actionUrl: "/app/inventory",
    },
    {
      id: "2",
      type: "warning",
      title: "Expiring Batch",
      message: "Batch VIT-2024-001 expires in 7 days",
      timestamp: new Date(Date.now() - 600000),
      read: false,
      actionUrl: "/app/batches",
    },
    {
      id: "3",
      type: "success",
      title: "Order Shipped",
      message: "Order ORD-001 has been shipped successfully",
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      actionUrl: "/app/orders",
    },
    {
      id: "4",
      type: "info",
      title: "Production Complete",
      message: "Production run PR-001 completed with 500 units",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      actionUrl: "/app/production",
    },
    {
      id: "5",
      type: "alert",
      title: "Late Delivery",
      message: "Supplier delivery from ABC Corp is 2 days late",
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      actionUrl: "/app/shipments",
    },
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "alert" | "success">("all");

  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "alert") return notif.type === "alert";
    if (filter === "success") return notif.type === "success";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-4 h-4" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <Zap className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "success":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-500/10 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8 text-primary" />
          Real-Time Notifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Live alerts for inventory, orders, production, and shipments
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              WebSocket: {isConnected ? "Active" : "Inactive"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => n.type === "alert").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {notifications.filter((n) => n.type === "success").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(["all", "unread", "alert", "success"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="w-full"
            >
              Mark All as Read
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No notifications</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={notif.read ? "opacity-75" : "border-primary/50"}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.timestamp.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {notif.actionUrl && (
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    )}
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(notif.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure which alerts you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-sm">Low Stock Alerts</p>
              <p className="text-xs text-muted-foreground">Notify when stock below threshold</p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-sm">Expiry Warnings</p>
              <p className="text-xs text-muted-foreground">Notify 7 days before expiry</p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-sm">Late Deliveries</p>
              <p className="text-xs text-muted-foreground">Notify when delivery is delayed</p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-sm">Order Updates</p>
              <p className="text-xs text-muted-foreground">Notify on order status changes</p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
