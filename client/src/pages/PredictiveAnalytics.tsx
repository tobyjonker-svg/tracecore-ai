import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, AlertTriangle } from "lucide-react";

interface Forecast {
  product: string;
  currentStock: number;
  predictedDemand: number;
  recommendedStock: number;
  confidence: number;
  trend: "up" | "down" | "stable";
}

interface Recommendation {
  id: string;
  type: "reorder" | "overstock" | "opportunity";
  product: string;
  message: string;
  priority: "high" | "medium" | "low";
  action?: string;
}

export function PredictiveAnalytics() {
  const [forecasts, setForecasts] = useState<Forecast[]>([
    {
      product: "Vitamin Capsules",
      currentStock: 250,
      predictedDemand: 180,
      recommendedStock: 300,
      confidence: 0.92,
      trend: "up",
    },
    {
      product: "Vitamin Powder",
      currentStock: 45,
      predictedDemand: 120,
      recommendedStock: 200,
      confidence: 0.88,
      trend: "up",
    },
    {
      product: "Mineral Complex",
      currentStock: 500,
      predictedDemand: 80,
      recommendedStock: 150,
      confidence: 0.85,
      trend: "down",
    },
    {
      product: "Omega-3 Supplement",
      currentStock: 150,
      predictedDemand: 150,
      recommendedStock: 180,
      confidence: 0.90,
      trend: "stable",
    },
  ]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "1",
      type: "reorder",
      product: "Vitamin Powder",
      message: "Stock critically low. Predicted demand is 120 units but only 45 in stock.",
      priority: "high",
      action: "Reorder 200 units immediately",
    },
    {
      id: "2",
      type: "overstock",
      product: "Mineral Complex",
      message: "Overstock detected. Current stock 500 units but predicted demand only 80.",
      priority: "medium",
      action: "Consider promotional pricing",
    },
    {
      id: "3",
      type: "opportunity",
      product: "Vitamin Capsules",
      message: "Demand trending up. Consider increasing production capacity.",
      priority: "medium",
      action: "Plan production increase",
    },
    {
      id: "4",
      type: "reorder",
      product: "Omega-3 Supplement",
      message: "Steady demand. Maintain current stock levels.",
      priority: "low",
      action: "No action needed",
    },
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "→";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      default:
        return "bg-green-500/10 text-green-700 border-green-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reorder":
        return "🔄";
      case "overstock":
        return "📦";
      default:
        return "💡";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          Predictive Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          ML-powered demand forecasting and inventory optimization
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Forecast Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                forecasts.reduce((sum, f) => sum + f.confidence, 0) /
                forecasts.length *
                100
              ).toFixed(0)}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {recommendations.filter((r) => r.priority === "high").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trending Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {forecasts.filter((f) => f.trend === "up").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trending Down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {forecasts.filter((f) => f.trend === "down").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demand Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecasts (Next 30 Days)</CardTitle>
          <CardDescription>
            ML-predicted demand based on historical data and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecasts.map((forecast) => (
              <div
                key={forecast.product}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{forecast.product}</h3>
                      <span className="text-lg">{getTrendIcon(forecast.trend)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(forecast.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
                    <p className="font-semibold">{forecast.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Predicted Demand</p>
                    <p className="font-semibold text-blue-500">
                      {forecast.predictedDemand} units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recommended Stock</p>
                    <p className="font-semibold text-green-500">
                      {forecast.recommendedStock} units
                    </p>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        forecast.currentStock < forecast.predictedDemand
                          ? "bg-red-500"
                          : forecast.currentStock > forecast.recommendedStock * 1.5
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (forecast.currentStock / forecast.recommendedStock) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered actions to optimize inventory and reduce costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-lg">{getTypeIcon(rec.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{rec.product}</h3>
                      <Badge variant="outline" className="text-xs">
                        {rec.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm">{rec.message}</p>
                  </div>
                </div>

                {rec.action && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/20">
                    <p className="text-xs font-medium">{rec.action}</p>
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>
            Accuracy metrics for demand forecasting model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Mean Absolute Error</p>
              <p className="text-2xl font-bold">8.3%</p>
              <p className="text-xs text-muted-foreground mt-1">Lower is better</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Forecast Accuracy</p>
              <p className="text-2xl font-bold">91.7%</p>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Model Last Updated</p>
              <p className="text-lg font-bold">Today</p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
