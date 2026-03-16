import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NegocioWithRelations } from "@/hooks/useNegocios";
import { PipelineEtapa } from "@/hooks/useNegocioPipelines";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

const STATUS_COLORS: Record<string, string> = {
  em_andamento: "bg-primary/10 text-primary",
  ganho: "bg-success/10 text-success",
  perdido: "bg-destructive/10 text-destructive",
};

function formatCurrency(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  negocios: NegocioWithRelations[];
  etapas: PipelineEtapa[];
}

export default function NegocioListTable({ negocios, etapas }: Props) {
  const navigate = useNavigate();
  const etapaMap = Object.fromEntries(etapas.map((e) => [e.id, e]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Título</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Processo</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Pessoa</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Serviço</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Etapa</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Status</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-right">Valor</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Responsável</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold">Abertura</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {negocios.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
              Nenhum negócio encontrado.
            </TableCell>
          </TableRow>
        )}
        {negocios.map((n) => {
          const etapa = etapaMap[n.pipeline_etapa];
          return (
            <TableRow
              key={n.id}
              className="cursor-pointer"
              onClick={() => navigate(`/negocios/${n.id}`)}
            >
              <TableCell className="font-medium">{n.titulo || "Sem título"}</TableCell>
              <TableCell className="text-xs font-mono">{n.processos?.numero_processo ?? "—"}</TableCell>
              <TableCell>{n.pessoas?.nome ?? "—"}</TableCell>
              <TableCell className="text-xs">{TIPO_SERVICO_LABELS[n.tipo_servico ?? ""] ?? "—"}</TableCell>
              <TableCell>
                {etapa ? (
                  <Badge variant="outline" style={{ borderColor: etapa.cor, color: etapa.cor }}>
                    {etapa.nome}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">{n.pipeline_etapa}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[n.negocio_status] ?? ""} variant="secondary">
                  {n.negocio_status === "em_andamento" ? "Em andamento" : n.negocio_status === "ganho" ? "Ganho" : "Perdido"}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(n.valor_proposta)}</TableCell>
              <TableCell className="text-sm">{n.usuarios?.nome ?? "—"}</TableCell>
              <TableCell className="text-xs">{format(new Date(n.data_abertura), "dd/MM/yyyy")}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
