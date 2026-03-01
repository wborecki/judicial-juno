import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProcessosPaginated, ProcessoFilters } from "@/hooks/useProcessos";
import { useCreateNegocio } from "@/hooks/useNegocios";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, X, Scale, CalendarIcon, ChevronLeft, ChevronRight, ExternalLink, MoreHorizontal, Eye, CheckCircle2, Briefcase } from "lucide-react";
import { TRIBUNAIS } from "@/lib/types";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

const PAGE_SIZE = 50;

const NATUREZAS = ["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"];
const TIPOS_PAGAMENTO = ["RPV", "Precatório"];
const TRIAGEM_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "apto", label: "Apto" },
  { value: "descartado", label: "Descartado" },
  { value: "reanálise", label: "Reanálise" },
];

const STATUS_LABELS: Record<number, string> = {
  1: "Ativo",
  2: "Suspenso",
  3: "Arquivado",
};

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};

const TRIBUNAL_URLS: Record<string, string> = {
  TRF1: "https://processual.trf1.jus.br/consultaProcessual/processo.php?proc=",
  TRF2: "https://eproc.trf2.jus.br/eproc/externo_controlador.php?acao=processo_consulta&txtValor=",
  TRF3: "https://pje1g.trf3.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  TRF4: "https://eproc.trf4.jus.br/eproc2trf4/controlador.php?acao=consulta_processual_resultado_pesquisa&txtValor=",
  TRF5: "https://pje.trf5.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  TRF6: "https://pje.trf6.jus.br/pje/ConsultaPublica/listView.seam?numeroProcesso=",
  TJSP: "https://esaj.tjsp.jus.br/cpopg/show.do?processo.numero=",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

const getTribunalUrl = (tribunal: string, numero: string) => {
  const base = TRIBUNAL_URLS[tribunal];
  return base ? `${base}${numero}` : null;
};

const DATE_PRESETS = [
  { label: "Hoje", days: 0 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

export default function Processos() {
  const navigate = useNavigate();
  const createNegocio = useCreateNegocio();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [filterTribunal, setFilterTribunal] = useState("all");
  const [filterNatureza, setFilterNatureza] = useState("all");
  const [filterTipoPagamento, setFilterTipoPagamento] = useState("all");
  const [filterTriagem, setFilterTriagem] = useState("all");
  const [filterTransito, setFilterTransito] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout>>();
  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => {
        setSearchDebounced(val);
        setPage(0);
      }, 400)
    );
  };

  const filters: ProcessoFilters = useMemo(() => ({
    search: searchDebounced || undefined,
    tribunal: filterTribunal,
    natureza: filterNatureza,
    tipoPagamento: filterTipoPagamento,
    triagem: filterTriagem,
    transito: filterTransito,
    dateFrom: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  }), [searchDebounced, filterTribunal, filterNatureza, filterTipoPagamento, filterTriagem, filterTransito, dateRange]);

  const { data, isLoading } = useProcessosPaginated(page, PAGE_SIZE, filters);
  const processos = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasFilters = filterTribunal !== "all" || filterNatureza !== "all" || filterTipoPagamento !== "all" || filterTriagem !== "all" || filterTransito !== "all" || search !== "" || !!dateRange;

  const clearFilters = () => {
    setSearch("");
    setSearchDebounced("");
    setFilterTribunal("all");
    setFilterNatureza("all");
    setFilterTipoPagamento("all");
    setFilterTriagem("all");
    setFilterTransito("all");
    setDateRange(undefined);
    setPage(0);
  };

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = days === 0 ? startOfDay(to) : subDays(to, days);
    setDateRange({ from, to });
    setPage(0);
  };

  const handleEnviarNegocios = async (processoId: string, valorEstimado: number | null) => {
    try {
      await createNegocio.mutateAsync({
        processo_id: processoId,
        valor_proposta: valorEstimado,
        negocio_status: "em_andamento",
        data_abertura: new Date().toISOString(),
        pessoa_id: null,
        responsavel_id: null,
        tipo_servico: null,
        observacoes: null,
        valor_fechamento: null,
        data_fechamento: null,
      });
      toast.success("Negócio criado com sucesso!");
    } catch {
      toast.error("Erro ao criar negócio");
    }
  };

  if (isLoading && page === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Processos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalCount.toLocaleString("pt-BR")} processo{totalCount !== 1 ? "s" : ""}
            {hasFilters && " (filtrado)"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar nº processo, parte, CPF/CNPJ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5 min-w-[180px] justify-start", dateRange && "text-foreground")}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "dd/MM/yy")} — ${format(dateRange.to, "dd/MM/yy")}`
                  ) : format(dateRange.from, "dd/MM/yyyy")
                ) : "Período captação"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex gap-1 p-2 border-b border-border">
                {DATE_PRESETS.map(p => (
                  <Button key={p.label} variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handlePreset(p.days)}>
                    {p.label}
                  </Button>
                ))}
                {dateRange && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => { setDateRange(undefined); setPage(0); }}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(r) => { setDateRange(r); setPage(0); }}
                numberOfMonths={2}
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Select value={filterTribunal} onValueChange={(v) => { setFilterTribunal(v); setPage(0); }}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Tribunal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tribunais</SelectItem>
              {TRIBUNAIS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterNatureza} onValueChange={(v) => { setFilterNatureza(v); setPage(0); }}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Natureza" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Naturezas</SelectItem>
              {NATUREZAS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTipoPagamento} onValueChange={(v) => { setFilterTipoPagamento(v); setPage(0); }}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Tipo Pgto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {TIPOS_PAGAMENTO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTriagem} onValueChange={(v) => { setFilterTriagem(v); setPage(0); }}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Triagem" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Triagens</SelectItem>
              {TRIAGEM_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTransito} onValueChange={(v) => { setFilterTransito(v); setPage(0); }}>
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Trânsito" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Trânsito: Todos</SelectItem>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[180px]">Nº CNJ</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">Tribunal</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vara/Comarca</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Classe/Fase</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-20">Triagem</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">Status</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">Trânsito</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-24">Valor Est.</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-20">Captação</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processos.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            )}
            {processos.map((p) => {
              const triagem = p.triagem_resultado ?? "pendente";
              const tribunalUrl = getTribunalUrl(p.tribunal, p.numero_processo);
              return (
                <TableRow
                  key={p.id}
                  className="cursor-pointer border-border/20 hover:bg-accent/5 transition-colors h-9"
                  onClick={() => navigate(`/processos/${p.id}`)}
                >
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-medium">{p.numero_processo}</span>
                      {tribunalUrl && (
                        <a
                          href={tribunalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Consultar no tribunal"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <span className="text-[10px] font-medium bg-primary/5 text-primary px-1.5 py-0.5 rounded">{p.tribunal}</span>
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-[140px] truncate">{p.vara_comarca || "—"}</TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-[140px] truncate">{p.classe_fase || "—"}</TableCell>
                  <TableCell className="py-1.5">
                    <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${TRIAGEM_COLORS[triagem] ?? ""}`}>
                      {TRIAGEM_OPTIONS.find((t) => t.value === triagem)?.label ?? triagem}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] py-1.5">{STATUS_LABELS[p.status_processo] ?? "—"}</TableCell>
                  <TableCell className="text-[10px] py-1.5">{p.transito_julgado ? "Sim" : "Não"}</TableCell>
                  <TableCell className="text-[11px] font-medium text-right py-1.5">{formatCurrency(p.valor_estimado)}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground py-1.5">{formatDate(p.data_captacao)}</TableCell>
                  <TableCell className="py-1.5" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(`/processos/${p.id}`)} className="text-xs gap-2">
                          <Eye className="w-3.5 h-3.5" />Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/processos/${p.id}?tab=triagem`)} className="text-xs gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />Triagem
                        </DropdownMenuItem>
                        {triagem === "apto" && (
                          <DropdownMenuItem
                            onClick={() => handleEnviarNegocios(p.id, p.valor_estimado)}
                            className="text-xs gap-2"
                          >
                            <Briefcase className="w-3.5 h-3.5" />Enviar para Negócios
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {page + 1} / {totalPages}
            </span>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
