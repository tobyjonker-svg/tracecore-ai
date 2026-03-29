import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileUp, FileDown } from 'lucide-react';
import { toast } from 'sonner';

export function ImportExportMVP() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'products' | 'orders' | 'production'>('products');

  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: orders = [] } = trpc.orders.list.useQuery();
  const { data: productionRuns = [] } = trpc.production.list.useQuery();

  const handleExport = (type: 'products' | 'orders' | 'production') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'products':
        data = products;
        filename = 'products.csv';
        break;
      case 'orders':
        data = orders;
        filename = 'orders.csv';
        break;
      case 'production':
        data = productionRuns;
        filename = 'production_runs.csv';
        break;
    }

    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}`);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // Parse CSV (simple implementation)
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim().replace(/^"|"$/g, '');
          });
          return obj;
        });

        toast.success(`Imported ${data.length} records from ${selectedFile.name}`);
        setSelectedFile(null);
      } catch (error) {
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileUp className="w-8 h-8" />
          Import & Export
        </h1>
        <p className="text-muted-foreground mt-1">Manage data imports and exports</p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download your data as CSV files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => handleExport('products')} variant="outline" className="h-20 flex flex-col">
              <FileDown className="w-6 h-6 mb-2" />
              <span>Export Products</span>
              <span className="text-xs text-muted-foreground">{products.length} items</span>
            </Button>
            <Button onClick={() => handleExport('orders')} variant="outline" className="h-20 flex flex-col">
              <FileDown className="w-6 h-6 mb-2" />
              <span>Export Orders</span>
              <span className="text-xs text-muted-foreground">{orders.length} items</span>
            </Button>
            <Button onClick={() => handleExport('production')} variant="outline" className="h-20 flex flex-col">
              <FileDown className="w-6 h-6 mb-2" />
              <span>Export Production</span>
              <span className="text-xs text-muted-foreground">{productionRuns.length} items</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
          <CardDescription>Upload CSV files to import data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Import Type</label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="production">Production Runs</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Choose File</label>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFile.name}</p>
            )}
          </div>

          <Button onClick={handleImport} disabled={!selectedFile} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Import File
          </Button>

          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">CSV Format:</p>
            <p className="text-muted-foreground">
              {importType === 'products' && 'name, sku, costPerUnit, sellingPrice, currentStock'}
              {importType === 'orders' && 'orderNumber, customerId, customerName, productId, quantity, totalPrice'}
              {importType === 'production' && 'runNumber, productId, quantity, status'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Download Templates</CardTitle>
          <CardDescription>Use these templates to prepare your import files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Products Template
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Orders Template
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Production Runs Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
