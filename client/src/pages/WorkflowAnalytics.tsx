/**
 * Workflow Analytics Dashboard
 * Admin page to track template usage and customization patterns
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'];

export default function WorkflowAnalytics() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = trpc.workflow.getAnalytics.useQuery(
    { limit: 1000 },
    { enabled: user?.role === 'admin' }
  );

  const { data: summaryData, isLoading: isLoadingSummary } = trpc.workflow.getAnalyticsSummary.useQuery(
    undefined,
    { enabled: user?.role === 'admin' }
  );

  // Prepare chart data
  const templateStats = summaryData?.reduce((acc: any[], item: any) => {
    if (item.template) {
      acc.push({
        name: item.template,
        count: Number(item.count) || 0,
        avgCustomizations: Number(item.avgCustomizations) || 0,
        avgStages: Number(item.avgStages) || 0,
      });
    }
    return acc;
  }, []) || [];

  // Calculate metrics
  const totalEvents = analyticsData?.length || 0;
  const totalTemplates = templateStats.length;
  const avgCustomizations = templateStats.length > 0
    ? (templateStats.reduce((sum, t) => sum + t.avgCustomizations, 0) / templateStats.length).toFixed(2)
    : 0;
  const avgStages = templateStats.length > 0
    ? (templateStats.reduce((sum, t) => sum + t.avgStages, 0) / templateStats.length).toFixed(2)
    : 0;

  // Export analytics as CSV
  const handleExport = () => {
    if (!analyticsData || analyticsData.length === 0) return;

    setIsExporting(true);
    try {
      const headers = ['Date', 'Template', 'Customizations', 'Stages', 'Source'];
      const rows = analyticsData.map((event: any) => [
        new Date(event.createdAt).toLocaleString(),
        event.templateUsed || 'Unknown',
        event.customizationCount || 0,
        event.stagesCount || 0,
        event.source || 'unknown',
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setIsExporting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflow Analytics</h1>
          <p className="text-muted-foreground mt-1">Track template usage and customization patterns</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAnalytics()}
            disabled={isLoadingAnalytics}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={!analyticsData || analyticsData.length === 0 || isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">workflow selections tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Templates Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTemplates}</div>
            <p className="text-xs text-muted-foreground mt-1">different templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Customizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgCustomizations}</div>
            <p className="text-xs text-muted-foreground mt-1">per workflow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgStages}</div>
            <p className="text-xs text-muted-foreground mt-1">per workflow</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Template Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Template Usage</CardTitle>
            <CardDescription>Number of times each template was selected</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : templateStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={templateStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Template Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Template Distribution</CardTitle>
            <CardDescription>Percentage of each template used</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : templateStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={templateStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {templateStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customization Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Template Customization Stats</CardTitle>
          <CardDescription>Average customizations and stages per template</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : templateStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-foreground">Template</th>
                    <th className="text-right py-2 px-4 font-semibold text-foreground">Usage Count</th>
                    <th className="text-right py-2 px-4 font-semibold text-foreground">Avg Customizations</th>
                    <th className="text-right py-2 px-4 font-semibold text-foreground">Avg Stages</th>
                  </tr>
                </thead>
                <tbody>
                  {templateStats.map((stat: any, idx: number) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4 text-foreground">{stat.name}</td>
                      <td className="text-right py-2 px-4 text-muted-foreground">{stat.count}</td>
                      <td className="text-right py-2 px-4 text-muted-foreground">{stat.avgCustomizations.toFixed(2)}</td>
                      <td className="text-right py-2 px-4 text-muted-foreground">{stat.avgStages.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest workflow selections and customizations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : analyticsData && analyticsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-foreground">Date</th>
                    <th className="text-left py-2 px-4 font-semibold text-foreground">Template</th>
                    <th className="text-right py-2 px-4 font-semibold text-foreground">Customizations</th>
                    <th className="text-right py-2 px-4 font-semibold text-foreground">Stages</th>
                    <th className="text-left py-2 px-4 font-semibold text-foreground">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.slice(0, 20).map((event: any, idx: number) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-4 text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-foreground">{event.templateUsed || 'Unknown'}</td>
                      <td className="text-right py-2 px-4 text-muted-foreground">{event.customizationCount || 0}</td>
                      <td className="text-right py-2 px-4 text-muted-foreground">{event.stagesCount || 0}</td>
                      <td className="py-2 px-4 text-muted-foreground">{event.source || 'unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground">No events recorded yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
