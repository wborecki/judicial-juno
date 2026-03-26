import { useState, useEffect, useCallback } from "react";
import { Gavel, Check, Circle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  "Compactando dados da dívida",
  "Acessando tribunal",
  "Identificando autos",
  "Anexando dívida ao processo",
  "Finalizado",
];

interface InformarDividaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acompanhamento: {
    id: string;
    cpf_cnpj: string;
    pessoas?: { nome?: string } | null;
  } | null;
}

export default function InformarDividaDialog({ open, onOpenChange, acompanhamento }: InformarDividaDialogProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [finished, setFinished] = useState(false);

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setFinished(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    // Start the sequence
    setCurrentStep(0);
    setFinished(false);

    const timers: NodeJS.Timeout[] = [];
    STEPS.forEach((_, i) => {
      if (i === 0) return; // already set
      timers.push(
        setTimeout(() => {
          setCurrentStep(i);
          if (i === STEPS.length - 1) {
            setFinished(true);
          }
        }, (i) * 2000)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [open, reset]);

  const progress = currentStep < 0 ? 0 : Math.round(((currentStep + (finished ? 1 : 0.5)) / STEPS.length) * 100);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v || finished) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            Informar Dívida ao Tribunal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stepper */}
          <div className="space-y-3">
            {STEPS.map((label, i) => {
              const isCompleted = i < currentStep || finished;
              const isActive = i === currentStep && !finished;
              const isPending = i > currentStep;

              return (
                <div key={i} className="flex items-center gap-3">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                      <Circle className="w-3 h-3 text-muted-foreground/30" />
                    </div>
                  )}
                  <span className={`text-sm ${isCompleted ? "text-foreground font-medium" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}{isActive ? "..." : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Debtor info */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-0.5">
            <p className="text-xs text-muted-foreground">Devedor</p>
            <p className="text-sm font-medium">{acompanhamento?.pessoas?.nome || "—"}</p>
            <p className="text-xs font-mono text-muted-foreground">{acompanhamento?.cpf_cnpj}</p>
          </div>
        </div>

        <DialogFooter>
          {finished ? (
            <Button onClick={() => onOpenChange(false)}>
              <Check className="w-4 h-4 mr-1" />
              Concluído
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
