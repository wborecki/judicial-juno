import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, ExternalLink, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const docsMap = useMemo(() => {
    const map: Record<string, { nome: string; tipo: string; url: string }> = {};
    documentos.forEach(d => { map[d.id] = { nome: d.nome, tipo: d.tipo_documento, url: d.arquivo_url }; });
    return map;
  }, [documentos]);

  const filtered = useMemo(() => {
    if (!searchQuery) return andamentos;
    const q = searchQuery.toLowerCase();
    return andamentos.filter(a => a.titulo.toLowerCase().includes(q) || a.resumo?.toLowerCase().includes(q));
  }, [andamentos, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when search changes
  useMemo(() => setPage(0), [searchQuery]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
      {/* Search */}
      {andamentos.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar movimentações..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto">
            {filtered.length} de {andamentos.length}
          </span>
        </div>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhuma movimentação encontrada.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border/60" />

          <div className="space-y-0">
            {paged.map((a) => {
              const doc = a.documento_id ? docsMap[a.documento_id] : null;
              const tipoColor = TIPO_ANDAMENTO_COLORS[a.tipo] ?? TIPO_ANDAMENTO_COLORS.outros;

              return (
                <div key={a.id} className="relative pb-1 last:pb-0 group">
                  <div className="absolute -left-6 top-3 w-[10px] h-[10px] rounded-full border-2 border-card bg-muted-foreground/40 group-hover:bg-primary transition-colors" />

                  <div className="py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                        <Badge className={`text-[9px] shrink-0 rounded-full px-2 py-0 ${tipoColor}`}>
                          {TIPO_ANDAMENTO_LABELS[a.tipo] ?? a.tipo}
                        </Badge>
                        <span className="text-xs font-medium text-foreground">{a.titulo}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-muted-foreground">{formatDate(a.data_andamento)}</p>
                        <p className="text-[10px] text-muted-foreground/50">{formatTime(a.data_andamento)}</p>
                      </div>
                    </div>

                    {a.resumo && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 pl-0.5">{a.resumo}</p>
                    )}

                    {doc && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline mt-1 pl-0.5"
                      >
                        <FileText className="w-3 h-3" />
                        {doc.nome}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
