import { ProcessoLead } from "@/lib/types";
import { ProcessStatusBadge, TriageBadge } from "./StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

interface ProcessTableProps {
  processos: ProcessoLead[];
  onSelect: (p: ProcessoLead) => void;
}

export function ProcessTable({ processos, onSelect }: ProcessTableProps) {
  const formatCurrency = (v?: number) =>
    v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
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
          {processos.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                Nenhum processo encontrado.
              </TableCell>
            </TableRow>
          )}
          {processos.map((p, i) => (
            <TableRow
              key={p.id}
              className="cursor-pointer border-border/30 hover:bg-accent/5 transition-colors animate-fade-in"
              style={{ animationDelay: `${300 + i * 50}ms` }}
              onClick={() => onSelect(p)}
            >
              <TableCell className="font-mono text-xs">{p.numeroProcesso}</TableCell>
              <TableCell>
                <span className="text-xs font-medium bg-primary/5 text-primary px-2 py-1 rounded">
                  {p.tribunal}
                </span>
              </TableCell>
              <TableCell className="text-sm">{p.parteAutora}</TableCell>
              <TableCell><ProcessStatusBadge status={p.status} /></TableCell>
              <TableCell>
                <span className={p.transitoJulgado ? "text-success text-xs font-medium" : "text-muted-foreground text-xs"}>
                  {p.transitoJulgado ? "Sim" : "Não"}
                </span>
              </TableCell>
              <TableCell className="text-sm font-medium">{formatCurrency(p.valorEstimado)}</TableCell>
              <TableCell><TriageBadge triagem={p.triagem} /></TableCell>
              <TableCell>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
