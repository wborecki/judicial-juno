import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useCreateNegocio } from "@/hooks/useNegocios";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

interface Props {
  processo: Processo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalConverter({ processo, open, onOpenChange }: Props) {
  const createNegocio = useCreateNegocio();
  const updateProcesso = useUpdateProcesso();
  const [tipoServico, setTipoServico] = useState("compra_credito");
  const [observacoes, setObservacoes] = useState("");

  const handleConverter = async () => {
    try {
      // Mark as apto if not already
      if (processo.triagem_resultado !== "apto") {
        await updateProcesso.mutateAsync({
          id: processo.id,
          updates: {
            triagem_resultado: "apto",
            triagem_data: new Date().toISOString(),
          },
        });
      }

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
        observacoes: observacoes.trim() || null,
      });

      toast.success("Negócio criado com sucesso!");
      setObservacoes("");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao criar negócio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Converter em Negócio
          </DialogTitle>
          <DialogDescription className="text-xs">
            O processo será marcado como Apto e um novo negócio será criado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do processo */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CNJ</span>
              <span className="font-mono font-medium">{processo.numero_processo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tribunal</span>
              <span>{processo.tribunal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Estimado</span>
              <span className="font-semibold text-primary">{formatCurrency(processo.valor_estimado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Autor</span>
              <span className="truncate max-w-[200px]">{processo.parte_autora}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de Serviço</Label>
            <Select value={tipoServico} onValueChange={setTipoServico}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Notas sobre a conversão..."
              className="resize-none h-16 text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancelar</Button>
          <Button
            size="sm"
            onClick={handleConverter}
            disabled={createNegocio.isPending || updateProcesso.isPending}
            className="text-xs gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Converter em Negócio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
