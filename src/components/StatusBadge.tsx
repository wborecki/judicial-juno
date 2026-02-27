import { cn } from "@/lib/utils";
import { ProcessStatus, TriageResult, STATUS_LABELS } from "@/lib/types";

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  return (
    <span className={cn(
      "status-badge",
      status >= 3
        ? "bg-success/10 text-success"
        : "bg-muted text-muted-foreground"
    )}>
      S{status} - {STATUS_LABELS[status]}
    </span>
  );
}

export function TriageBadge({ triagem }: { triagem: TriageResult }) {
  const styles: Record<TriageResult, string> = {
    pendente: "bg-warning/10 text-warning",
    apto: "bg-success/10 text-success",
    descartado: "bg-destructive/10 text-destructive",
    "reanálise": "bg-info/10 text-info",
  };

  const labels: Record<TriageResult, string> = {
    pendente: "Pendente",
    apto: "Apto",
    descartado: "Descartado",
    "reanálise": "Reanálise",
  };

  return (
    <span className={cn("status-badge", styles[triagem])}>
      {labels[triagem]}
    </span>
  );
}
