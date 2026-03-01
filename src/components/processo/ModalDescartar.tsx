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
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useMotivosDescarte } from "@/hooks/useMotivosDescarte";

interface Props {
  processo: Processo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalDescartar({ processo, open, onOpenChange }: Props) {
  const updateProcesso = useUpdateProcesso();
  const { data: motivos = [] } = useMotivosDescarte();
  const [motivoId, setMotivoId] = useState("");
  const [observacoes, setObservacoes] = useState(processo.triagem_observacoes ?? "");

  const motivoSelecionado = motivos.find(m => m.id === motivoId);

  const handleDescartar = async () => {
    if (!motivoId) return toast.error("Selecione um motivo");

    try {
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          triagem_resultado: "descartado",
          triagem_data: new Date().toISOString(),
          triagem_motivo_inaptidao: motivoSelecionado?.nome ?? "",
          triagem_observacoes: observacoes.trim() || null,
        } as any,
      });
      toast.success("Processo descartado");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao descartar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2 text-destructive">
            <XCircle className="w-4 h-4" />
            Descartar Processo
          </DialogTitle>
          <DialogDescription className="text-xs">
            Informe o motivo pelo qual este processo não é apto para conversão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 text-xs">
            <span className="font-mono font-medium">{processo.numero_processo}</span>
            <span className="text-muted-foreground ml-2">• {processo.tribunal}</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Motivo do Descarte <span className="text-destructive">*</span></Label>
            <Select value={motivoId} onValueChange={setMotivoId}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione um motivo..." /></SelectTrigger>
              <SelectContent>
                {motivos.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <div>
                      <span>{m.nome}</span>
                      {m.descricao && <span className="text-muted-foreground ml-1">— {m.descricao}</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="resize-none h-16 text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancelar</Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDescartar}
            disabled={!motivoId || updateProcesso.isPending}
            className="text-xs gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Descartar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
