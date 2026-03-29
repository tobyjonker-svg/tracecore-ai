import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Play, ChevronRight, Zap } from "lucide-react";

interface WorkflowStep {
  id: string;
  command: string;
  parameters: Record<string, string>;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  executions: number;
  lastRun?: Date;
}

export function CommandChaining() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "Daily Inventory Check",
      description: "Check low stock items and generate report",
      steps: [
        {
          id: "s1",
          command: "Check Inventory",
          parameters: { threshold: "50" },
        },
        {
          id: "s2",
          command: "Generate Report",
          parameters: { type: "inventory", format: "csv" },
        },
        {
          id: "s3",
          command: "Send Email",
          parameters: { recipient: "admin@example.com", subject: "Daily Inventory Report" },
        },
      ],
      enabled: true,
      executions: 45,
      lastRun: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      name: "Order Processing",
      description: "Create order, update inventory, and send confirmation",
      steps: [
        {
          id: "s1",
          command: "Create Order",
          parameters: { customer: "auto", product: "auto" },
        },
        {
          id: "s2",
          command: "Update Inventory",
          parameters: { action: "decrease" },
        },
        {
          id: "s3",
          command: "Send Confirmation",
          parameters: { type: "email" },
        },
      ],
      enabled: true,
      executions: 128,
      lastRun: new Date(Date.now() - 3600000),
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleAddStep = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              steps: [
                ...wf.steps,
                {
                  id: Date.now().toString(),
                  command: "",
                  parameters: {},
                },
              ],
            }
          : wf
      )
    );
  };

  const handleRemoveStep = (workflowId: string, stepId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              steps: wf.steps.filter((step) => step.id !== stepId),
            }
          : wf
      )
    );
  };

  const handleExecuteWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              executions: wf.executions + 1,
              lastRun: new Date(),
            }
          : wf
      )
    );
  };

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === workflowId
          ? { ...wf, enabled: !wf.enabled }
          : wf
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            Command Chaining
          </h1>
          <p className="text-muted-foreground mt-1">
            Create workflows that execute multiple commands in sequence
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreatingNew(true)}>
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {workflows.filter((wf) => wf.enabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.reduce((sum, wf) => sum + wf.executions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No workflows yet. Create one to automate your processes!
              </p>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{workflow.name}</h3>
                      <Badge variant={workflow.enabled ? "default" : "secondary"}>
                        {workflow.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workflow.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleWorkflow(workflow.id)}
                    >
                      {workflow.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                    >
                      <Play className="w-4 h-4" />
                      Execute
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Workflow Steps */}
                <div className="space-y-3 mb-4">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{step.command}</p>
                          {Object.keys(step.parameters).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(step.parameters).map(([key, value]) => (
                                <code key={key} className="text-xs bg-background px-1.5 py-0.5 rounded">
                                  {key}: {value}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveStep(workflow.id, step.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Step Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleAddStep(workflow.id)}
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </Button>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{workflow.executions} total executions</span>
                  {workflow.lastRun && (
                    <span>Last run: {workflow.lastRun.toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
          <CardDescription>
            Quick-start templates for common workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
            >
              <div>
                <div className="font-medium">End-of-Day Report</div>
                <div className="text-xs text-muted-foreground">
                  Generate sales, inventory, and production reports
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
            >
              <div>
                <div className="font-medium">Low Stock Alert</div>
                <div className="text-xs text-muted-foreground">
                  Check inventory and send notifications
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
            >
              <div>
                <div className="font-medium">Order Fulfillment</div>
                <div className="text-xs text-muted-foreground">
                  Create order, update inventory, send confirmation
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-3 text-left"
            >
              <div>
                <div className="font-medium">Production Cycle</div>
                <div className="text-xs text-muted-foreground">
                  Start run, track progress, update status
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
