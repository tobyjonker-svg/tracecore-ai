import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Mic, CheckCircle, AlertCircle } from "lucide-react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export function VoiceAnalytics() {
  const [dateRange, setDateRange] = useState("7d");

  // Mock data for analytics
  const commandUsageData = [
    { command: "Add Product", count: 45, success: 42 },
    { command: "Create Order", count: 38, success: 35 },
    { command: "Check Inventory", count: 52, success: 50 },
    { command: "Sales Report", count: 28, success: 28 },
    { command: "Update Status", count: 31, success: 29 },
  ];

  const dailyUsageData = [
    { date: "Mon", commands: 24, success: 22 },
    { date: "Tue", commands: 31, success: 29 },
    { date: "Wed", commands: 28, success: 26 },
    { date: "Thu", commands: 35, success: 33 },
    { date: "Fri", commands: 42, success: 40 },
    { date: "Sat", commands: 18, success: 16 },
    { date: "Sun", commands: 12, success: 11 },
  ];

  const successRateData = [
    { name: "Successful", value: 287 },
    { name: "Failed", value: 13 },
  ];

  const totalCommands = commandUsageData.reduce((sum, item) => sum + item.count, 0);
  const totalSuccessful = commandUsageData.reduce((sum, item) => sum + item.success, 0);
  const successRate = ((totalSuccessful / totalCommands) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          Voice Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track voice command usage and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommands}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalSuccessful}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {successRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totalCommands - totalSuccessful}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((100 - parseFloat(successRate))).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Daily
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalCommands / 7).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Commands per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Trend</CardTitle>
            <CardDescription>Commands executed over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="commands"
                  stroke="#3b82f6"
                  name="Total Commands"
                />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#10b981"
                  name="Successful"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
            <CardDescription>Command execution success vs failure</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={successRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {successRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Command Usage by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Command Usage by Type</CardTitle>
          <CardDescription>Most used voice commands</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commandUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="command" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Total" />
              <Bar dataKey="success" fill="#10b981" name="Successful" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Commands Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Commands</CardTitle>
          <CardDescription>Most frequently used commands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commandUsageData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium text-sm">{item.command}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.success}/{item.count} successful
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.count}</span>
                  <span className="text-xs text-muted-foreground">
                    {((item.success / item.count) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
