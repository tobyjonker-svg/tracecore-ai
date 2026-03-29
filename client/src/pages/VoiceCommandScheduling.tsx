import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, Trash2, Edit2, CheckCircle, AlertCircle } from "lucide-react";

export function VoiceCommandScheduling() {
  const [scheduledCommands, setScheduledCommands] = useState<Array<{
    id: string;
    command: string;
    schedule: string;
    frequency: string;
    nextRun: string;
    status: "active" | "paused";
  }>>([
    {
      id: "1",
      command: "Generate sales report",
      schedule: "Every Monday at 9:00 AM",
      frequency: "Weekly",
      nextRun: "2026-03-31 09:00",
      status: "active",
    },
    {
      id: "2",
      command: "Check low stock items",
      schedule: "Every day at 8:00 AM",
      frequency: "Daily",
      nextRun: "2026-03-30 08:00",
      status: "active",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    command: "",
    frequency: "daily",
    time: "09:00",
    dayOfWeek: "monday",
  });

  const handleAddSchedule = () => {
    if (formData.command) {
      const scheduleText =
        formData.frequency === "daily"
          ? `Every day at ${formData.time}`
          : `Every ${formData.dayOfWeek} at ${formData.time}`;

      const newSchedule = {
        id: Date.now().toString(),
        command: formData.command,
        schedule: scheduleText,
        frequency: formData.frequency === "daily" ? "Daily" : "Weekly",
        nextRun: new Date().toLocaleString(),
        status: "active" as const,
      };

      setScheduledCommands([...scheduledCommands, newSchedule]);
      setFormData({
        command: "",
        frequency: "daily",
        time: "09:00",
        dayOfWeek: "monday",
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduledCommands(scheduledCommands.filter((cmd) => cmd.id !== id));
  };

  const toggleStatus = (id: string) => {
    setScheduledCommands(
      scheduledCommands.map((cmd) =>
        cmd.id === id
          ? { ...cmd, status: cmd.status === "active" ? "paused" : "active" }
          : cmd
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8 text-primary" />
            Voice Command Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule voice commands to run automatically
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Command
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Voice Command</DialogTitle>
              <DialogDescription>
                Set up a voice command to run automatically
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Command</label>
                <Input
                  placeholder="e.g., Generate sales report"
                  value={formData.command}
                  onChange={(e) =>
                    setFormData({ ...formData, command: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-foreground"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              {formData.frequency === "weekly" && (
                <div>
                  <label className="text-sm font-medium">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfWeek: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-foreground"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              )}
              <Button onClick={handleAddSchedule} className="w-full">
                Schedule Command
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Commands List */}
      <div className="space-y-3">
        {scheduledCommands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No scheduled commands yet. Create one to automate your workflows!
              </p>
            </CardContent>
          </Card>
        ) : (
          scheduledCommands.map((cmd) => (
            <Card key={cmd.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{cmd.command}</h3>
                      {cmd.status === "active" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Schedule: {cmd.schedule}</p>
                      <p>Frequency: {cmd.frequency}</p>
                      <p>Next Run: {cmd.nextRun}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(cmd.id)}
                    >
                      {cmd.status === "active" ? "Pause" : "Resume"}
                    </Button>
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
                      onClick={() => handleDeleteSchedule(cmd.id)}
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

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>
            Last 5 scheduled command executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { command: "Generate sales report", time: "2026-03-29 09:00", status: "success" },
              { command: "Check low stock items", time: "2026-03-29 08:00", status: "success" },
              { command: "Generate sales report", time: "2026-03-28 09:00", status: "success" },
              { command: "Check low stock items", time: "2026-03-28 08:00", status: "success" },
              { command: "Generate sales report", time: "2026-03-27 09:00", status: "success" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{item.command}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
