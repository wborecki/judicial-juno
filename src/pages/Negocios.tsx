import { useMemo, useState } from "react";
import { useNegocios } from "@/hooks/useNegocios";
import { useProcessos } from "@/hooks/useProcessos";
import { usePessoas } from "@/hooks/usePessoas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, XCircle, Search, X, Briefcase } from "lucide-react";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "outline" | "default" | "destructive"; color: string }> = {
  em_andamento: { label: "Em Andamento", icon: Clock, variant: "outline", color: "bg-accent/10 text-accent-foreground" },
  ganho: { label: "Ganho", icon: TrendingUp, variant: "default", color: "bg-success/10 text-success" },
  perdido: { label: "Perdido", icon: XCircle, variant: "destructive", color: "bg-destructive/10 text-destructive" },
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

export default function Negocios() {
  const { data: negocios = [], isLoading } = useNegocios();
  const { data: processos = [] } = useProcessos();
  const { data: pessoas = [] } = usePessoas();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");

  const negociosEnriquecidos = useMemo(() => {
    return negocios.map(n => {
      const processo = processos.find(p => p.id === n.processo_id);
      const pessoa = pessoas.find(pe => pe.id === n.pessoa_id);
      return { ...n, processoNumero: processo?.numero_processo ?? "—", pessoaNome: pessoa?.nome ?? "—" };
    });
  }, [negocios, processos, pessoas]);

  const filtered = useMemo(() => {
    return negociosEnriquecidos.filter(n => {
      if (search) {
        const q = search.toLowerCase();
        if (!n.processoNumero.toLowerCase().includes(q) && !n.pessoaNome.toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== "all" && n.negocio_status !== filterStatus) return false;
      if (filterTipo !== "all" && n.tipo_servico !== filterTipo) return false;
      return true;
    });
  }, [negociosEnriquecidos, search, filterStatus, filterTipo]);

  const stats = {
    em_andamento: negocios.filter(n => n.negocio_status === "em_andamento").length,
    ganho: negocios.filter(n => n.negocio_status === "ganho").length,
    perdido: negocios.filter(n => n.negocio_status === "perdido").length,
  };

  const hasFilters = search !== "" || filterStatus !== "all" || filterTipo !== "all";

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Negócios
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {filtered.length} negócio{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Em Andamento</p><p className="text-xl font-bold text-accent mt-1">{stats.em_andamento}</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ganhos</p><p className="text-xl font-bold text-success mt-1">{stats.ganho}</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Perdidos</p><p className="text-xl font-bold text-destructive mt-1">{stats.perdido}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Buscar por processo ou pessoa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="ganho">Ganho</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue placeholder="Tipo Serviço" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterTipo("all"); }} className="h-8 text-xs gap-1">
            <X className="w-3 h-3" />Limpar
          </Button>
        )}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Processo</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pessoa</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo Serviço</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor Proposta</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">Nenhum negócio encontrado.</TableCell></TableRow>
            )}
            {filtered.map(n => {
              const cfg = statusConfig[n.negocio_status];
              return (
                <TableRow key={n.id} className="border-border/20 h-9">
                  <TableCell className="font-mono text-[11px] py-1.5">{n.processoNumero}</TableCell>
                  <TableCell className="text-xs py-1.5">{n.pessoaNome}</TableCell>
                  <TableCell className="text-[11px] py-1.5">{n.tipo_servico ? TIPO_SERVICO_LABELS[n.tipo_servico] ?? n.tipo_servico : "—"}</TableCell>
                  <TableCell className="text-[11px] font-medium text-right py-1.5">{formatCurrency(n.valor_proposta)}</TableCell>
                  <TableCell className="py-1.5"><Badge variant="secondary" className={`text-[9px] ${cfg?.color ?? ""}`}>{cfg?.label ?? n.negocio_status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
