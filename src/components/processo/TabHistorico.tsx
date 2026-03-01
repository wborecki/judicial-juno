import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, History, ChevronLeft, ChevronRight, FileText, Users, StickyNote, Settings, Briefcase } from "lucide-react";
import { useProcessoHistorico } from "@/hooks/useProcessoHistorico";

const TIPO_LABELS: Record<string, string> = {
  alteracao: "Alteração",
  nota_criada: "Nota Criada",
  nota_removida: "Nota Removida",
  documento_enviado: "Doc. Enviado",
  documento_removido: "Doc. Removido",
  triagem: "Triagem",
  distribuicao: "Distribuição",
  precificacao: "Precificação",
  negocio: "Negócio",
  status: "Status",
  outro: "Outro",
};

const TIPO_COLORS: Record<string, string> = {
  alteracao: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  nota_criada: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  nota_removida: "bg-red-500/10 text-red-600 border-red-500/20",
  documento_enviado: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  documento_removido: "bg-red-500/10 text-red-600 border-red-500/20",
  triagem: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  distribuicao: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  precificacao: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  negocio: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  status: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  outro: "bg-muted text-muted-foreground border-border",
};

const TIPO_ICONS: Record<string, React.ReactNode> = {
  alteracao: <Settings className="w-3.5 h-3.5" />,
  nota_criada: <StickyNote className="w-3.5 h-3.5" />,
  nota_removida: <StickyNote className="w-3.5 h-3.5" />,
  documento_enviado: <FileText className="w-3.5 h-3.5" />,
  documento_removido: <FileText className="w-3.5 h-3.5" />,
  triagem: <Users className="w-3.5 h-3.5" />,
  negocio: <Briefcase className="w-3.5 h-3.5" />,
};

interface Props {
  processoId: string;
}

const PAGE_SIZE = 15;

export default function TabHistorico({ processoId }: Props) {
  const { data: historico = [], isLoading } = useProcessoHistorico(processoId);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!searchQuery) return historico;
    const q = searchQuery.toLowerCase();
    return historico.filter(h =>
      h.descricao.toLowerCase().includes(q) ||
      h.usuario_nome?.toLowerCase().includes(q) ||
      h.tipo.toLowerCase().includes(q)
    );
  }, [historico, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useMemo(() => setPage(0), [searchQuery]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
      {/* Search */}
      {historico.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto">
            {filtered.length} registro(s)
          </span>
        </div>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhum registro de histórico.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border/60" />
          <div className="space-y-0">
            {paged.map((h) => {
              const tipoColor = TIPO_COLORS[h.tipo] ?? TIPO_COLORS.outro;
              return (
                <div key={h.id} className="relative pb-1 last:pb-0 group">
                  <div className="absolute -left-6 top-3 w-[10px] h-[10px] rounded-full border-2 border-card bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                  <div className="py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                        <Badge className={`text-[9px] shrink-0 rounded-full px-2 py-0 ${tipoColor}`}>
                          {TIPO_LABELS[h.tipo] ?? h.tipo}
                        </Badge>
                        <span className="text-xs font-medium text-foreground">{h.descricao}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-muted-foreground">{formatDate(h.created_at)}</p>
                        <p className="text-[10px] text-muted-foreground/50">{formatTime(h.created_at)}</p>
                      </div>
                    </div>

                    {(h.campo || h.usuario_nome) && (
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground pl-0.5">
                        {h.usuario_nome && <span>por <strong>{h.usuario_nome}</strong></span>}
                        {h.campo && (
                          <span>
                            Campo: <strong>{h.campo}</strong>
                            {h.valor_anterior && <> de <em>{h.valor_anterior}</em></>}
                            {h.valor_novo && <> para <em>{h.valor_novo}</em></>}
                          </span>
                        )}
                      </div>
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
