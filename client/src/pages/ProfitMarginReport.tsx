/**
 * Profit Margin Report Dashboard
 * Comprehensive view of inventory valuation, profit potential, and margin analysis
 * Now includes full supply chain: input cost → product cost → selling price → profit
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
import { TrendingUp, Download, RefreshCw, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfitMarginReport() {
  const { data: valuation, isLoading, refetch } = trpc.products.getValuation.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();

  const handleExportCSV = () => {
    if (!valuation?.products || valuation.products.length === 0) {
      toast.error('No products to export');
      return;
    }

    const headers = [
      'Product Name',
      'SKU',
      'Input Material',
      'Input Cost Per Unit',
      'Product Cost Per Unit',
      'Selling Price',
      'Profit Per Unit',
      'Margin %',
      'Current Stock',
      'Total Cost Value',
      'Total Selling Value',
      'Total Profit Potential',
    ];

    const rows = valuation?.products?.map((p: any) => {
      const inputMaterial = p.inputId ? inputs.find((i: any) => i.id === p.inputId)?.name || 'N/A' : 'None';
      const inputCostPerUnit = p.inputId && p.conversionRatio 
        ? ((parseFloat(inputs.find((i: any) => i.id === p.inputId)?.costPerUnit || '0') / parseFloat(p.conversionRatio)).toFixed(2))
        : '0.00';
      
      return [
        p.name,
        p.sku || '',
        inputMaterial,
        inputCostPerUnit,
        p.costPerUnit.toFixed(2),
        p.sellingPrice.toFixed(2),
        p.profitPerUnit.toFixed(2),
        p.profitMarginPercent,
        p.currentStock,
        p.totalCostValue.toFixed(2),
        p.totalSellingValue.toFixed(2),
        (p.totalSellingValue - p.totalCostValue).toFixed(2),
      ];
    });

    // Add summary row
    rows.push([
      'TOTAL',
      '',
      '',
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

  const getInputName = (inputId: number) => {
    return inputs.find((i: any) => i.id === inputId)?.name || 'Unknown';
  };

  const getInputCostPerUnit = (product: any): string => {
    if (!product.inputId || !product.conversionRatio) return '0';
    const input = inputs.find((i: any) => i.id === product.inputId);
    if (!input) return '0';
    return (parseFloat(input.costPerUnit) / parseFloat(product.conversionRatio)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profit Margin Report</h1>
          <p className="text-muted-foreground mt-1">Complete supply chain analysis from raw materials to finished products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Input Cost Value</p>
            <p className="text-2xl font-bold text-orange-600">
              {products.reduce((sum: number, p: any) => {
                const inputCost = getInputCostPerUnit(p);
                return sum + (parseFloat(inputCost) * p.currentStock);
              }, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Production Cost</p>
            <p className="text-2xl font-bold text-blue-600">{summary.totalCostValue.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Selling Value</p>
            <p className="text-2xl font-bold text-purple-600">{summary.totalSellingValue.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Profit Potential</p>
            <p className="text-2xl font-bold text-green-600">{summary.totalProfitPotential.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Overall Margin %</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{summary.overallMarginPercent}%</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">Avg Profit Per Unit</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {(products.reduce((sum: number, p: any) => sum + p.profitPerUnit, 0) / (products.length || 1)).toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900">Total Stock Units</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {products.reduce((sum: number, p: any) => sum + p.currentStock, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Package className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground">No products to report on</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>Input Material</TableHead>
                <TableHead>Input Cost/Unit</TableHead>
                <TableHead>Product Cost/Unit</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Profit/Unit</TableHead>
                <TableHead>Margin %</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product: any, index: number) => {
                const inputCostPerUnit = getInputCostPerUnit(product);
                const totalValue = product.totalSellingValue - product.totalCostValue;
                const marginPercent = parseFloat(product.profitMarginPercent);
                const inputCostNum = parseFloat(inputCostPerUnit);
                
                return (
                  <TableRow key={product.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm">
                      {product.inputId ? getInputName(product.inputId) : <span className="text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {inputCostNum > 0 ? inputCostPerUnit : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{product.costPerUnit.toFixed(2)}</TableCell>
                    <TableCell className="text-sm font-medium">{product.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-sm font-semibold text-green-600">
                      {product.profitPerUnit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        marginPercent > 50 ? 'bg-green-100 text-green-800' :
                        marginPercent > 30 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {product.profitMarginPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{product.currentStock}</TableCell>
                    <TableCell className="text-sm font-semibold">
                      <span className="text-green-600">{totalValue.toFixed(2)}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Insights */}
      {products.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Supply Chain Insights</p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Products linked to raw materials show input cost per unit for complete cost tracking</li>
                <li>• Profit margins include both input costs and production costs</li>
                <li>• Total value represents potential profit from current inventory</li>
                <li>• Sort by margin % to identify your most profitable products</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
