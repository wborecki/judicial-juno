import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, RotateCcw, Briefcase, Plus } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useNegocios, useCreateNegocio, NegocioDB } from "@/hooks/useNegocios";

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};
const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente", apto: "Apto", descartado: "Descartado", "reanálise": "Reanálise",
};

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito",
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

export default function PainelTriagem({ processo }: Props) {
  const updateProcesso = useUpdateProcesso();
  const { data: negocios = [] } = useNegocios(processo.id);
  const createNegocio = useCreateNegocio();

  const [triageObs, setTriageObs] = useState(processo.triagem_observacoes ?? "");
  const [motivoInaptidao, setMotivoInaptidao] = useState(processo.triagem_motivo_inaptidao ?? "");
  const [tipoServico, setTipoServico] = useState("compra_credito");

  useEffect(() => {
    setTriageObs(processo.triagem_observacoes ?? "");
    setMotivoInaptidao(processo.triagem_motivo_inaptidao ?? "");
  }, [processo]);

  const triagem = processo.triagem_resultado ?? "pendente";

  const handleTriagem = async (resultado: string) => {
    if (resultado === "descartado" && !motivoInaptidao.trim()) {
      return toast.error("Motivo de inaptidão é obrigatório para descartar");
    }
    try {
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          triagem_resultado: resultado,
          triagem_observacoes: triageObs,
          triagem_data: new Date().toISOString(),
          triagem_motivo_inaptidao: resultado === "descartado" ? motivoInaptidao : null,
        },
      });
      toast.success(`Processo marcado como ${TRIAGEM_LABELS[resultado]}`);
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleCriarNegocio = async () => {
    try {
      await createNegocio.mutateAsync({
        processo_id: processo.id,
        pessoa_id: processo.pessoa_id,
        tipo_servico: tipoServico,
        negocio_status: "em_andamento",
        valor_proposta: processo.valor_estimado,
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
    <div className="space-y-4 lg:sticky lg:top-4">
      {/* Triagem Section */}
      <div className="bg-card border border-border/40 rounded-xl p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triagem</h3>
          <Badge className={`text-[10px] ${TRIAGEM_COLORS[triagem]}`}>
            {TRIAGEM_LABELS[triagem]}
          </Badge>
        </div>

        {processo.triagem_data && (
          <p className="text-[10px] text-muted-foreground">Última triagem: {formatDate(processo.triagem_data)}</p>
        )}

        <div className="space-y-1.5">
          <Label className="text-[11px]">Observações</Label>
          <Textarea
            value={triageObs}
            onChange={e => setTriageObs(e.target.value)}
            placeholder="Observações da análise..."
            className="resize-none h-20 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px]">Motivo inaptidão {triagem === "descartado" && <span className="text-destructive">*</span>}</Label>
          <Input
            value={motivoInaptidao}
            onChange={e => setMotivoInaptidao(e.target.value)}
            placeholder="Obrigatório se inapto..."
            className="h-8 text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Button onClick={() => handleTriagem("apto")} size="sm" className="w-full bg-success hover:bg-success/90 text-success-foreground text-xs gap-1.5 h-8" disabled={updateProcesso.isPending}>
            <CheckCircle2 className="w-3.5 h-3.5" />Marcar Apto
          </Button>
          <Button onClick={() => handleTriagem("descartado")} variant="outline" size="sm" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-1.5 h-8" disabled={updateProcesso.isPending}>
            <XCircle className="w-3.5 h-3.5" />Marcar Inapto
          </Button>
          <Button onClick={() => handleTriagem("reanálise")} variant="outline" size="sm" className="w-full border-info/30 text-info hover:bg-info/10 text-xs gap-1.5 h-8" disabled={updateProcesso.isPending}>
            <RotateCcw className="w-3.5 h-3.5" />Reanálise
          </Button>
        </div>
      </div>

      {/* Conversão Section */}
      <div className="bg-card border border-border/40 rounded-xl p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversão</h3>

        {negocios.length > 0 && (
          <div className="space-y-1.5">
            {negocios.map(n => (
              <NegocioMini key={n.id} negocio={n} />
            ))}
          </div>
        )}

        {triagem === "apto" ? (
          <>
            <Separator />
            <div className="space-y-2">
              <Select value={tipoServico} onValueChange={setTipoServico}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleCriarNegocio} disabled={createNegocio.isPending} className="w-full text-xs gap-1.5 h-8">
                <Plus className="w-3.5 h-3.5" />Criar Negócio
              </Button>
            </div>
          </>
        ) : (
          <p className="text-[10px] text-muted-foreground">Marque como Apto para criar negócio.</p>
        )}
      </div>
    </div>
  );
}

function NegocioMini({ negocio }: { negocio: NegocioDB }) {
  const statusLabel = negocio.negocio_status === "ganho" ? "Ganho" : negocio.negocio_status === "perdido" ? "Perdido" : "Em Andamento";
  const statusColor = negocio.negocio_status === "ganho" ? "bg-success/10 text-success" : negocio.negocio_status === "perdido" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";

  return (
    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/30 border border-border/30">
      <div className="flex items-center gap-2">
        <Briefcase className="w-3 h-3 text-muted-foreground" />
        <Badge variant="secondary" className={`text-[9px] ${statusColor}`}>{statusLabel}</Badge>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {negocio.tipo_servico ? TIPO_SERVICO_LABELS[negocio.tipo_servico] ?? negocio.tipo_servico : "—"}
      </span>
    </div>
  );
}
