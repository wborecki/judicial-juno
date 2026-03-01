import { NegocioWithRelations, useUpdateNegocio } from "@/hooks/useNegocios";
import { PipelineEtapa } from "@/hooks/useNegocioPipelines";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { DragEvent, useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";

function formatCurrency(v?: number | null) {
  if (v == null) return "";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const PRIORITY_COLORS: Record<string, string> = {
  alta: "text-red-500",
  media: "text-amber-500",
  baixa: "text-muted-foreground/40",
};

interface Props {
  negocios: NegocioWithRelations[];
  etapas: PipelineEtapa[];
}

export default function NegocioKanban({ negocios, etapas }: Props) {
  const navigate = useNavigate();
  const updateNegocio = useUpdateNegocio();
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);

  const grouped = etapas.map((etapa) => {
    const items = negocios
      .filter((n) => n.pipeline_etapa === etapa.id && n.negocio_status === "em_andamento")
      .sort((a, b) => a.ordem_kanban - b.ordem_kanban);
    const totalValue = items.reduce((sum, n) => sum + (n.valor_proposta ?? 0), 0);
    return { etapa, items, totalValue };
  });

  function handleDragStart(e: DragEvent, negocioId: string) {
    e.dataTransfer.setData("negocio-id", negocioId);
  }

  function handleDrop(e: DragEvent, etapaId: string) {
    e.preventDefault();
    setDragOverEtapa(null);
    const negocioId = e.dataTransfer.getData("negocio-id");
    if (!negocioId) return;
    const neg = negocios.find((n) => n.id === negocioId);
    if (!neg || neg.pipeline_etapa === etapaId) return;
    updateNegocio.mutate(
      { id: negocioId, updates: { pipeline_etapa: etapaId } },
      {
        onSuccess: () =>
          toast.success("Movido para " + etapas.find((e) => e.id === etapaId)?.nome),
        onError: () => toast.error("Erro ao mover negócio"),
      }
    );
  }

  return (
    <ScrollArea className="w-full flex-1">
      <div className="flex gap-2 pb-4 min-w-max h-[calc(100vh-10rem)]">
        {grouped.map(({ etapa, items, totalValue }) => (
          <div
            key={etapa.id}
            className="w-64 flex-shrink-0 flex flex-col rounded-lg bg-muted/30 border overflow-hidden"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverEtapa(etapa.id);
            }}
            onDragLeave={() => setDragOverEtapa(null)}
            onDrop={(e) => handleDrop(e, etapa.id)}
          >
            {/* Color bar */}
            <div className="h-1 w-full" style={{ backgroundColor: etapa.cor }} />

            {/* Column header */}
            <div className="px-3 py-2 border-b bg-background/60">
              <p className="text-xs font-bold uppercase tracking-wide truncate">
                {etapa.nome}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatCurrency(totalValue) || "R$ 0"} · {items.length}{" "}
                {items.length === 1 ? "negócio" : "negócios"}
              </p>
            </div>

            {/* Cards area — scrollable */}
            <div
              className={`flex-1 overflow-y-auto p-1.5 space-y-1.5 transition-colors ${
                dragOverEtapa === etapa.id ? "bg-accent/20" : ""
              }`}
            >
              {items.map((n) => (
                <div
                  key={n.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, n.id)}
                  onClick={() => navigate(`/negocios/${n.id}`)}
                  className="bg-card border rounded-md p-2.5 cursor-pointer hover:shadow-md transition-shadow space-y-1 group"
                >
                  {/* Title */}
                  <p className="text-[13px] font-semibold leading-snug truncate">
                    {n.titulo || n.pessoas?.nome || "Sem título"}
                  </p>

                  {/* Process number */}
                  {n.processos?.numero_processo && (
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {n.processos.numero_processo}
                    </p>
                  )}

                  {/* Value */}
                  {n.valor_proposta != null && n.valor_proposta > 0 && (
                    <p className="text-xs font-bold text-primary">
                      {formatCurrency(n.valor_proposta)}
                    </p>
                  )}

                  {/* Footer: avatar + priority */}
                  <div className="flex items-center justify-between pt-1">
                    <Avatar className="h-5 w-5 text-[9px]">
                      <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
                        {initials(n.usuarios?.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <Flag
                      className={`w-3 h-3 ${PRIORITY_COLORS[n.prioridade] ?? "text-muted-foreground/40"}`}
                    />
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-10">
                  Nenhum negócio
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
