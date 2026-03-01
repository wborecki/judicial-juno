import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Search, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useProcessoAndamentos, useCreateProcessoAndamento, useDeleteProcessoAndamento } from "@/hooks/useProcessoAndamentos";
import { useProcessoDocumentos } from "@/hooks/useProcessoDocumentos";

const TIPO_ANDAMENTO_LABELS: Record<string, string> = {
  despacho: "Despacho",
  decisao: "Decisão",
  sentenca: "Sentença",
  intimacao: "Intimação",
  peticao: "Petição",
  outros: "Outros",
};

const TIPO_ANDAMENTO_COLORS: Record<string, string> = {
  despacho: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  decisao: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  sentenca: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intimacao: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  peticao: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  outros: "bg-muted text-muted-foreground border-border",
};

interface Props {
  processoId: string;
}

export default function TabAndamentos({ processoId }: Props) {
  const { data: andamentos = [], isLoading } = useProcessoAndamentos(processoId);
  const { data: documentos = [] } = useProcessoDocumentos(processoId);
  const createAndamento = useCreateProcessoAndamento();
  const deleteAndamento = useDeleteProcessoAndamento();

  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [tipo, setTipo] = useState("outros");
  const [documentoId, setDocumentoId] = useState<string>("none");
  const [dataAndamento, setDataAndamento] = useState(new Date().toISOString().slice(0, 10));

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyWithDoc, setOnlyWithDoc] = useState(false);

  const docsMap = useMemo(() => {
    const map: Record<string, { nome: string; tipo: string; url: string }> = {};
    documentos.forEach(d => { map[d.id] = { nome: d.nome, tipo: d.tipo_documento, url: d.arquivo_url }; });
    return map;
  }, [documentos]);

  const filtered = useMemo(() => {
    let list = andamentos;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.titulo.toLowerCase().includes(q));
    }
    if (onlyWithDoc) {
      list = list.filter(a => !!a.documento_id);
    }
    return list;
  }, [andamentos, searchQuery, onlyWithDoc]);

  const handleAdd = async () => {
    if (!titulo.trim()) return toast.error("Título é obrigatório");
    try {
      await createAndamento.mutateAsync({
        processo_id: processoId,
        titulo: titulo.trim(),
        descricao: null,
        tipo,
        data_andamento: new Date(dataAndamento).toISOString(),
        criado_por: null,
        documento_id: documentoId !== "none" ? documentoId : null,
        resumo: resumo.trim() || null,
      });
      toast.success("Movimentação adicionada");
      setTitulo(""); setResumo(""); setTipo("outros"); setDocumentoId("none"); setShowForm(false);
    } catch {
      toast.error("Erro ao adicionar movimentação");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAndamento.mutateAsync({ id, processoId });
      toast.success("Movimentação removida");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="space-y-3">
      {/* Add form */}
      {showForm ? (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Nova Movimentação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" className="h-8 text-xs" value={dataAndamento} onChange={e => setDataAndamento(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_ANDAMENTO_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Título</Label>
                <Input className="h-8 text-xs" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Despacho de citação" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Resumo (opcional, 1 linha)</Label>
                <Input className="h-8 text-xs" value={resumo} onChange={e => setResumo(e.target.value)} placeholder="Resumo curto..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Documento vinculado (opcional)</Label>
                <Select value={documentoId} onValueChange={setDocumentoId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {documentos.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.nome} ({d.tipo_documento})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={createAndamento.isPending} className="text-xs">Adicionar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />Nova Movimentação
          </Button>
        </div>
      )}

      {/* Search & filter controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="only-doc" checked={onlyWithDoc} onCheckedChange={setOnlyWithDoc} />
          <Label htmlFor="only-doc" className="text-xs text-muted-foreground cursor-pointer">Somente com documento</Label>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} movimentação{filtered.length !== 1 ? "ões" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 && !isLoading ? (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhuma movimentação encontrada</p>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-36">Data/Hora</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Título</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-48">Documento</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resumo</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => {
                const doc = a.documento_id ? docsMap[a.documento_id] : null;
                return (
                  <TableRow key={a.id} className="border-border/20 hover:bg-accent/5 h-9">
                    <TableCell className="text-[11px] text-muted-foreground py-1.5">{formatDateTime(a.data_andamento)}</TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] shrink-0 ${TIPO_ANDAMENTO_COLORS[a.tipo] ?? TIPO_ANDAMENTO_COLORS.outros}`}>
                          {TIPO_ANDAMENTO_LABELS[a.tipo] ?? a.tipo}
                        </Badge>
                        <span className="text-xs font-medium truncate">{a.titulo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      {doc ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate max-w-[180px]"
                          onClick={e => e.stopPropagation()}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">{doc.nome}</span>
                          <Badge variant="outline" className="text-[8px] shrink-0">{doc.tipo}</Badge>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground py-1.5 max-w-[200px] truncate">
                      {a.resumo || "—"}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
