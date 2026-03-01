import { useState } from "react";
import { useNegocioPipelines, useCreatePipeline, useUpdatePipeline, PipelineEtapa } from "@/hooks/useNegocioPipelines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, GripVertical, Trash2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#f97316"];

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ConfigPipelines() {
  const { data: pipelines = [], isLoading } = useNegocioPipelines();
  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formPadrao, setFormPadrao] = useState(false);
  const [formEtapas, setFormEtapas] = useState<PipelineEtapa[]>([]);
  const [newEtapaNome, setNewEtapaNome] = useState("");
  const [newEtapaCor, setNewEtapaCor] = useState(DEFAULT_COLORS[0]);

  function openCreate() {
    setEditingId(null);
    setFormNome("");
    setFormPadrao(false);
    setFormEtapas([]);
    setDialogOpen(true);
  }

  function openEdit(p: typeof pipelines[0]) {
    setEditingId(p.id);
    setFormNome(p.nome);
    setFormPadrao(p.padrao);
    setFormEtapas([...p.etapas]);
    setDialogOpen(true);
  }

  function addEtapa() {
    if (!newEtapaNome.trim()) return;
    setFormEtapas((prev) => [...prev, { id: genId(), nome: newEtapaNome.trim(), cor: newEtapaCor }]);
    setNewEtapaNome("");
    setNewEtapaCor(DEFAULT_COLORS[(formEtapas.length + 1) % DEFAULT_COLORS.length]);
  }

  function removeEtapa(id: string) {
    setFormEtapas((prev) => prev.filter((e) => e.id !== id));
  }

  function moveEtapa(idx: number, dir: -1 | 1) {
    setFormEtapas((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  }

  async function handleSave() {
    if (!formNome.trim()) {
      toast.error("Informe o nome do pipeline");
      return;
    }
    if (formEtapas.length < 2) {
      toast.error("Adicione pelo menos 2 etapas");
      return;
    }
    try {
      if (editingId) {
        await updatePipeline.mutateAsync({ id: editingId, updates: { nome: formNome, etapas: formEtapas, padrao: formPadrao } });
        toast.success("Pipeline atualizado");
      } else {
        await createPipeline.mutateAsync({ nome: formNome, etapas: formEtapas, padrao: formPadrao });
        toast.success("Pipeline criado");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erro ao salvar pipeline");
    }
  }

  async function togglePadrao(id: string) {
    try {
      await updatePipeline.mutateAsync({ id, updates: { padrao: true } });
      toast.success("Pipeline padrão atualizado");
    } catch {
      toast.error("Erro ao definir padrão");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Pipelines de Negócios</h2>
          <p className="text-sm text-muted-foreground">Configure os pipelines e etapas do seu funil comercial.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Novo Pipeline
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
      ) : pipelines.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum pipeline configurado.</p>
      ) : (
        <div className="space-y-3">
          {pipelines.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{p.nome}</span>
                  {p.padrao && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Star className="w-3 h-3" /> Padrão
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!p.padrao && (
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => togglePadrao(p.id)}>
                      Definir como padrão
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {p.etapas.map((etapa, i) => (
                  <div key={etapa.id} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 border rounded-md px-2 py-1 text-xs bg-muted/30">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: etapa.cor }} />
                      {etapa.nome}
                    </div>
                    {i < p.etapas.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Pipeline" : "Novo Pipeline"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome do Pipeline</Label>
              <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: Pipeline Comercial" />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formPadrao} onCheckedChange={setFormPadrao} id="padrao" />
              <Label htmlFor="padrao" className="text-sm">Pipeline padrão</Label>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Etapas do Funil</Label>
              {formEtapas.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma etapa adicionada.</p>
              )}
              {formEtapas.map((etapa, idx) => (
                <div key={etapa.id} className="flex items-center gap-2 group">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  <div className="w-4 h-4 rounded-full border shrink-0" style={{ backgroundColor: etapa.cor }} />
                  <span className="text-sm flex-1">{etapa.nome}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveEtapa(idx, -1)} disabled={idx === 0}>
                      ↑
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveEtapa(idx, 1)} disabled={idx === formEtapas.length - 1}>
                      ↓
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeEtapa(etapa.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add new stage */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={newEtapaCor}
                  onChange={(e) => setNewEtapaCor(e.target.value)}
                  className="w-7 h-7 rounded border cursor-pointer p-0.5"
                />
                <Input
                  placeholder="Nome da etapa..."
                  value={newEtapaNome}
                  onChange={(e) => setNewEtapaNome(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addEtapa()}
                />
                <Button variant="outline" size="sm" className="h-8" onClick={addEtapa}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createPipeline.isPending || updatePipeline.isPending}>
              {editingId ? "Salvar" : "Criar Pipeline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
