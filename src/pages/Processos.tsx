import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcessos } from "@/hooks/useProcessos";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Scale } from "lucide-react";
import { TRIBUNAIS, PIPELINE_LABELS } from "@/lib/types";

const NATUREZAS = ["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"];
const TIPOS_PAGAMENTO = ["RPV", "Precatório"];
const TRIAGEM_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "apto", label: "Apto" },
  { value: "descartado", label: "Descartado" },
  { value: "reanálise", label: "Reanálise" },
];

const PIPELINE_COLORS: Record<string, string> = {
  captado: "bg-muted text-muted-foreground",
  triagem: "bg-warning/10 text-warning",
  distribuido: "bg-info/10 text-info",
  em_analise: "bg-accent/10 text-accent-foreground",
  precificado: "bg-primary/10 text-primary",
  comercial: "bg-info/10 text-info",
};

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning",
  apto: "bg-success/10 text-success",
  descartado: "bg-destructive/10 text-destructive",
  "reanálise": "bg-info/10 text-info",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

export default function Processos() {
  const { data: processos, isLoading } = useProcessos();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterTribunal, setFilterTribunal] = useState("all");
  const [filterNatureza, setFilterNatureza] = useState("all");
  const [filterTipoPagamento, setFilterTipoPagamento] = useState("all");
  const [filterPipeline, setFilterPipeline] = useState("all");
  const [filterTriagem, setFilterTriagem] = useState("all");
  const [filterTransito, setFilterTransito] = useState("all");

  const filtered = useMemo(() => {
    if (!processos) return [];
    return processos.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          p.numero_processo.toLowerCase().includes(q) ||
          p.parte_autora.toLowerCase().includes(q) ||
          p.parte_re.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterTribunal !== "all" && p.tribunal !== filterTribunal) return false;
      if (filterNatureza !== "all" && p.natureza !== filterNatureza) return false;
      if (filterTipoPagamento !== "all" && p.tipo_pagamento !== filterTipoPagamento) return false;
      if (filterPipeline !== "all" && p.pipeline_status !== filterPipeline) return false;
      if (filterTriagem !== "all" && (p.triagem_resultado ?? "pendente") !== filterTriagem) return false;
      if (filterTransito !== "all") {
        const wantTrue = filterTransito === "sim";
        if (p.transito_julgado !== wantTrue) return false;
      }
      return true;
    });
  }, [processos, search, filterTribunal, filterNatureza, filterTipoPagamento, filterPipeline, filterTriagem, filterTransito]);

  const hasFilters = filterTribunal !== "all" || filterNatureza !== "all" || filterTipoPagamento !== "all" || filterPipeline !== "all" || filterTriagem !== "all" || filterTransito !== "all" || search !== "";

  const clearFilters = () => {
    setSearch("");
    setFilterTribunal("all");
    setFilterNatureza("all");
    setFilterTipoPagamento("all");
    setFilterPipeline("all");
    setFilterTriagem("all");
    setFilterTransito("all");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Processos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} processo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          {processos && filtered.length !== processos.length && ` de ${processos.length} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, parte autora ou parte ré..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Select value={filterTribunal} onValueChange={setFilterTribunal}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tribunal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tribunais</SelectItem>
              {TRIBUNAIS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterNatureza} onValueChange={setFilterNatureza}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Natureza" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Naturezas</SelectItem>
              {NATUREZAS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTipoPagamento} onValueChange={setFilterTipoPagamento}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tipo Pgto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {TIPOS_PAGAMENTO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPipeline} onValueChange={setFilterPipeline}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pipeline" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              {Object.entries(PIPELINE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTriagem} onValueChange={setFilterTriagem}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Triagem" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Triagens</SelectItem>
              {TRIAGEM_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTransito} onValueChange={setFilterTransito}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Trânsito" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Trânsito: Todos</SelectItem>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Número</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tribunal</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Natureza</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parte Autora</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo Pgto</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triagem</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor Est.</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Captação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => {
              const triagem = p.triagem_resultado ?? "pendente";
              return (
                <TableRow
                  key={p.id}
                  className="cursor-pointer border-border/30 hover:bg-accent/5 transition-colors"
                  onClick={() => navigate(`/processos/${p.id}`)}
                >
                  <TableCell className="font-mono text-xs">{p.numero_processo}</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium bg-primary/5 text-primary px-2 py-1 rounded">
                      {p.tribunal}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{p.natureza}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{p.parte_autora}</TableCell>
                  <TableCell className="text-xs">{p.tipo_pagamento}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${PIPELINE_COLORS[p.pipeline_status] ?? ""}`}>
                      {PIPELINE_LABELS[p.pipeline_status] ?? p.pipeline_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${TRIAGEM_COLORS[triagem] ?? ""}`}>
                      {TRIAGEM_OPTIONS.find((t) => t.value === triagem)?.label ?? triagem}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-right">{formatCurrency(p.valor_estimado)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(p.data_captacao)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
