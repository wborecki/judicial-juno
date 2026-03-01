import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, StickyNote, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useProcessoNotas, useCreateProcessoNota, useDeleteProcessoNota } from "@/hooks/useProcessoNotas";

interface Props {
  processoId: string;
}

const PAGE_SIZE = 10;

export default function TabNotas({ processoId }: Props) {
  const { data: notas = [], isLoading } = useProcessoNotas(processoId);
  const createNota = useCreateProcessoNota();
  const deleteNota = useDeleteProcessoNota();

  const [conteudo, setConteudo] = useState("");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(notas.length / PAGE_SIZE);
  const paged = useMemo(() => notas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [notas, page]);

  const handleAdd = async () => {
    const text = conteudo.trim();
    if (!text) return;
    try {
      await createNota.mutateAsync({ processo_id: processoId, conteudo: text });
      setConteudo("");
      toast.success("Nota adicionada");
    } catch {
      toast.error("Erro ao adicionar nota");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNota.mutateAsync({ id, processoId });
      toast.success("Nota removida");
    } catch {
      toast.error("Erro ao remover nota");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
      {/* Input area */}
      <div className="space-y-2">
        <Textarea
          placeholder="Escreva uma nota interna..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          className="min-h-[80px] text-sm bg-background"
        />
        <Button size="sm" onClick={handleAdd} disabled={createNota.isPending || !conteudo.trim()} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />Salvar Nota
        </Button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : notas.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhuma nota interna ainda.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {paged.map((nota, i) => (
            <div
              key={nota.id}
              className={`py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors group ${i < paged.length - 1 ? "border-b border-border/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm whitespace-pre-wrap flex-1 leading-relaxed">{nota.conteudo}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDelete(nota.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-destructive/70 mt-1">{formatDate(nota.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {page + 1} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Próximo <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
