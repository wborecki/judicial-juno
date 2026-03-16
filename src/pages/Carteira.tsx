import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUsuarios } from "@/hooks/useEquipes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wallet, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_CARTEIRA_OPTIONS = [
  { value: "habilitacao", label: "Em Habilitação" },
  { value: "aguardando_pagamento", label: "Aguardando Pagamento" },
  { value: "recebido_parcial", label: "Recebido Parcial" },
  { value: "recebido", label: "Recebido" },
  { value: "inadimplente", label: "Inadimplente" },
];

const STATUS_COLORS: Record<string, string> = {
  habilitacao: "bg-info/10 text-info",
  aguardando_pagamento: "bg-warning/10 text-warning",
  recebido_parcial: "bg-accent/20 text-accent-foreground",
  recebido: "bg-success/10 text-success",
  inadimplente: "bg-destructive/10 text-destructive",
};

type CarteiraItem = {
  id: string;
  titulo: string | null;
  processo_id: string | null;
  pessoa_id: string | null;
  valor_proposta: number | null;
  valor_fechamento: number | null;
  valor_face: number | null;
  desagio_percentual: number | null;
  status_carteira: string | null;
  data_fechamento: string | null;
  responsavel_id: string | null;
  processos?: { numero_processo: string; tribunal: string } | null;
  pessoas?: { nome: string } | null;
};

function useCarteira() {
  return useQuery({
    queryKey: ["carteira"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("negocios")
        .select("id, titulo, processo_id, pessoa_id, valor_proposta, valor_fechamento, valor_face, desagio_percentual, status_carteira, data_fechamento, responsavel_id, processos(numero_processo, tribunal), pessoas(nome)")
        .eq("negocio_status", "ganho")
        .order("data_fechamento", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CarteiraItem[];
    },
  });
}

export default function Carteira() {
  const { data: items = [], isLoading } = useCarteira();
  const { data: usuarios } = useUsuarios();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filterStatus !== "all" && item.status_carteira !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          item.titulo?.toLowerCase().includes(q) ||
          item.processos?.numero_processo?.toLowerCase().includes(q) ||
          item.pessoas?.nome?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [items, search, filterStatus]);

  const totalInvestido = filtered.reduce((s, i) => s + (i.valor_fechamento ?? 0), 0);
  const totalFace = filtered.reduce((s, i) => s + (i.valor_face ?? 0), 0);

  const getUsuario = (id: string | null) => (usuarios ?? []).find(u => u.id === id);

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full" />
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-4">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-muted-foreground" />
            Carteira de Créditos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} crédito(s) adquirido(s) — Investido: {totalInvestido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} — Valor de Face: {totalFace.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por processo, pessoa..." className="h-8 pl-8 text-xs" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {STATUS_CARTEIRA_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-h-0 glass-card rounded-xl overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="text-[11px]">Processo</TableHead>
              <TableHead className="text-[11px]">Titular</TableHead>
              <TableHead className="text-[11px]">Título</TableHead>
              <TableHead className="text-[11px] text-right">Valor Face</TableHead>
              <TableHead className="text-[11px] text-right">Valor Compra</TableHead>
              <TableHead className="text-[11px] text-right">Deságio</TableHead>
              <TableHead className="text-[11px]">Status Carteira</TableHead>
              <TableHead className="text-[11px]">Fechamento</TableHead>
              <TableHead className="text-[11px] w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                  Nenhum crédito na carteira.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(item => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-accent/5" onClick={() => navigate(`/negocios/${item.id}`)}>
                <TableCell className="text-xs font-mono">{item.processos?.numero_processo ?? "—"}</TableCell>
                <TableCell className="text-xs">{item.pessoas?.nome ?? "—"}</TableCell>
                <TableCell className="text-xs font-medium">{item.titulo ?? "—"}</TableCell>
                <TableCell className="text-xs text-right">{item.valor_face?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{item.valor_fechamento?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}</TableCell>
                <TableCell className="text-xs text-right">{item.desagio_percentual ? `${item.desagio_percentual.toFixed(1)}%` : "—"}</TableCell>
                <TableCell>
                  {item.status_carteira ? (
                    <Badge className={cn("text-[10px]", STATUS_COLORS[item.status_carteira] ?? "")}>
                      {STATUS_CARTEIRA_OPTIONS.find(s => s.value === item.status_carteira)?.label ?? item.status_carteira}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.data_fechamento ? format(new Date(item.data_fechamento), "dd/MM/yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
