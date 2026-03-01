import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, StickyNote, ChevronLeft, ChevronRight, Upload, Paperclip, Download } from "lucide-react";
import { toast } from "sonner";
import { useProcessoNotas, useCreateProcessoNota, useDeleteProcessoNota } from "@/hooks/useProcessoNotas";
import { useCreateProcessoHistorico } from "@/hooks/useProcessoHistorico";
import { uploadProcessoDocumento } from "@/hooks/useProcessoDocumentos";
import RichTextEditor, { RichTextEditorRef } from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  processoId: string;
}

interface Anexo {
  nome: string;
  url: string;
  tamanho: number;
}

interface Usuario {
  id: string;
  nome: string;
}

const PAGE_SIZE = 10;

export default function TabNotas({ processoId }: Props) {
  const { data: notas = [], isLoading } = useProcessoNotas(processoId);
  const createNota = useCreateProcessoNota();
  const deleteNota = useDeleteProcessoNota();
  const createHistorico = useCreateProcessoHistorico();

  const editorRef = useRef<RichTextEditorRef>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Load usuarios for mentions
  useMemo(() => {
    supabase.from("usuarios").select("id, nome").eq("ativo", true).then(({ data }) => {
      if (data) setUsuarios(data as Usuario[]);
    });
  }, []);

  const totalPages = Math.ceil(notas.length / PAGE_SIZE);
  const paged = useMemo(() => notas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [notas, page]);

  const handleUploadAnexo = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newAnexos: Anexo[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadProcessoDocumento(processoId, file);
        newAnexos.push({ nome: file.name, url, tamanho: file.size });
      }
      setAnexos(prev => [...prev, ...newAnexos]);
      toast.success("Anexo(s) adicionado(s)");
    } catch {
      toast.error("Erro ao anexar arquivo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleAdd = async () => {
    const text = htmlContent.replace(/<[^>]*>/g, "").trim();
    if (!text && anexos.length === 0) return;
    try {
      await createNota.mutateAsync({
        processo_id: processoId,
        conteudo: htmlContent,
        anexos: anexos.length > 0 ? anexos : [],
      });
      editorRef.current?.clearContent();
      setHtmlContent("");
      setAnexos([]);
      // Log to history
      createHistorico.mutate({
        processo_id: processoId,
        usuario_id: null,
        usuario_nome: null,
        tipo: "nota_criada",
        descricao: "Nova nota interna adicionada",
        campo: null,
        valor_anterior: null,
        valor_novo: null,
        metadata: {},
      });
      toast.success("Nota adicionada");
    } catch {
      toast.error("Erro ao adicionar nota");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNota.mutateAsync({ id, processoId });
      createHistorico.mutate({
        processo_id: processoId,
        usuario_id: null,
        usuario_nome: null,
        tipo: "nota_removida",
        descricao: "Nota interna removida",
        campo: null,
        valor_anterior: null,
        valor_novo: null,
        metadata: {},
      });
      toast.success("Nota removida");
    } catch {
      toast.error("Erro ao remover nota");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
      {/* Rich editor */}
      <div className="space-y-2">
        <RichTextEditor
          ref={editorRef}
          placeholder="Escreva uma nota interna... Use @ para mencionar alguém"
          usuarios={usuarios}
          onUpdate={setHtmlContent}
          minHeight="100px"
        />

        {/* Attachments preview */}
        {anexos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {anexos.map((a, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] gap-1 pr-1">
                <Paperclip className="w-3 h-3" />
                {a.nome} ({formatSize(a.tamanho)})
                <button className="ml-1 hover:text-destructive" onClick={() => setAnexos(prev => prev.filter((_, j) => j !== i))}>×</button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAdd} disabled={createNota.isPending || (!htmlContent.replace(/<[^>]*>/g, "").trim() && anexos.length === 0)} className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />Salvar Nota
          </Button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={e => handleUploadAnexo(e.target.files)} />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs gap-1.5">
            <Upload className="w-3.5 h-3.5" />{uploading ? "Enviando..." : "Anexar"}
          </Button>
        </div>
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
          {paged.map((nota: any, i: number) => {
            const notaAnexos: Anexo[] = nota.anexos || [];
            return (
              <div
                key={nota.id}
                className={`py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors group ${i < paged.length - 1 ? "border-b border-border/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="text-sm whitespace-pre-wrap flex-1 leading-relaxed prose prose-sm max-w-none [&_.mention]:bg-primary/10 [&_.mention]:text-primary [&_.mention]:px-1 [&_.mention]:rounded [&_.mention]:font-medium"
                    dangerouslySetInnerHTML={{ __html: nota.conteudo }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDelete(nota.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Note attachments */}
                {notaAnexos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {notaAnexos.map((a: Anexo, j: number) => (
                      <a key={j} href={a.url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="text-[10px] gap-1 hover:bg-muted cursor-pointer">
                          <Download className="w-3 h-3" />
                          {a.nome}
                        </Badge>
                      </a>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground mt-1.5">{formatDate(nota.created_at)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </Button>
          <span className="text-[11px] text-muted-foreground">{page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Próximo <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
