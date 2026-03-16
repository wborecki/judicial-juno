import { useState } from "react";
import { ProcessoLead, STATUS_LABELS, TriageResult, NaturezaProcesso, TipoPagamento, TRIBUNAIS, ProcessStatus } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProcessStatusBadge, TriageBadge } from "./StatusBadge";
import { CheckCircle2, XCircle, RotateCcw, Scale, FileText, Banknote, Gavel } from "lucide-react";

interface TriageModalProps {
  processo: ProcessoLead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ProcessoLead>) => void;
}

export function TriageModal({ processo, open, onClose, onUpdate }: TriageModalProps) {
  const [tribunal, setTribunal] = useState("");
  const [natureza, setNatureza] = useState<NaturezaProcesso | "">("");
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento | "">("");
  const [status, setStatus] = useState<string>("");
  const [transitoJulgado, setTransitoJulgado] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const handleOpen = () => {
    if (processo) {
      setTribunal(processo.tribunal);
      setNatureza(processo.natureza);
      setTipoPagamento(processo.tipoPagamento);
      setStatus(String(processo.status));
      setTransitoJulgado(processo.transitoJulgado);
      setObservacoes(processo.observacoes ?? "");
    }
  };

  const handleTriagem = (triagem: TriageResult) => {
    if (!processo) return;
    onUpdate(processo.id, {
      tribunal: tribunal || processo.tribunal,
      natureza: (natureza as NaturezaProcesso) || processo.natureza,
      tipoPagamento: (tipoPagamento as TipoPagamento) || processo.tipoPagamento,
      status: (Number(status) as ProcessStatus) || processo.status,
      transitoJulgado,
      observacoes,
      triagem,
    });
    onClose();
  };

  if (!processo) return null;

  const formatCurrency = (v?: number) =>
    v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); else handleOpen(); }}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="font-display text-lg">Triagem do Processo</SheetTitle>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{processo.numeroProcesso}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Info header */}
          <div className="grid grid-cols-1 gap-3 p-3 rounded-lg bg-muted/50 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Titular do Crédito</p>
              <p className="font-medium">{processo.parteAutora}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Devedor</p>
              <p className="font-medium">{processo.parteRe}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Valor Estimado</p>
              <p className="font-medium">{formatCurrency(processo.valorEstimado)}</p>
            </div>
          </div>

          {/* Triage fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" /> Tribunal
              </Label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIBUNAIS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Natureza
              </Label>
              <Select value={natureza} onValueChange={(v) => setNatureza(v as NaturezaProcesso)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"] as NaturezaProcesso[]).map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> Tipo de Pagamento
              </Label>
              <Select value={tipoPagamento} onValueChange={(v) => setTipoPagamento(v as TipoPagamento)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RPV">RPV</SelectItem>
                  <SelectItem value="Precatório">Precatório</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Status do Processo</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {([1, 2, 3, 4] as ProcessStatus[]).map(s => (
                    <SelectItem key={s} value={String(s)}>S{s} - {STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label className="text-sm font-medium">Trânsito em Julgado</Label>
              <p className="text-xs text-muted-foreground">O processo possui trânsito em julgado?</p>
            </div>
            <Switch checked={transitoJulgado} onCheckedChange={setTransitoJulgado} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas sobre o processo..."
              className="resize-none h-20"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleTriagem("apto")}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Apto
            </Button>
            <Button
              onClick={() => handleTriagem("reanálise")}
              variant="outline"
              className="flex-1 border-info/30 text-info hover:bg-info/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reanálise
            </Button>
            <Button
              onClick={() => handleTriagem("descartado")}
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Descartar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
