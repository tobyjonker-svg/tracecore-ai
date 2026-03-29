import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Sparkles } from "lucide-react";

export function CustomVoiceCommands() {
  const [customCommands, setCustomCommands] = useState<Array<{
    id: string;
    name: string;
    trigger: string;
    action: string;
    description: string;
  }>>([
    {
      id: "1",
      name: "Quick Inventory Check",
      trigger: "check my stock",
      action: "Check inventory for all products",
      description: "Shows current stock levels",
    },
    {
      id: "2",
      name: "Daily Sales Summary",
      trigger: "today sales",
      action: "Show sales report for today",
      description: "Displays today's revenue and orders",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trigger: "",
    action: "",
    description: "",
  });

  const handleAddCommand = () => {
    if (formData.name && formData.trigger && formData.action) {
      const newCommand = {
        id: Date.now().toString(),
        ...formData,
      };
      setCustomCommands([...customCommands, newCommand]);
      setFormData({ name: "", trigger: "", action: "", description: "" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteCommand = (id: string) => {
    setCustomCommands(customCommands.filter((cmd) => cmd.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Custom Voice Commands
          </h1>
          <p className="text-muted-foreground mt-1">
            Create custom voice commands for your workflows
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Command
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Voice Command</DialogTitle>
              <DialogDescription>
                Define a custom voice command that will trigger an action
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Command Name</label>
                <Input
                  placeholder="e.g., Quick Inventory Check"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Voice Trigger</label>
                <Input
                  placeholder="e.g., check my stock"
                  value={formData.trigger}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Action</label>
                <Input
                  placeholder="e.g., Check inventory for all products"
                  value={formData.action}
                  onChange={(e) =>
                    setFormData({ ...formData, action: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="What does this command do?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddCommand} className="w-full">
                Create Command
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Custom Commands List */}
      <div className="space-y-3">
        {customCommands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No custom commands yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          customCommands.map((cmd) => (
            <Card key={cmd.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{cmd.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Voice Trigger:
                        </span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          "{cmd.trigger}"
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Action:
                        </span>
                        <span className="text-sm">{cmd.action}</span>
                      </div>
                      {cmd.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {cmd.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCommand(cmd.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Command Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Command Templates</CardTitle>
          <CardDescription>
            Quick templates to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
              onClick={() => {
                setFormData({
                  name: "Weekly Report",
                  trigger: "weekly report",
                  action: "Generate weekly sales and inventory report",
                  description: "Automated weekly business summary",
                });
                setIsDialogOpen(true);
              }}
            >
              <div>
                <div className="font-medium">Weekly Report</div>
                <div className="text-xs text-muted-foreground">
                  "weekly report"
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
              onClick={() => {
                setFormData({
                  name: "Low Stock Alert",
                  trigger: "low stock items",
                  action: "Show products below minimum stock level",
                  description: "Quick view of items needing reorder",
                });
                setIsDialogOpen(true);
              }}
            >
              <div>
                <div className="font-medium">Low Stock Alert</div>
                <div className="text-xs text-muted-foreground">
                  "low stock items"
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
              onClick={() => {
                setFormData({
                  name: "Pending Orders",
                  trigger: "pending orders",
                  action: "Show all orders waiting for processing",
                  description: "View orders in pending status",
                });
                setIsDialogOpen(true);
              }}
            >
              <div>
                <div className="font-medium">Pending Orders</div>
                <div className="text-xs text-muted-foreground">
                  "pending orders"
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
              onClick={() => {
                setFormData({
                  name: "Production Status",
                  trigger: "production status",
                  action: "Show current production runs and status",
                  description: "Monitor active production",
                });
                setIsDialogOpen(true);
              }}
            >
              <div>
                <div className="font-medium">Production Status</div>
                <div className="text-xs text-muted-foreground">
                  "production status"
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
