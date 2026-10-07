import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, X, CheckCircle, Clock, Play, Trash2, FlaskConical } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { productId: 0, quantity: 0, notes: "" };

export default function ProductionRuns() {
  const utils = trpc.useUtils();
  const { data: runs = [], isLoading } = trpc.production.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();

  const matsRef = React.useRef<{ inputId: number; quantity: number }[]>([]);

  const createM = trpc.production.create.useMutation({
    onSuccess: async (run: any) => {
      const runId = run?.id || run?.insertId || (run as any)[0]?.id;
      const capturedMats = matsRef.current;
      console.log("[ProductionRuns] Created run id:", runId, "capturedMats:", capturedMats.length);
      if (capturedMats.length > 0 && runId) {
        try {
          await saveRunInputsM.mutateAsync({
            productionRunId: runId,
            materials: capturedMats.map(m => ({
              inputId: m.inputId,
              quantityUsed: m.quantity,
              unit: (inputs as any[]).find((i: any) => i.id === m.inputId)?.unit || "g",
            })),
          });
          console.log("[ProductionRuns] Saved", capturedMats.length, "materials");
        } catch(e) {
          console.error("[ProductionRuns] Failed to save materials:", e);
        }
      }
      matsRef.current = [];
      utils.production.list.invalidate();
      utils.inputs.list.invalidate();
      setShowForm(false);
      setForm(emptyForm);
      setMats([]);
      toast.success("Production run started");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveRunInputsM = trpc.production.saveRunInputs.useMutation();
  const updateStatusM = trpc.production.updateStatus.useMutation({
    onSuccess: () => { utils.production.list.invalidate(); utils.products.list.invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteM = trpc.production.delete.useMutation({
    onSuccess: () => { utils.production.list.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [mats, setMats] = useState<{ inputId: number; quantity: number }[]>([]);
  const [pendingMats, setPendingMats] = useState<{ inputId: number; quantity: number }[]>([]);
  const [viewRunId, setViewRunId] = useState<number | null>(null);

  const { data: viewRunMats = [] } = trpc.production.getRunInputs.useQuery(
    { productionRunId: viewRunId! },
    { enabled: viewRunId !== null }
  );

  const reset = () => { setForm(emptyForm); setMats([]); setShowForm(false); };
  const addMat = () => setMats([...mats, { inputId: 0, quantity: 0 }]);
  const rmMat = (i: number) => setMats(mats.filter((_, idx) => idx !== i));
  const upMat = (i: number, k: string, v: any) => { const m = [...mats]; (m[i] as any)[k] = v; setMats(m); };

  const submit = () => {
    if (!form.productId || form.quantity <= 0) { toast.error("Select a product and quantity"); return; }
    const runNumber = `RUN-${Date.now().toString().slice(-6)}`;
    // Capture mats snapshot BEFORE mutation clears state
    matsRef.current = mats.filter(m => m.inputId > 0 && m.quantity > 0);
    console.log("[ProductionRuns] Captured", matsRef.current.length, "mats before submit");
    createM.mutate({
      runNumber,
      productId: form.productId,
      quantity: form.quantity,
      notes: form.notes,
      startDate: new Date(),
      materials: matsRef.current.map(m => ({
        inputId: m.inputId,
        quantityUsed: m.quantity,
        unit: (inputs as any[]).find((i: any) => i.id === m.inputId)?.unit || "g",
      })),
    });
  };

  const getProd = (id: number) => { const p = (products as any[]).find((p: any) => p.id === id); return p ? p.name : "?"; };
  const sIcon = (s: string) => s === "completed" || s === "approved" ? <CheckCircle className="w-4 h-4 text-green-600" /> : s === "in_progress" ? <Play className="w-4 h-4 text-blue-600" /> : <Clock className="w-4 h-4 text-yellow-600" />;
  const sLabel = (s: string) => ({ completed: "Completed", approved: "Approved", in_progress: "In Progress", planned: "Planned", quality_check: "QC Check" }[s] || s);
  const sColor = (s: string) => ({ completed: "bg-green-100 text-green-700", approved: "bg-emerald-100 text-emerald-700", in_progress: "bg-blue-100 text-blue-700", planned: "bg-yellow-100 text-yellow-700", quality_check: "bg-purple-100 text-purple-700" }[s] || "bg-muted");

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production Runs</h1>
        <Button onClick={() => { reset(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />New Run</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Log Production Run</CardTitle>
              <Button variant="ghost" size="icon" onClick={reset}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Product *</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.productId} onChange={e => setForm({ ...form, productId: Number(e.target.value) })}>
                  <option value={0}>-- Select product --</option>
                  {(products as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>)}
                </select>
              </div>
              <div>
                <Label>Quantity (bottles) *</Label>
                <Input type="number" min="1" value={form.quantity || ""} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Batch notes, observations..." />
              </div>
            </div>

            {/* Materials Used */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Raw Materials Used</Label>
                <Button variant="outline" size="sm" onClick={addMat}><Plus className="w-3 h-3 mr-1" />Add Material</Button>
              </div>
              {mats.length === 0 && <p className="text-xs text-muted-foreground">Track which raw inputs were used in this run.</p>}
              {mats.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={m.inputId} onChange={e => upMat(idx, "inputId", Number(e.target.value))}>
                    <option value={0}>-- Select material --</option>
                    {(inputs as any[]).map((i: any) => <option key={i.id} value={i.id}>{i.name} (stock: {Number(i.currentStock || 0)} {i.unit})</option>)}
                  </select>
                  <Input className="w-28" type="number" min="0" step="0.1" placeholder="Qty" value={m.quantity || ""} onChange={e => upMat(idx, "quantity", parseFloat(e.target.value) || 0)} />
                  <span className="text-xs text-muted-foreground w-8">{m.inputId ? (inputs as any[]).find((i: any) => i.id === m.inputId)?.unit : ""}</span>
                  <Button variant="ghost" size="icon" onClick={() => rmMat(idx)}><X className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={submit} disabled={!form.productId || form.quantity <= 0 || createM.isPending}>
                {createM.isPending ? "Saving..." : "Start Run"}
              </Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {runs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No production runs yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {(runs as any[]).map((r: any) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {sIcon(r.status)}
                      <h3 className="font-semibold">{getProd(r.productId)}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sColor(r.status)}`}>{sLabel(r.status)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Qty: <strong>{r.quantity}</strong> bottles &nbsp;·&nbsp; Run: {r.runNumber}</p>
                    {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-400" onClick={() => setViewRunId(viewRunId === r.id ? null : r.id)}>
                      {viewRunId === r.id ? "Hide materials" : "View materials used"}
                    </Button>
                    {viewRunId === r.id && (
                      <div className="mt-2 space-y-1">
                        {(viewRunMats as any[]).length === 0 ? (
                          <p className="text-xs text-muted-foreground">No materials recorded for this run.</p>
                        ) : (
                          (viewRunMats as any[]).map((m: any) => (
                            <p key={m.id} className="text-xs bg-muted/50 rounded px-2 py-1">
                              {m.inputName}: <strong>{m.quantityUsed} {m.inputUnit}</strong>
                            </p>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {r.status === "planned" && (
                      <Button variant="outline" size="sm" onClick={() => updateStatusM.mutate({ id: r.id, status: "in_progress" })}>
                        <Play className="w-3 h-3 mr-1" />Start
                      </Button>
                    )}
                    {r.status === "in_progress" && (
                      <Button variant="outline" size="sm" onClick={() => updateStatusM.mutate({ id: r.id, status: "quality_check" })}>
                        QC Check
                      </Button>
                    )}
                    {r.status === "quality_check" && (
                      <Button variant="outline" size="sm" onClick={() => updateStatusM.mutate({ id: r.id, status: "completed" })}>
                        <CheckCircle className="w-3 h-3 mr-1" />Complete
                      </Button>
                    )}
                    {(r.status === "completed" || r.status === "in_progress") && (
                      <Button variant="outline" size="sm" onClick={() => updateStatusM.mutate({ id: r.id, status: "approved" })}>
                        Approve
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this run?")) deleteM.mutate({ id: r.id }); }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
