import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, ExternalLink, RefreshCw } from "lucide-react";

function StatusBadge({ status }: { status: "idle" | "ok" | "error" | "testing" }) {
  if (status === "testing") return <span className="flex items-center gap-1 text-xs text-yellow-400"><Loader2 className="w-3 h-3 animate-spin" />Testing...</span>;
  if (status === "ok") return <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3 h-3" />Connected</span>;
  if (status === "error") return <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3 h-3" />Failed</span>;
  return null;
}

export default function Integrations() {
  const { data: saved, refetch } = trpc.integrations.get.useQuery();
  const saveMutation = trpc.integrations.save.useMutation({
    onSuccess: () => { toast.success("Integration settings saved"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const testWooMutation = trpc.integrations.testWooCommerce.useMutation();
  const testCourierMutation = trpc.integrations.testCourierGuy.useMutation();

  const [wooUrl, setWooUrl] = useState("");
  const [wooKey, setWooKey] = useState("");
  const [wooSecret, setWooSecret] = useState("");
  const [wooWebhook, setWooWebhook] = useState("");
  const [courierKey, setCourierKey] = useState("");
  const [wooStatus, setWooStatus] = useState<"idle"|"ok"|"error"|"testing">("idle");
  const [courierStatus, setCourierStatus] = useState<"idle"|"ok"|"error"|"testing">("idle");

  // Populate from saved
  useState(() => {
    if (saved) {
      setWooUrl(saved.storeUrl || "");
      setWooKey(saved.consumerKey || "");
      setWooSecret(saved.consumerSecret || "");
      setWooWebhook(saved.webhookSecret || "");
      setCourierKey(saved.courierGuyApiKey || "");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      storeUrl: wooUrl,
      consumerKey: wooKey,
      consumerSecret: wooSecret,
      webhookSecret: wooWebhook,
      courierGuyApiKey: courierKey,
    });
  };

  const handleTestWoo = async () => {
    setWooStatus("testing");
    const res = await testWooMutation.mutateAsync();
    setWooStatus(res.success ? "ok" : "error");
    toast[res.success ? "success" : "error"](res.message);
  };

  const handleTestCourier = async () => {
    setCourierStatus("testing");
    const res = await testCourierMutation.mutateAsync();
    setCourierStatus(res.success ? "ok" : "error");
    toast[res.success ? "success" : "error"](res.message);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">Connect your store and courier to automate your operations</p>
      </div>

      {/* WooCommerce */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">🛒 WooCommerce</CardTitle>
              <CardDescription>Sync orders from your WordPress/WooCommerce store automatically</CardDescription>
            </div>
            <StatusBadge status={wooStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Store URL</label>
            <Input value={wooUrl} onChange={e => setWooUrl(e.target.value)} placeholder="https://yourstore.co.za" />
            <p className="text-xs text-muted-foreground mt-1">Your WooCommerce store URL — no trailing slash</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Consumer Key</label>
              <Input value={wooKey} onChange={e => setWooKey(e.target.value)} placeholder="ck_..." />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Consumer Secret</label>
              <Input value={wooSecret} onChange={e => setWooSecret(e.target.value)} placeholder="cs_..." type="password" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Webhook Secret</label>
            <Input value={wooWebhook} onChange={e => setWooWebhook(e.target.value)} placeholder="your_webhook_secret" />
            <p className="text-xs text-muted-foreground mt-1">Used to verify incoming webhooks from WooCommerce</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">How to get WooCommerce API keys:</p>
            <p>1. In WordPress, go to <strong>WooCommerce → Settings → Advanced → REST API</strong></p>
            <p>2. Click <strong>Add Key</strong> → set permissions to <strong>Read/Write</strong></p>
            <p>3. Copy the Consumer Key and Consumer Secret</p>
            <p>4. For webhooks, go to <strong>WooCommerce → Settings → Advanced → Webhooks</strong></p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleTestWoo} disabled={testWooMutation.isPending}>
              <RefreshCw className={`w-3 h-3 mr-1 ${testWooMutation.isPending ? 'animate-spin' : ''}`} />Test Connection
            </Button>
            <a href="https://woocommerce.com/document/woocommerce-rest-api/" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost"><ExternalLink className="w-3 h-3 mr-1" />WooCommerce Docs</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Courier Guy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">🚚 The Courier Guy</CardTitle>
              <CardDescription>Auto-book waybills and get live shipping rates via Shiplogic API</CardDescription>
            </div>
            <StatusBadge status={courierStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Shiplogic API Key</label>
            <Input value={courierKey} onChange={e => setCourierKey(e.target.value)} placeholder="Your Shiplogic API key" type="password" />
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">How to get your Courier Guy API key:</p>
            <p>1. Log into <strong>thecourierguy.co.za</strong> with your business account</p>
            <p>2. Go to <strong>Integrations → API Keys</strong></p>
            <p>3. Click <strong>Create API Key</strong> and copy it here</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleTestCourier} disabled={testCourierMutation.isPending}>
              <RefreshCw className={`w-3 h-3 mr-1 ${testCourierMutation.isPending ? 'animate-spin' : ''}`} />Test Connection
            </Button>
            <a href="https://thecourierguy.co.za/business-courier-services/" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost"><ExternalLink className="w-3 h-3 mr-1" />Get API Key</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Claude AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🤖 Claude AI (Optional)</CardTitle>
          <CardDescription>TraceCore AI includes shared Claude AI access. Optionally use your own API key for unlimited queries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
            <p>Your plan includes <strong>20 AI queries/day</strong> (Pro) or <strong>unlimited</strong> (Pro+) using TraceCore's shared Claude integration. No setup needed.</p>
            <p className="mt-2">Want unlimited queries on the Pro plan? <a href="https://console.anthropic.com" target="_blank" className="text-primary underline">Get your own Anthropic API key</a> and contact support to add it to your workspace.</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full md:w-auto">
        {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Integration Settings"}
      </Button>
    </div>
  );
}
