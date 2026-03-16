import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, XCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";

const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_acompanhamento: "Em Acompanhamento",
  convertido: "Convertido",
  descartado: "Descartado",
};

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

interface Props {
  processo: Processo;
}

export default function TabTriagem({ processo }: Props) {
  const updateProcesso = useUpdateProcesso();
  const [triageObs, setTriageObs] = useState(processo.triagem_observacoes ?? "");
  const [motivoInaptidao, setMotivoInaptidao] = useState(processo.triagem_motivo_inaptidao ?? "");

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
      toast.error("Erro ao atualizar processo");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">Análise e Triagem</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Resultado Atual</p>
            <p className="font-medium">{TRIAGEM_LABELS[triagem]}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Data Triagem</p>
            <p className="font-medium">{formatDate(processo.triagem_data)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Captação</p>
            <p className="font-medium">{formatDate(processo.data_captacao)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Distribuição</p>
            <p className="font-medium">{formatDate(processo.data_distribuicao)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Observações da análise</Label>
          <Textarea
            value={triageObs}
            onChange={e => setTriageObs(e.target.value)}
            placeholder="Observações da análise..."
            className="resize-none h-16 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Motivo de inaptidão (obrigatório se descartar)</Label>
          <Input
            value={motivoInaptidao}
            onChange={e => setMotivoInaptidao(e.target.value)}
            placeholder="Ex: Processo sem trânsito em julgado, valor abaixo do mínimo..."
            className="h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => handleTriagem("em_acompanhamento")} variant="outline" size="sm" className="border-info/30 text-info hover:bg-info/10 text-xs gap-1.5" disabled={updateProcesso.isPending}>
            <Eye className="w-3.5 h-3.5" />Acompanhar
          </Button>
          <Button onClick={() => handleTriagem("descartado")} variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-1.5" disabled={updateProcesso.isPending}>
            <XCircle className="w-3.5 h-3.5" />Descartar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
