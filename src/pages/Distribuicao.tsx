import { useState } from "react";
import { useProcessosFila, useDistribuirProcessos, useDistribuicaoAutomatica, useRegrasRoteamento } from "@/hooks/useDistribuicao";
import { useEquipes, useUsuarios, useEquipeMembros } from "@/hooks/useEquipes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, Zap, Users, Send } from "lucide-react";
import { toast } from "sonner";

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";

export default function Distribuicao() {
  const { data: processos, isLoading } = useProcessosFila();
  const { data: equipes } = useEquipes();
  const { data: usuarios } = useUsuarios();
  const { data: membros } = useEquipeMembros();
  const { data: regras } = useRegrasRoteamento();
  const distribuir = useDistribuirProcessos();
  const autoDistribuir = useDistribuicaoAutomatica();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [equipeId, setEquipeId] = useState("");
  const [analistaId, setAnalistaId] = useState("");

  const toggleAll = () => {
    if (!processos) return;
    if (selected.size === processos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(processos.map(p => p.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const equipeMembros = equipeId
    ? (membros ?? []).filter(m => m.equipe_id === equipeId)
    : [];
  const analistaOptions = equipeMembros
    .map(m => (usuarios ?? []).find(u => u.id === m.usuario_id))
    .filter(Boolean);

  const handleDistribuir = async () => {
    if (!analistaId || !equipeId) return;
    try {
      await distribuir.mutateAsync({ ids: Array.from(selected), analista_id: analistaId, equipe_id: equipeId });
      toast.success(`${selected.size} processo(s) distribuído(s)`);
      setSelected(new Set());
      setSheetOpen(false);
      setEquipeId("");
      setAnalistaId("");
    } catch {
      toast.error("Erro ao distribuir");
    }
  };

  const handleAutoDistribuir = async () => {
    if (!processos || !regras || !membros) return;
    try {
      const count = await autoDistribuir.mutateAsync({ processos, regras, membros });
      if (count === 0) {
        toast.info("Nenhum processo correspondeu às regras de roteamento");
      } else {
        toast.success(`${count} processo(s) distribuído(s) automaticamente`);
      }
      setSelected(new Set());
    } catch {
      toast.error("Erro na distribuição automática");
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  const list = processos ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-4 p-6">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            Distribuição
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {list.length} processo(s) na fila • {selected.size} selecionado(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleAutoDistribuir} disabled={list.length === 0 || autoDistribuir.isPending}>
            <Zap className="w-3.5 h-3.5" />Distribuição Automática
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setSheetOpen(true)} disabled={selected.size === 0}>
            <Send className="w-3.5 h-3.5" />Distribuir Selecionados ({selected.size})
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 glass-card rounded-xl overflow-hidden flex flex-col">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={list.length > 0 && selected.size === list.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nº CNJ</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">Tribunal</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Natureza</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo Pgto</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor Est.</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Captação</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">Nenhum processo na fila de distribuição.</TableCell></TableRow>
              )}
              {list.map(p => (
                <TableRow key={p.id} className="h-9 border-border/20">
                  <TableCell className="w-10"><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} /></TableCell>
                  <TableCell className="font-mono text-[11px] font-medium">{p.numero_processo}</TableCell>
                  <TableCell className="w-16"><Badge variant="secondary" className="text-[10px]">{p.tribunal}</Badge></TableCell>
                  <TableCell className="text-[11px]">{p.natureza}</TableCell>
                  <TableCell className="text-[11px]">{p.tipo_pagamento}</TableCell>
                  <TableCell className="text-[11px] font-medium text-right">{formatCurrency(p.valor_estimado)}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{formatDate(p.data_captacao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Users className="w-4 h-4" />Distribuir Processos</SheetTitle>
            <SheetDescription>{selected.size} processo(s) selecionado(s)</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Equipe</label>
              <Select value={equipeId} onValueChange={(v) => { setEquipeId(v); setAnalistaId(""); }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione a equipe" /></SelectTrigger>
                <SelectContent>
                  {(equipes ?? []).filter(e => e.ativa).map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Analista</label>
              <Select value={analistaId} onValueChange={setAnalistaId} disabled={!equipeId}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione o analista" /></SelectTrigger>
                <SelectContent>
                  {analistaOptions.map(u => u && (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-4" onClick={handleDistribuir} disabled={!analistaId || distribuir.isPending}>
              <Send className="w-4 h-4 mr-2" />Confirmar Distribuição
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
