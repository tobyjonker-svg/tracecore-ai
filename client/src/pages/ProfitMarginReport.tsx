/**
 * Profit Margin Report Dashboard
 * Comprehensive view of inventory valuation, profit potential, and margin analysis
 */

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, Download, RefreshCw, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfitMarginReport() {
  const { data: valuation, isLoading, refetch } = trpc.products.getValuation.useQuery();

  const handleExportCSV = () => {
    if (!valuation?.products || valuation.products.length === 0) {
      toast.error('No products to export');
      return;
    }

    const headers = [
      'Product Name',
      'SKU',
      'Cost Per Unit',
      'Selling Price',
      'Profit Per Unit',
      'Margin %',
      'Current Stock',
      'Total Cost Value',
      'Total Selling Value',
      'Total Profit Potential',
    ];

    const rows = valuation.products.map((p: any) => [
      p.name,
      p.sku || '',
      p.costPerUnit.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.profitPerUnit.toFixed(2),
      p.profitMarginPercent,
      p.currentStock,
      p.totalCostValue.toFixed(2),
      p.totalSellingValue.toFixed(2),
      (p.totalSellingValue - p.totalCostValue).toFixed(2),
    ]);

    // Add summary row
    rows.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      valuation.summary.overallMarginPercent + '%',
      '',
      valuation.summary.totalCostValue.toFixed(2),
      valuation.summary.totalSellingValue.toFixed(2),
      valuation.summary.totalProfitPotential.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(cell => (typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell))
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `profit-margin-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Report exported successfully');
  };

  const summary = valuation?.summary;
  const products = valuation?.products || [];

  // Sort products by profit margin (highest first)
  const sortedProducts = [...products].sort((a: any, b: any) => {
    const marginA = parseFloat(a.profitMarginPercent);
    const marginB = parseFloat(b.profitMarginPercent);
    return marginB - marginA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Profit Margin Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analysis of inventory valuation and profit potential
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            disabled={!products || products.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Cost Value */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">Total Cost Value</p>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              R{summary.totalCostValue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Investment in current inventory
            </p>
          </div>

          {/* Total Selling Value */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">Total Selling Value</p>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              R{summary.totalSellingValue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Revenue if all inventory sold
            </p>
          </div>

          {/* Profit Potential */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">Profit Potential</p>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">
              R{summary.totalProfitPotential.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Gross profit if all sold
            </p>
          </div>

          {/* Overall Margin */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">Overall Margin</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {summary.overallMarginPercent}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Average profit margin across all products
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {summary && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Product Count</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {summary.productCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Margin</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {summary.overallMarginPercent}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit Ratio</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {summary.totalSellingValue > 0
                  ? (
                      (summary.totalProfitPotential / summary.totalSellingValue) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sorted by profit margin (highest first)
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading report...
          </div>
        ) : !products || products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No products to report</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add products to see profit margin analysis
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Cost/Unit</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Profit/Unit</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Total Selling</TableHead>
                <TableHead className="text-right">Total Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product: any, index: number) => (
                <TableRow
                  key={product.id}
                  className={index % 2 === 0 ? 'bg-muted/30' : ''}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">
                      R{product.profitPerUnit.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">
                      {product.profitMarginPercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.currentStock} {product.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.totalCostValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.totalSellingValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">
                      R{(product.totalSellingValue - product.totalCostValue).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {/* Summary Row */}
              {summary && (
                <TableRow className="bg-primary/5 font-semibold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right text-green-600">
                    {summary.overallMarginPercent}%
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">
                    R{summary.totalCostValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R{summary.totalSellingValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    R{summary.totalProfitPotential.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Insights */}
      {summary && products.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Insights</h2>
          <div className="space-y-3 text-sm">
            {(() => {
              const highestMargin = sortedProducts[0];
              const lowestMargin = sortedProducts[sortedProducts.length - 1];
              const avgMargin = summary.overallMarginPercent;

              return (
                <>
                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Best Margin: {highestMargin.name}
                      </p>
                      <p className="text-muted-foreground">
                        {highestMargin.profitMarginPercent}% profit margin with{' '}
                        {highestMargin.currentStock} units in stock
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Lowest Margin: {lowestMargin.name}
                      </p>
                      <p className="text-muted-foreground">
                        {lowestMargin.profitMarginPercent}% profit margin - consider repricing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Inventory Investment
                      </p>
                      <p className="text-muted-foreground">
                        R{summary.totalCostValue.toFixed(2)} invested across{' '}
                        {summary.productCount} products
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
