import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, ExternalLink, Clock } from "lucide-react";
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-3">
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
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-0">
            {filtered.map((a, i) => {
              const doc = a.documento_id ? docsMap[a.documento_id] : null;
              const tipoColor = TIPO_ANDAMENTO_COLORS[a.tipo] ?? TIPO_ANDAMENTO_COLORS.outros;

              return (
                <div key={a.id} className="relative pb-4 last:pb-0 group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1.5 w-[18px] h-[18px] rounded-full border-2 border-background bg-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                  </div>

                  {/* Content */}
                  <div className="bg-muted/20 border border-border/30 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[9px] shrink-0 rounded-full px-2 ${tipoColor}`}>
                            {TIPO_ANDAMENTO_LABELS[a.tipo] ?? a.tipo}
                          </Badge>
                          <span className="text-xs font-semibold">{a.titulo}</span>
                        </div>
                        {a.resumo && (
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{a.resumo}</p>
                        )}
                        {doc && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline mt-0.5"
                          >
                            <FileText className="w-3 h-3" />
                            {doc.nome}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-medium text-muted-foreground">{formatDate(a.data_andamento)}</p>
                        <p className="text-[10px] text-muted-foreground/60">{formatTime(a.data_andamento)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
