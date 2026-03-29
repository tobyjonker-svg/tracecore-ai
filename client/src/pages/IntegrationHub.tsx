import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ShoppingCart, Calculator, Workflow, CheckCircle, AlertCircle } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  dataCount?: number;
}

interface IntegrationDetail {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  status: "connected" | "disconnected" | "error";
  config?: {
    apiKey?: string;
    storeUrl?: string;
    syncFrequency?: string;
  };
}

export function IntegrationHub() {
  const [integrations, setIntegrations] = useState<IntegrationDetail[]>([
    {
      id: "woocommerce",
      name: "WooCommerce",
      icon: <ShoppingCart className="w-6 h-6" />,
      description: "Sync orders, products, and customers from your WooCommerce store",
      features: [
        "Auto-sync orders every 15 minutes",
        "Product inventory sync",
        "Customer data import",
        "Order status updates",
      ],
      status: "connected",
      config: {
        storeUrl: "https://mystore.com",
        syncFrequency: "Every 15 minutes",
      },
    },
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      icon: <Calculator className="w-6 h-6" />,
      description: "Sync financial data, invoices, and expenses",
      features: [
        "Invoice creation",
        "Expense tracking",
        "Financial reporting",
        "Tax calculation",
      ],
      status: "disconnected",
    },
    {
      id: "zapier",
      name: "Zapier",
      icon: <Zap className="w-6 h-6" />,
      description: "Connect to 5000+ apps and automate workflows",
      features: [
        "Custom automation rules",
        "Multi-app workflows",
        "Conditional logic",
        "Scheduled actions",
      ],
      status: "connected",
      config: {
        syncFrequency: "Real-time",
      },
    },
    {
      id: "email",
      name: "Email Service (SendGrid)",
      icon: <Workflow className="w-6 h-6" />,
      description: "Send automated emails for orders, alerts, and reports",
      features: [
        "Order confirmation emails",
        "Alert notifications",
        "Scheduled reports",
        "Custom templates",
      ],
      status: "connected",
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, status: "connected" } : int
      )
    );
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, status: "disconnected" } : int
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "error":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          Integration Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect TraceCore AI with your favorite business tools
        </p>
      </div>

      {/* Available Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className={`cursor-pointer transition-all ${
              selectedIntegration === integration.id
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedIntegration(integration.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(integration.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(integration.status)}
                    {integration.status}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {integration.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Integration Details */}
      {selectedIntegration && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>
              {integrations.find((i) => i.id === selectedIntegration)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuration */}
            {integrations.find((i) => i.id === selectedIntegration)?.config && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Configuration</h3>
                {integrations
                  .find((i) => i.id === selectedIntegration)
                  ?.config && (
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                    {Object.entries(
                      integrations.find((i) => i.id === selectedIntegration)
                        ?.config || {}
                    ).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              {integrations.find((i) => i.id === selectedIntegration)?.status ===
              "connected" ? (
                <>
                  <Button variant="outline" size="sm">
                    Reconfigure
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(selectedIntegration)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleConnect(selectedIntegration)}
                >
                  Connect Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-2xl font-bold text-green-500">
                {integrations.filter((i) => i.status === "connected").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Connected</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-2xl font-bold text-gray-500">
                {integrations.filter((i) => i.status === "disconnected").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Disconnected</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-2xl font-bold text-red-500">
                {integrations.filter((i) => i.status === "error").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Errors</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-2xl font-bold">
                {(
                  (integrations.filter((i) => i.status === "connected").length /
                    integrations.length) *
                  100
                ).toFixed(0)}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">Connected Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>More integrations launching soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Shopify", icon: "🛍️" },
              { name: "Stripe", icon: "💳" },
              { name: "Google Sheets", icon: "📊" },
            ].map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-lg border border-dashed border-border text-center opacity-50"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-medium mt-2">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
