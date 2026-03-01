import { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  useProcessoDocumentos,
  useCreateProcessoDocumento,
  useDeleteProcessoDocumento,
  uploadProcessoDocumento,
} from "@/hooks/useProcessoDocumentos";

const TIPO_DOC_LABELS: Record<string, string> = {
  peticao: "Petição",
  sentenca: "Sentença",
  recurso: "Recurso",
  procuracao: "Procuração",
  comprovante: "Comprovante",
  outros: "Outros",
};

const TIPO_DOC_COLORS: Record<string, string> = {
  peticao: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  sentenca: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  recurso: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  procuracao: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  comprovante: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  outros: "bg-muted text-muted-foreground border-border",
};

interface Props {
  processoId: string;
}

const PAGE_SIZE = 10;

export default function TabDocumentos({ processoId }: Props) {
  const { data: docs = [], isLoading } = useProcessoDocumentos(processoId);
  const createDoc = useCreateProcessoDocumento();
  const deleteDoc = useDeleteProcessoDocumento();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [tipoDoc, setTipoDoc] = useState("outros");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(docs.length / PAGE_SIZE);
  const paged = useMemo(() => docs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [docs, page]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadProcessoDocumento(processoId, file);
        await createDoc.mutateAsync({
          processo_id: processoId,
          nome: file.name.replace(/\.[^.]+$/, ""),
          arquivo_url: url,
          arquivo_nome: file.name,
          tamanho: file.size,
          tipo_documento: tipoDoc,
          criado_por: null,
        });
      }
      toast.success("Documento(s) enviado(s)");
    } catch {
      toast.error("Erro ao enviar documento");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, arquivoUrl: string) => {
    try {
      await deleteDoc.mutateAsync({ id, processoId, arquivoUrl });
      toast.success("Documento removido");
    } catch {
      toast.error("Erro ao remover documento");
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
      {/* Upload bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={tipoDoc} onValueChange={setTipoDoc}>
          <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(TIPO_DOC_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => handleUpload(e.target.files)}
        />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs gap-1.5">
          <Upload className="w-3.5 h-3.5" />{uploading ? "Enviando..." : "Upload"}
        </Button>
        {docs.length > 0 && (
          <span className="text-[11px] text-muted-foreground ml-auto">{docs.length} documento(s)</span>
        )}
      </div>

      {/* Empty state */}
      {docs.length === 0 && !isLoading && (
        <div className="text-center py-10 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhum documento enviado</p>
        </div>
      )}

      {/* Document list */}
      {paged.map((d, i) => {
        const tipoColor = TIPO_DOC_COLORS[d.tipo_documento] ?? TIPO_DOC_COLORS.outros;
        return (
          <div
            key={d.id}
            className={`flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors group ${i < paged.length - 1 ? "border-b border-border/20" : ""}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{d.nome}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <Badge className={`text-[9px] rounded-full px-2 py-0 ${tipoColor}`}>
                    {TIPO_DOC_LABELS[d.tipo_documento] ?? d.tipo_documento}
                  </Badge>
                  <span>{formatSize(d.tamanho)}</span>
                  <span>{formatDate(d.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a href={d.arquivo_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </a>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(d.id, d.arquivo_url)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        );
      })}

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
