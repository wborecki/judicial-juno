import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcessosEmAnalise, useTrocarAnalista } from "@/hooks/useDistribuicao";
import { useEquipes, useUsuarios, useEquipeMembros } from "@/hooks/useEquipes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSearch } from "lucide-react";
import { toast } from "sonner";

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  distribuido: { label: "Aguardando Análise", className: "bg-warning/10 text-warning border-warning/20" },
  em_analise: { label: "Em Análise", className: "bg-info/10 text-info border-info/20" },
};

export default function Analise() {
  const navigate = useNavigate();
  const { data: processos, isLoading } = useProcessosEmAnalise();
  const { data: equipes } = useEquipes();
  const { data: usuarios } = useUsuarios();
  const { data: membros } = useEquipeMembros();
  const trocar = useTrocarAnalista();

  const [filterEquipe, setFilterEquipe] = useState("all");
  const [filterAnalista, setFilterAnalista] = useState("all");

  const getUsuario = (id: string | null) => (usuarios ?? []).find(u => u.id === id);
  const getEquipe = (id: string | null) => (equipes ?? []).find(e => e.id === id);

  const initials = (nome: string) => nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const handleTrocarAnalista = async (processoId: string, newAnalistaId: string) => {
    try {
      await trocar.mutateAsync({ id: processoId, analista_id: newAnalistaId });
      toast.success("Analista atualizado");
    } catch {
      toast.error("Erro ao trocar analista");
    }
  };

  const filtered = (processos ?? []).filter(p => {
    if (filterEquipe !== "all" && p.equipe_id !== filterEquipe) return false;
    if (filterAnalista !== "all" && p.analista_id !== filterAnalista) return false;
    return true;
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-muted-foreground" />
          Análise
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} processo(s) em análise</p>
      </div>

      <div className="shrink-0 flex gap-2">
        <Select value={filterEquipe} onValueChange={setFilterEquipe}>
          <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue placeholder="Equipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Equipes</SelectItem>
            {(equipes ?? []).map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAnalista} onValueChange={setFilterAnalista}>
          <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue placeholder="Analista" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Analistas</SelectItem>
            {(usuarios ?? []).filter(u => u.ativo).map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-h-0 glass-card rounded-xl overflow-hidden flex flex-col">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nº CNJ</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">Tribunal</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Natureza</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor Est.</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Equipe</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Analista</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Distribuído em</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[180px]">Trocar Analista</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">Nenhum processo em análise.</TableCell></TableRow>
              )}
              {filtered.map(p => {
                const analista = getUsuario(p.analista_id);
                const equipe = getEquipe(p.equipe_id);
                const badge = STATUS_BADGE[p.pipeline_status] ?? STATUS_BADGE.distribuido;
                const equipeMembrosIds = (membros ?? []).filter(m => m.equipe_id === p.equipe_id).map(m => m.usuario_id);
                const analistaOptions = (usuarios ?? []).filter(u => u.ativo && equipeMembrosIds.includes(u.id));

                return (
                  <TableRow key={p.id} className="h-9 border-border/20 hover:bg-accent/5 cursor-pointer" onClick={() => navigate(`/processos/${p.id}`)}>
                    <TableCell className="font-mono text-[11px] font-medium">{p.numero_processo}</TableCell>
                    <TableCell className="w-16"><Badge variant="secondary" className="text-[10px]">{p.tribunal}</Badge></TableCell>
                    <TableCell className="text-[11px]">{p.natureza}</TableCell>
                    <TableCell className="text-[11px] font-medium text-right">{formatCurrency(p.valor_estimado)}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${badge.className}`}>{badge.label}</Badge></TableCell>
                    <TableCell className="text-[11px]">{equipe?.nome ?? "—"}</TableCell>
                    <TableCell>
                      {analista ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initials(analista.nome)}</AvatarFallback>
                          </Avatar>
                          <span className="text-[11px]">{analista.nome}</span>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{formatDate(p.distribuido_em)}</TableCell>
                    <TableCell className="w-[180px]" onClick={e => e.stopPropagation()}>
                      <Select value={p.analista_id ?? ""} onValueChange={(v) => handleTrocarAnalista(p.id, v)}>
                        <SelectTrigger className="h-7 text-[10px] w-full"><SelectValue placeholder="Trocar" /></SelectTrigger>
                        <SelectContent>
                          {analistaOptions.map(u => (
                            <SelectItem key={u.id} value={u.id} className="text-xs">{u.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
