import { useState } from "react";
import { useRegrasRoteamento, useCreateRegra, useUpdateRegra, useDeleteRegra, useCheckConflicts, RegraRoteamento } from "@/hooks/useDistribuicao";
import { useEquipes } from "@/hooks/useEquipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Route, GripVertical, AlertTriangle } from "lucide-react";
import { TRIBUNAIS } from "@/lib/types";
import { toast } from "sonner";

const NATUREZAS = ["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"];
const TIPOS_PAGAMENTO = ["RPV", "Precatório"];
const TIPOS_SERVICO = ["Cessão de Crédito", "Honorários", "Consultoria", "Outro"];

type FormData = {
  nome: string;
  equipe_id: string;
  entidade: string;
  criterio_tribunal: string[];
  criterio_natureza: string[];
  criterio_tipo_pagamento: string[];
  criterio_tipo_servico: string[];
  criterio_valor_min: number | null;
  criterio_valor_max: number | null;
  prioridade: number;
  ativa: boolean;
};

const emptyForm: FormData = {
  nome: "",
  equipe_id: "",
  entidade: "processo",
  criterio_tribunal: [],
  criterio_natureza: [],
  criterio_tipo_pagamento: [],
  criterio_tipo_servico: [],
  criterio_valor_min: null,
  criterio_valor_max: null,
  prioridade: 0,
  ativa: true,
};

export default function ConfigRoteamento() {
  const { data: regras, isLoading } = useRegrasRoteamento();
  const { data: equipes } = useEquipes();
  const createRegra = useCreateRegra();
  const updateRegra = useUpdateRegra();
  const deleteRegra = useDeleteRegra();
  const conflicts = useCheckConflicts(regras);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [tabEntidade, setTabEntidade] = useState("processo");

  const openNew = (entidade: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, entidade });
    setSheetOpen(true);
  };

  const openEdit = (r: RegraRoteamento) => {
    setEditingId(r.id);
    setForm({
      nome: r.nome,
      equipe_id: r.equipe_id,
      entidade: r.entidade,
      criterio_tribunal: r.criterio_tribunal,
      criterio_natureza: r.criterio_natureza,
      criterio_tipo_pagamento: r.criterio_tipo_pagamento,
      criterio_tipo_servico: r.criterio_tipo_servico ?? [],
      criterio_valor_min: r.criterio_valor_min,
      criterio_valor_max: r.criterio_valor_max,
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

  const filteredRegras = (regras ?? []).filter(r => r.entidade === tabEntidade);

  const renderRegraCard = (r: RegraRoteamento) => {
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
                <Badge variant="outline" className="text-[9px]">P{r.prioridade}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                <Route className="w-3 h-3 shrink-0" />
                <span>→ {equipe?.nome ?? "Equipe removida"}</span>
                {r.criterio_tribunal.length > 0 && <span>• Tribunais: {r.criterio_tribunal.join(", ")}</span>}
                {r.criterio_natureza.length > 0 && <span>• Natureza: {r.criterio_natureza.join(", ")}</span>}
                {r.criterio_tipo_pagamento.length > 0 && <span>• Tipo Pgto: {r.criterio_tipo_pagamento.join(", ")}</span>}
                {r.criterio_tipo_servico?.length > 0 && <span>• Serviço: {r.criterio_tipo_servico.join(", ")}</span>}
                {r.criterio_valor_min != null && <span>• Valor ≥ {r.criterio_valor_min.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
                {r.criterio_valor_max != null && <span>• Valor ≤ {r.criterio_valor_max.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Regras de Roteamento</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure a distribuição automática de processos e negócios por equipe</p>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-warning font-medium text-sm">
            <AlertTriangle className="w-4 h-4" />
            Conflitos detectados entre regras
          </div>
          {conflicts.map((c, i) => (
            <p key={i} className="text-xs text-muted-foreground ml-6">
              <span className="font-medium">"{c.ruleA}"</span> e <span className="font-medium">"{c.ruleB}"</span> — sobreposição em {c.overlap || "critérios amplos"}. A regra com menor prioridade será aplicada.
            </p>
          ))}
        </div>
      )}

      <Tabs value={tabEntidade} onValueChange={setTabEntidade}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="processo" className="text-xs">Processos</TabsTrigger>
            <TabsTrigger value="negocio" className="text-xs">Negócios</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => openNew(tabEntidade)} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />Nova Regra
          </Button>
        </div>

        <TabsContent value="processo" className="mt-4 space-y-3">
          {filteredRegras.length === 0 ? (
            <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhuma regra para processos.</CardContent></Card>
          ) : filteredRegras.map(renderRegraCard)}
        </TabsContent>

        <TabsContent value="negocio" className="mt-4 space-y-3">
          {filteredRegras.length === 0 ? (
            <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhuma regra para negócios.</CardContent></Card>
          ) : filteredRegras.map(renderRegraCard)}
        </TabsContent>
      </Tabs>

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
              <label className="text-xs font-medium mb-1.5 block">Entidade</label>
              <Select value={form.entidade} onValueChange={v => setForm({ ...form, entidade: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="processo">Processo</SelectItem>
                  <SelectItem value="negocio">Negócio</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Process-specific criteria */}
            {form.entidade === "processo" && (
              <>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Tribunais (vazio = todos)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TRIBUNAIS.map(t => (
                      <Badge key={t} variant={form.criterio_tribunal.includes(t) ? "default" : "outline"} className="cursor-pointer text-[10px]"
                        onClick={() => setForm({ ...form, criterio_tribunal: toggleMulti(form.criterio_tribunal, t) })}>{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Naturezas (vazio = todas)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {NATUREZAS.map(n => (
                      <Badge key={n} variant={form.criterio_natureza.includes(n) ? "default" : "outline"} className="cursor-pointer text-[10px]"
                        onClick={() => setForm({ ...form, criterio_natureza: toggleMulti(form.criterio_natureza, n) })}>{n}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Tipo Pagamento (vazio = todos)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIPOS_PAGAMENTO.map(t => (
                      <Badge key={t} variant={form.criterio_tipo_pagamento.includes(t) ? "default" : "outline"} className="cursor-pointer text-[10px]"
                        onClick={() => setForm({ ...form, criterio_tipo_pagamento: toggleMulti(form.criterio_tipo_pagamento, t) })}>{t}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Negocio-specific criteria */}
            {form.entidade === "negocio" && (
              <>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Tipo de Serviço (vazio = todos)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIPOS_SERVICO.map(t => (
                      <Badge key={t} variant={form.criterio_tipo_servico.includes(t) ? "default" : "outline"} className="cursor-pointer text-[10px]"
                        onClick={() => setForm({ ...form, criterio_tipo_servico: toggleMulti(form.criterio_tipo_servico, t) })}>{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Valor Mínimo</label>
                    <Input type="number" value={form.criterio_valor_min ?? ""} onChange={e => setForm({ ...form, criterio_valor_min: e.target.value === "" ? null : Number(e.target.value) })} className="h-9 text-sm" placeholder="Sem mínimo" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Valor Máximo</label>
                    <Input type="number" value={form.criterio_valor_max ?? ""} onChange={e => setForm({ ...form, criterio_valor_max: e.target.value === "" ? null : Number(e.target.value) })} className="h-9 text-sm" placeholder="Sem máximo" />
                  </div>
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSave} disabled={createRegra.isPending || updateRegra.isPending}>
              {editingId ? "Salvar Alterações" : "Criar Regra"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
