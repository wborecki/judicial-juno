import { NegocioWithRelations, useUpdateNegocio } from "@/hooks/useNegocios";
import { PipelineEtapa } from "@/hooks/useNegocioPipelines";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { DragEvent, useState } from "react";
import { toast } from "sonner";

function formatCurrency(v?: number | null) {
  if (v == null) return "";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  negocios: NegocioWithRelations[];
  etapas: PipelineEtapa[];
}

export default function NegocioKanban({ negocios, etapas }: Props) {
  const navigate = useNavigate();
  const updateNegocio = useUpdateNegocio();
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);

  const grouped = etapas.map((etapa) => ({
    etapa,
    items: negocios
      .filter((n) => n.pipeline_etapa === etapa.id && n.negocio_status === "em_andamento")
      .sort((a, b) => a.ordem_kanban - b.ordem_kanban),
  }));

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
        onSuccess: () => toast.success("Negócio movido para " + etapas.find(e => e.id === etapaId)?.nome),
        onError: () => toast.error("Erro ao mover negócio"),
      }
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {grouped.map(({ etapa, items }) => (
          <div
            key={etapa.id}
            className="w-72 flex-shrink-0 flex flex-col rounded-xl bg-muted/40 border"
            onDragOver={(e) => { e.preventDefault(); setDragOverEtapa(etapa.id); }}
            onDragLeave={() => setDragOverEtapa(null)}
            onDrop={(e) => handleDrop(e, etapa.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: etapa.cor }} />
                <span className="text-sm font-semibold">{etapa.nome}</span>
              </div>
              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
            </div>

            {/* Cards */}
            <div
              className={`flex-1 p-2 space-y-2 min-h-[120px] transition-colors ${
                dragOverEtapa === etapa.id ? "bg-accent/30" : ""
              }`}
            >
              {items.map((n) => (
                <Card
                  key={n.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, n.id)}
                  onClick={() => navigate(`/negocios/${n.id}`)}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow space-y-1.5"
                >
                  <p className="text-sm font-medium leading-tight">{n.titulo || "Sem título"}</p>
                  {n.pessoas?.nome && (
                    <p className="text-xs text-muted-foreground truncate">{n.pessoas.nome}</p>
                  )}
                  {n.valor_proposta != null && (
                    <p className="text-xs font-semibold text-primary">{formatCurrency(n.valor_proposta)}</p>
                  )}
                  {n.processos?.numero_processo && (
                    <p className="text-[10px] font-mono text-muted-foreground">{n.processos.numero_processo}</p>
                  )}
                </Card>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhum negócio</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
