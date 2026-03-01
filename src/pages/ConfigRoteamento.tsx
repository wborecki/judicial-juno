import { useState } from "react";
import { useRegrasRoteamento, useCreateRegra, useUpdateRegra, useDeleteRegra, RegraRoteamento } from "@/hooks/useDistribuicao";
import { useEquipes } from "@/hooks/useEquipes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Route, GripVertical } from "lucide-react";
import { TRIBUNAIS } from "@/lib/types";
import { toast } from "sonner";

const NATUREZAS = ["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"];
const TIPOS_PAGAMENTO = ["RPV", "Precatório"];

type FormData = {
  nome: string;
  equipe_id: string;
  criterio_tribunal: string[];
  criterio_natureza: string[];
  criterio_tipo_pagamento: string[];
  prioridade: number;
  ativa: boolean;
};

const emptyForm: FormData = {
  nome: "",
  equipe_id: "",
  criterio_tribunal: [],
  criterio_natureza: [],
  criterio_tipo_pagamento: [],
  prioridade: 0,
  ativa: true,
};

export default function ConfigRoteamento() {
  const { data: regras, isLoading } = useRegrasRoteamento();
  const { data: equipes } = useEquipes();
  const createRegra = useCreateRegra();
  const updateRegra = useUpdateRegra();
  const deleteRegra = useDeleteRegra();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (r: RegraRoteamento) => {
    setEditingId(r.id);
    setForm({
      nome: r.nome,
      equipe_id: r.equipe_id,
      criterio_tribunal: r.criterio_tribunal,
      criterio_natureza: r.criterio_natureza,
      criterio_tipo_pagamento: r.criterio_tipo_pagamento,
      prioridade: r.prioridade,
      ativa: r.ativa,
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome || !form.equipe_id) {
      toast.error("Preencha nome e equipe");
      return;
    }
    try {
      if (editingId) {
        await updateRegra.mutateAsync({ id: editingId, updates: form });
        toast.success("Regra atualizada");
      } else {
        await createRegra.mutateAsync(form);
        toast.success("Regra criada");
      }
      setSheetOpen(false);
    } catch {
      toast.error("Erro ao salvar regra");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRegra.mutateAsync(id);
      toast.success("Regra removida");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const toggleMulti = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Regras de Roteamento</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure a distribuição automática de processos por equipe</p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />Nova Regra
        </Button>
      </div>

      {(regras ?? []).length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Nenhuma regra de roteamento configurada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(regras ?? []).map((r) => {
            const equipe = (equipes ?? []).find(e => e.id === r.equipe_id);
            return (
              <Card key={r.id} className="glass-card cursor-pointer hover:border-primary/20 transition-colors" onClick={() => openEdit(r)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{r.nome}</span>
                        <Badge variant={r.ativa ? "default" : "secondary"} className="text-[9px]">
                          {r.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">Prioridade {r.prioridade}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Route className="w-3 h-3" />
                        <span>→ {equipe?.nome ?? "Equipe removida"}</span>
                        {r.criterio_tribunal.length > 0 && <span>• Tribunais: {r.criterio_tribunal.join(", ")}</span>}
                        {r.criterio_natureza.length > 0 && <span>• Natureza: {r.criterio_natureza.join(", ")}</span>}
                        {r.criterio_tipo_pagamento.length > 0 && <span>• Tipo: {r.criterio_tipo_pagamento.join(", ")}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Regra" : "Nova Regra"}</SheetTitle>
            <SheetDescription>Defina os critérios para distribuição automática</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nome da Regra</label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="h-9 text-sm" placeholder="Ex: Processos TRF1 Previdenciários" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Equipe Destino</label>
              <Select value={form.equipe_id} onValueChange={v => setForm({ ...form, equipe_id: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(equipes ?? []).filter(e => e.ativa).map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Prioridade (menor = maior prioridade)</label>
              <Input type="number" value={form.prioridade} onChange={e => setForm({ ...form, prioridade: Number(e.target.value) })} className="h-9 text-sm w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.ativa} onCheckedChange={v => setForm({ ...form, ativa: v })} />
              <span className="text-sm">Regra ativa</span>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block">Tribunais (vazio = todos)</label>
              <div className="flex flex-wrap gap-1.5">
                {TRIBUNAIS.map(t => (
                  <Badge
                    key={t}
                    variant={form.criterio_tribunal.includes(t) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => setForm({ ...form, criterio_tribunal: toggleMulti(form.criterio_tribunal, t) })}
                  >{t}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Naturezas (vazio = todas)</label>
              <div className="flex flex-wrap gap-1.5">
                {NATUREZAS.map(n => (
                  <Badge
                    key={n}
                    variant={form.criterio_natureza.includes(n) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => setForm({ ...form, criterio_natureza: toggleMulti(form.criterio_natureza, n) })}
                  >{n}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Tipo Pagamento (vazio = todos)</label>
              <div className="flex flex-wrap gap-1.5">
                {TIPOS_PAGAMENTO.map(t => (
                  <Badge
                    key={t}
                    variant={form.criterio_tipo_pagamento.includes(t) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => setForm({ ...form, criterio_tipo_pagamento: toggleMulti(form.criterio_tipo_pagamento, t) })}
                  >{t}</Badge>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={createRegra.isPending || updateRegra.isPending}>
              {editingId ? "Salvar Alterações" : "Criar Regra"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
