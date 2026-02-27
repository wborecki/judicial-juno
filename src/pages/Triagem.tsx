import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProcessos } from "@/hooks/useProcessos";
import { StatsCards } from "@/components/StatsCards";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProcessStatusBadge, TriageBadge } from "@/components/StatusBadge";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Triagem() {
  const { data: processos = [], isLoading } = useProcessos("triagem");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const counts = useMemo(() => ({
    todos: processos.length,
    pendente: processos.filter(p => p.triagem_resultado === "pendente").length,
    apto: processos.filter(p => p.triagem_resultado === "apto").length,
    descartado: processos.filter(p => p.triagem_resultado === "descartado").length,
    "reanálise": processos.filter(p => p.triagem_resultado === "reanálise").length,
  }), [processos]);

  const filtered = useMemo(() => {
    let list = processos;
    if (activeFilter !== "todos") {
      list = list.filter(p => p.triagem_resultado === activeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.numero_processo.includes(q) ||
        p.parte_autora.toLowerCase().includes(q) ||
        p.tribunal.toLowerCase().includes(q)
      );
    }
    return list;
  }, [processos, activeFilter, search]);

  const formatCurrency = (v?: number | null) =>
    v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Triagem de Processos</h1>
          <p className="text-sm text-muted-foreground mt-1">Analise e qualifique os leads captados</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar processo, parte, tribunal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList>
          <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes ({counts.pendente})</TabsTrigger>
          <TabsTrigger value="apto">Aptos ({counts.apto})</TabsTrigger>
          <TabsTrigger value="descartado">Descartados ({counts.descartado})</TabsTrigger>
          <TabsTrigger value="reanálise">Reanálise ({counts["reanálise"]})</TabsTrigger>
        </TabsList>
      </Tabs>

      <StatsCards counts={counts} total={processos.length} />

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Processo</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tribunal</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parte Autora</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trânsito</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor Est.</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triagem</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p, i) => (
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
                <TableCell className="text-sm">{p.parte_autora}</TableCell>
                <TableCell>
                  <ProcessStatusBadge status={p.status_processo as 1 | 2 | 3 | 4} />
                </TableCell>
                <TableCell>
                  <span className={p.transito_julgado ? "text-success text-xs font-medium" : "text-muted-foreground text-xs"}>
                    {p.transito_julgado ? "Sim" : "Não"}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(p.valor_estimado)}</TableCell>
                <TableCell>
                  <TriageBadge triagem={(p.triagem_resultado ?? "pendente") as any} />
                </TableCell>
                <TableCell>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
