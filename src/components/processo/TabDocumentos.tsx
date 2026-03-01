import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2, Download } from "lucide-react";
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

interface Props {
  processoId: string;
}

export default function TabDocumentos({ processoId }: Props) {
  const { data: docs = [], isLoading } = useProcessoDocumentos(processoId);
  const createDoc = useCreateProcessoDocumento();
  const deleteDoc = useDeleteProcessoDocumento();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [tipoDoc, setTipoDoc] = useState("outros");

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
    <div className="space-y-3">
      {/* Upload area */}
      <Card className="glass-card">
        <CardContent className="p-4">
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
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {docs.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhum documento enviado</p>
      )}

      {docs.map(d => (
        <div key={d.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/30 group">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{d.nome}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">{TIPO_DOC_LABELS[d.tipo_documento] ?? d.tipo_documento}</Badge>
                <span>{formatSize(d.tamanho)}</span>
                <span>{formatDate(d.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href={d.arquivo_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Download className="w-3 h-3" />
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(d.id, d.arquivo_url)}>
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
