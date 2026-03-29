import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Star, Download } from "lucide-react";

interface CommandTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  command: string;
  parameters: string[];
  example: string;
  useCount: number;
  rating: number;
}

export function CommandTemplates() {
  const [templates, setTemplates] = useState<CommandTemplate[]>([
    {
      id: "1",
      name: "Create Order",
      category: "Orders",
      description: "Create a new customer order with products and quantity",
      command: "create order for {customer} with {quantity} units of {product}",
      parameters: ["customer", "quantity", "product"],
      example: "create order for John Smith with 100 units of Vitamin Capsules",
      useCount: 245,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Check Stock Level",
      category: "Inventory",
      description: "Check current stock level for a specific product",
      command: "check stock level for {product}",
      parameters: ["product"],
      example: "check stock level for Vitamin Powder",
      useCount: 189,
      rating: 4.9,
    },
    {
      id: "3",
      name: "Start Production Run",
      category: "Production",
      description: "Start a new production run for a product",
      command: "start production run for {product} with {quantity} units",
      parameters: ["product", "quantity"],
      example: "start production run for Vitamin Capsules with 500 units",
      useCount: 156,
      rating: 4.7,
    },
    {
      id: "4",
      name: "Generate Sales Report",
      category: "Reports",
      description: "Generate sales report for a specific date range",
      command: "generate sales report from {startDate} to {endDate}",
      parameters: ["startDate", "endDate"],
      example: "generate sales report from 2026-03-01 to 2026-03-29",
      useCount: 203,
      rating: 4.6,
    },
    {
      id: "5",
      name: "Update Order Status",
      category: "Orders",
      description: "Update the status of an existing order",
      command: "update order {orderId} status to {status}",
      parameters: ["orderId", "status"],
      example: "update order ORD-001 status to shipped",
      useCount: 178,
      rating: 4.8,
    },
    {
      id: "6",
      name: "List Low Stock Items",
      category: "Inventory",
      description: "Get a list of products with low stock levels",
      command: "list products with stock below {threshold} units",
      parameters: ["threshold"],
      example: "list products with stock below 50 units",
      useCount: 167,
      rating: 4.9,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Download className="w-8 h-8 text-primary" />
          Command Templates Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Pre-built voice command templates for common workflows
        </p>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>
              <CardDescription className="mt-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {/* Command Template */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Command Template
                </label>
                <div className="mt-1 p-2 rounded bg-muted/50 border border-border">
                  <code className="text-xs text-foreground break-words">
                    {template.command}
                  </code>
                </div>
              </div>

              {/* Parameters */}
              {template.parameters.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Parameters
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {template.parameters.map((param) => (
                      <Badge key={param} variant="outline" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Example */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Example
                </label>
                <div className="mt-1 p-2 rounded bg-accent/20 border border-accent">
                  <p className="text-xs text-foreground italic">
                    "{template.example}"
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>{template.useCount} uses</span>
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleCopyCommand(template.command)}
              >
                <Copy className="w-4 h-4" />
                Copy Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No templates found for this category
            </p>
          </CardContent>
        </Card>
      )}

      {/* Popular Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Templates</CardTitle>
          <CardDescription>
            Top templates by usage and rating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates
              .sort((a, b) => b.useCount - a.useCount)
              .slice(0, 3)
              .map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.command}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="text-right">
                      <p className="text-xs font-medium">
                        {template.useCount} uses
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs">{template.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
