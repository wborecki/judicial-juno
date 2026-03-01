import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNegocios, useCreateNegocio, NegocioDB } from "@/hooks/useNegocios";
import { Processo } from "@/hooks/useProcessos";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

interface Props {
  processo: Processo;
}

export default function TabNegocios({ processo }: Props) {
  const { data: negocios = [] } = useNegocios(processo.id);
  const createNegocio = useCreateNegocio();
  const [tipoServico, setTipoServico] = useState("compra_credito");

  const handleCreate = async () => {
    try {
      await createNegocio.mutateAsync({
        processo_id: processo.id,
        pessoa_id: processo.pessoa_id,
        tipo_servico: tipoServico,
        negocio_status: "em_andamento",
        valor_proposta: null,
        valor_fechamento: null,
        data_abertura: new Date().toISOString(),
        data_fechamento: null,
        responsavel_id: null,
        observacoes: null,
      });
      toast.success("Negócio criado");
    } catch {
      toast.error("Erro ao criar negócio");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          Negócios Vinculados
          {negocios.length > 0 && <Badge variant="secondary" className="text-[10px]">{negocios.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {negocios.length > 0 && (
          <div className="space-y-2">
            {negocios.map(n => <NegocioRow key={n.id} negocio={n} />)}
          </div>
        )}
        <Separator />
        <div className="flex items-center gap-2">
          <Select value={tipoServico} onValueChange={setTipoServico}>
            <SelectTrigger className="h-8 text-xs w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleCreate} disabled={createNegocio.isPending} className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />Criar Negócio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NegocioRow({ negocio }: { negocio: NegocioDB }) {
  const statusLabel = negocio.negocio_status === "ganho" ? "Ganho" : negocio.negocio_status === "perdido" ? "Perdido" : "Em Andamento";
  const statusColor = negocio.negocio_status === "ganho" ? "bg-success/10 text-success" : negocio.negocio_status === "perdido" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent-foreground";

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30">
      <div className="flex items-center gap-3 text-xs">
        <Badge variant="secondary" className={`text-[10px] ${statusColor}`}>{statusLabel}</Badge>
        <span className="font-medium">{negocio.tipo_servico ? TIPO_SERVICO_LABELS[negocio.tipo_servico] ?? negocio.tipo_servico : "Sem tipo"}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {negocio.valor_proposta && <span>{formatCurrency(negocio.valor_proposta)}</span>}
        <span>{formatDate(negocio.data_abertura)}</span>
      </div>
    </div>
  );
}
