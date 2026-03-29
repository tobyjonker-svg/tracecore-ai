import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Settings, Smartphone } from "lucide-react";

interface VoiceSession {
  id: string;
  device: string;
  status: "listening" | "processing" | "idle";
  lastCommand?: string;
  commandCount: number;
  wakeWordEnabled: boolean;
}

export function MobileVoiceInterface() {
  const [sessions, setSessions] = useState<VoiceSession[]>([
    {
      id: "1",
      device: "iPhone 14 Pro",
      status: "idle",
      lastCommand: "Check inventory for Vitamin Powder",
      commandCount: 23,
      wakeWordEnabled: true,
    },
    {
      id: "2",
      device: "Samsung Galaxy S23",
      status: "listening",
      commandCount: 15,
      wakeWordEnabled: true,
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);

  const handleStartListening = () => {
    setIsListening(true);
    setRecognizedText("Listening...");
    setTimeout(() => {
      setRecognizedText("Create order for John Smith with 100 units of Vitamin Capsules");
      setIsListening(false);
    }, 3000);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listening":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "processing":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "idle":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="w-8 h-8 text-primary" />
          Mobile Voice Interface
        </h1>
        <p className="text-muted-foreground mt-1">
          Hands-free voice command control on mobile devices
        </p>
      </div>

      {/* Voice Command Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Command Interface</CardTitle>
          <CardDescription>
            Tap to start listening or use wake word
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Large Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Recognized Text */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Recognized Command</p>
            <p className="text-lg font-medium">
              {recognizedText || "Tap microphone to start listening"}
            </p>
          </div>

          {/* Wake Word Settings */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium text-sm">Wake Word Detection</p>
              <p className="text-xs text-muted-foreground">
                Say "Hey TraceCore" to activate
              </p>
            </div>
            <Button
              variant={wakeWordEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
            >
              {wakeWordEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Quick Commands */}
          <div>
            <p className="text-sm font-medium mb-3">Quick Commands</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-xs">
                Check Inventory
              </Button>
              <Button variant="outline" className="text-xs">
                Create Order
              </Button>
              <Button variant="outline" className="text-xs">
                Start Production
              </Button>
              <Button variant="outline" className="text-xs">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>
            Mobile devices with voice interface enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="w-4 h-4" />
                      <p className="font-medium text-sm">{session.device}</p>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    {session.lastCommand && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last: "{session.lastCommand}"
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{session.commandCount} commands executed</span>
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>
                      {session.wakeWordEnabled ? "Wake word enabled" : "Wake word disabled"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm">Language</p>
                <p className="text-xs text-muted-foreground">English (US)</p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm">Voice Speed</p>
                <p className="text-xs text-muted-foreground">Normal</p>
              </div>
              <Button variant="outline" size="sm">
                Adjust
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm">Feedback Sounds</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
              <Button variant="outline" size="sm">
                Toggle
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm">Offline Mode</p>
                <p className="text-xs text-muted-foreground">Disabled</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Command History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Voice Commands</CardTitle>
          <CardDescription>
            Last 10 voice commands executed on mobile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "Create order for John Smith with 100 units",
              "Check inventory for Vitamin Powder",
              "Generate sales report",
              "Update order status to shipped",
              "List low stock items",
            ].map((command, index) => (
              <div
                key={index}
                className="p-2 rounded text-sm text-muted-foreground border border-border hover:bg-muted/50 transition-colors"
              >
                {command}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
