import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

export function Inputs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInput, setEditingInput] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    costPerUnit: "",
    unit: "kg",
    supplierId: "",
  });

  const { data: inputs, isLoading, error, refetch } = trpc.inputs.list.useQuery();
  const createMutation = trpc.inputs.create.useMutation();
  const updateMutation = trpc.inputs.update.useMutation();
  const deleteMutation = trpc.inputs.delete.useMutation();

  const handleOpenDialog = (input?: any) => {
    if (input) {
      setEditingInput(input);
      setFormData({
        name: input.name,
        description: input.description || "",
        costPerUnit: input.costPerUnit.toString(),
        unit: input.unit,
        supplierId: input.supplierId?.toString() || "",
      });
    } else {
      setEditingInput(null);
      setFormData({
        name: "",
        description: "",
        costPerUnit: "",
        unit: "kg",
        supplierId: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.costPerUnit) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingInput) {
        await updateMutation.mutateAsync({
          id: editingInput.id,
          name: formData.name,
          description: formData.description,
          costPerUnit: parseFloat(formData.costPerUnit),
          unit: formData.unit,
          supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        });
        toast.success("Input updated successfully");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          costPerUnit: parseFloat(formData.costPerUnit),
          unit: formData.unit,
          supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        });
        toast.success("Input created successfully");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save input");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this input?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Input deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete input");
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to Load Inputs</h2>
          <p className="text-gray-600 mb-4">Failed to fetch inputs</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Raw Materials (Inputs)</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Input
        </Button>
      </div>

      {!inputs || inputs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No inputs added yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Start by adding your raw materials (powder, oils, capsules, etc.) that you purchase from suppliers
          </p>
          <Button onClick={() => handleOpenDialog()} variant="outline">
            Add Your First Input
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {inputs.map((input: any) => (
            <Card key={input.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{input.name}</h3>
                  {input.description && (
                    <p className="text-sm text-gray-600 mt-1">{input.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Cost per {input.unit}:</span>
                      <p className="font-semibold">R{parseFloat(input.costPerUnit).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <p className="font-semibold">{input.currentStock} {input.unit}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(input)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(input.id)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInput ? "Edit Input" : "Add New Input"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Input Name *</label>
              <Input
                placeholder="e.g., Powder, Oil, Capsules"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cost per Unit *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Type</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="liters">Liters (L)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="units">Units</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier ID (Optional)</label>
              <Input
                type="number"
                placeholder="Supplier ID"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Link to a supplier for tracking pricing</p>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
