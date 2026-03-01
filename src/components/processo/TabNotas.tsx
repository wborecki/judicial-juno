import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useProcessoNotas, useCreateProcessoNota, useDeleteProcessoNota } from "@/hooks/useProcessoNotas";

interface Props {
  processoId: string;
}

export default function TabNotas({ processoId }: Props) {
  const { data: notas = [], isLoading } = useProcessoNotas(processoId);
  const createNota = useCreateProcessoNota();
  const deleteNota = useDeleteProcessoNota();

  const [conteudo, setConteudo] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    const text = conteudo.trim();
    if (!text) return;
    try {
      await createNota.mutateAsync({ processo_id: processoId, conteudo: text });
      setConteudo("");
      setShowForm(false);
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
    <div className="space-y-3">
      {showForm ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Escreva uma nota interna..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="min-h-[80px] text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={createNota.isPending || !conteudo.trim()} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setConteudo(""); }} className="text-xs">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />Nova Nota
        </Button>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : notas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhuma nota interna ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notas.map((nota) => (
            <div key={nota.id} className="bg-muted/40 border border-border/40 rounded-lg p-3 group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm whitespace-pre-wrap flex-1">{nota.conteudo}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => handleDelete(nota.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">{formatDate(nota.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
