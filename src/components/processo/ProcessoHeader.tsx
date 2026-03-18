import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsuarios, useEquipes } from "@/hooks/useEquipes";
import { useTrocarAnalista } from "@/hooks/useDistribuicao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, Check, MoreHorizontal, Pencil, RefreshCw, ExternalLink, Briefcase, ChevronDown, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useProcessoAreas } from "@/hooks/useProcessoAreas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PessoaSheet from "@/components/PessoaSheet";

const STATUS_LABELS: Record<number, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  em_acompanhamento: "bg-info/10 text-info border-info/20",
  convertido: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
};
const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente", em_acompanhamento: "Em Acompanhamento", convertido: "Convertido", descartado: "Descartado",
};

const TRIBUNAL_URLS: Record<string, string> = {
  "TRF-1": "https://processual.trf1.jus.br/consultaProcessual/processo.php?proc=",
  "TRF-2": "https://eproc.trf2.jus.br/eproc/externo_controlador.php?acao=processo_consulta&txtValor=",
  "TRT-1": "https://pje.trt1.jus.br/consultaprocessual/pages/consultas/ConsultaProcessual.seam?numeroProcesso=",
  TJSP: "https://esaj.tjsp.jus.br/cpopg/show.do?processo.numero=",
};

const fmt = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
};

interface Props {
  processo: Processo;
  onConvert: () => void;
  onDiscard: () => void;
  onReanalyse: () => void;
  onRemoveReanalyse: () => void;
}

type DetailField = {
  label: string;
  value: string;
  editable?: {
    options: { value: string; label: string }[];
    onSave: (v: string) => Promise<any>;
    inline?: boolean;
    currentNumericValue?: number | null;
    onSaveNumeric?: (v: number | null) => Promise<void>;
  };
};

export default function ProcessoHeader({ processo, onConvert, onDiscard, onReanalyse, onRemoveReanalyse }: Props) {
  const updateProcesso = useUpdateProcesso();
  const [copied, setCopied] = useState(false);

  const [pessoaSheetOpen, setPessoaSheetOpen] = useState(false);
  const [pessoaSheetData, setPessoaSheetData] = useState<{ pessoaId?: string | null; nome?: string; cpfCnpj?: string | null }>({});

  const triagem = processo.triagem_resultado ?? "pendente";
  const p = processo as any;

  const { data: areas = [] } = useProcessoAreas(processo.id);
  const allAreasDone = areas.length > 0 && areas.every(a => a.concluido);
  const hasAreas = areas.length > 0;
  const pendingAreas = areas.filter(a => !a.concluido).length;

  const handleCopyCNJ = async () => {
    await navigator.clipboard.writeText(processo.numero_processo);
    setCopied(true);
    toast.success("CNJ copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  // Build detail fields
  const detailFields: DetailField[] = [
    { label: "Classe Judicial", value: processo.classe_fase || "—" },
    { label: "Assunto", value: p.assunto || "—" },
    {
      label: "Valor da Causa", value: fmt(processo.valor_estimado),
      editable: {
        options: [],
        onSave: async () => {},
        inline: true,
        currentNumericValue: processo.valor_estimado,
        onSaveNumeric: async (v: number | null) => {
          await updateProcesso.mutateAsync({ id: processo.id, updates: { valor_estimado: v } });
          toast.success("Valor atualizado");
        },
      },
    },
    {
      label: "Natureza", value: processo.natureza || "—",
      editable: {
        options: [
          { value: "Previdenciário", label: "Previdenciário" },
          { value: "Cível", label: "Cível" },
          { value: "Trabalhista", label: "Trabalhista" },
          { value: "Tributário", label: "Tributário" },
          { value: "Administrativo", label: "Administrativo" },
          { value: "Outro", label: "Outro" },
        ],
        onSave: (v) => updateProcesso.mutateAsync({ id: processo.id, updates: { natureza: v } }).then(() => toast.success("Natureza atualizada")),
      },
    },
    {
      label: "Tipo Pagamento", value: processo.tipo_pagamento || "—",
      editable: {
        options: [
          { value: "RPV", label: "RPV" },
          { value: "Precatório", label: "Precatório" },
          { value: "Alvará", label: "Alvará" },
          { value: "Depósito Judicial", label: "Depósito Judicial" },
          { value: "Outro", label: "Outro" },
        ],
        onSave: (v) => updateProcesso.mutateAsync({ id: processo.id, updates: { tipo_pagamento: v } }).then(() => toast.success("Tipo atualizado")),
      },
    },
    {
      label: "Status Processo", value: `S${processo.status_processo} — ${STATUS_LABELS[processo.status_processo] ?? "—"}`,
      editable: {
        options: Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: `S${k} — ${v}` })),
        onSave: (v) => updateProcesso.mutateAsync({ id: processo.id, updates: { status_processo: Number(v) } }).then(() => toast.success("Status atualizado")),
      },
    },
    { label: "Vara / Comarca", value: processo.vara_comarca || p.orgao_julgador || "—" },
    { label: "Área", value: p.area || "—" },
    {
      label: "Trânsito Julgado", value: processo.transito_julgado ? "Sim" : "Não",
      editable: {
        options: [
          { value: "true", label: "Sim" },
          { value: "false", label: "Não" },
        ],
        onSave: (v) => updateProcesso.mutateAsync({ id: processo.id, updates: { transito_julgado: v === "true" } }).then(() => toast.success("Trânsito atualizado")),
      },
    },
    {
      label: "Natureza do Crédito", value: processo.natureza_credito || "—",
      editable: {
        options: [
          { value: "Alimentar", label: "Alimentar" },
          { value: "Comum", label: "Comum" },
        ],
        onSave: (v) => updateProcesso.mutateAsync({ id: processo.id, updates: { natureza_credito: v } }).then(() => toast.success("Natureza do crédito atualizada")),
      },
    },
    { label: "Competência", value: p.competencia || "—" },
    { label: "Foro", value: p.foro || "—" },
    { label: "Juiz", value: p.juiz || "—" },
    { label: "Autuação", value: fmtDate(p.data_autuacao) },
    { label: "Distribuição", value: fmtDate(processo.data_distribuicao) },
  ];

  return (
    <>
      {/* ── Line 1: CNJ + Tribunal + Actions + Value ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-mono text-base font-bold tracking-tight text-primary">{processo.numero_processo}</h1>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0" onClick={handleCopyCNJ}>
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          {tribunalUrl && (
            <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          )}
          <Badge variant="secondary" className="rounded-full text-[11px] font-medium px-2.5 py-0.5 shrink-0">{processo.tribunal}</Badge>

      {triagem !== "descartado" && triagem !== "convertido" && (
            <>
              <Button size="sm" onClick={onConvert} className="text-xs gap-1.5 h-7 rounded-lg bg-success hover:bg-success/90 text-success-foreground shrink-0">
                <Briefcase className="w-3.5 h-3.5" />Criar Negócio
              </Button>
              {triagem !== "em_acompanhamento" ? (
                <Button size="sm" variant="outline" onClick={onReanalyse} className="text-xs gap-1.5 h-7 rounded-lg border-info/40 text-info hover:bg-info/10 shrink-0">
                  <Eye className="w-3.5 h-3.5" />Acompanhar
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={onRemoveReanalyse} className="text-xs gap-1.5 h-7 rounded-lg border-warning/40 text-warning hover:bg-warning/10 shrink-0">
                  <Eye className="w-3.5 h-3.5" />Remover Acompanhamento
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onDiscard} className="text-xs gap-1.5 h-7 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0">
                <XCircle className="w-3.5 h-3.5" />Descartar
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Valor da Causa</p>
            <p className="text-base font-bold">{fmt(processo.valor_estimado)}</p>
          </div>
          <Badge className={`rounded-full text-[11px] px-3 py-1 font-medium ${TRIAGEM_COLORS[triagem]}`}>{TRIAGEM_LABELS[triagem]}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Gerar relatório em breve")}>
                <ExternalLink className="w-3.5 h-3.5 mr-2" />Gerar Relatório
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Duplicar processo em breve")}>
                <Copy className="w-3.5 h-3.5 mr-2" />Duplicar Processo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Arquivar processo em breve")}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" />Arquivar Processo
              </DropdownMenuItem>
              {tribunalUrl && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />Ver no Tribunal
                    </a>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Analista + Equipe ── */}
      <AnalistaEquipeSection processo={processo} />

      {/* ── Detail fields card ── */}
      <div className="bg-card border border-border/40 rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] p-5 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
          {detailFields.map(f => (
            <div key={f.label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{f.label}</p>
              {f.editable ? (
                <EditableField value={f.value} options={f.editable.options} onSave={f.editable.onSave} />
              ) : (
                <p className="text-xs font-medium text-foreground leading-snug">{f.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>


      <PessoaSheet
        open={pessoaSheetOpen}
        onOpenChange={setPessoaSheetOpen}
        pessoaId={pessoaSheetData.pessoaId}
        nome={pessoaSheetData.nome}
        cpfCnpj={pessoaSheetData.cpfCnpj}
      />
    </>
  );
}

function AnalistaEquipeSection({ processo }: { processo: Processo }) {
  const { data: usuarios } = useUsuarios();
  const { data: equipes } = useEquipes();
  const trocar = useTrocarAnalista();
  const analista = (usuarios ?? []).find(u => u.id === processo.analista_id);
  const equipe = (equipes ?? []).find(e => e.id === processo.equipe_id);
  const initials = (nome: string) => nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const activeUsers = (usuarios ?? []).filter(u => u.ativo);

  const handleChange = async (v: string) => {
    try {
      await trocar.mutateAsync({ id: processo.id, analista_id: v });
      toast.success("Analista atualizado");
    } catch {
      toast.error("Erro ao trocar analista");
    }
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Analista:</span>
        {analista && (
          <Avatar className="w-5 h-5">
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initials(analista.nome)}</AvatarFallback>
          </Avatar>
        )}
        <Select value={processo.analista_id ?? ""} onValueChange={handleChange}>
          <SelectTrigger className="h-7 text-xs w-[160px] border-dashed">
            <SelectValue placeholder="Não atribuído" />
          </SelectTrigger>
          <SelectContent>
            {activeUsers.map(u => <SelectItem key={u.id} value={u.id} className="text-xs">{u.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {equipe && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Equipe:</span>
          <Badge variant="outline" className="text-[10px]">{equipe.nome}</Badge>
        </div>
      )}
    </div>
  );
}

function EditableField({
  value,
  options,
  onSave,
  inline,
  currentNumericValue,
  onSaveNumeric,
}: {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => Promise<any>;
  inline?: boolean;
  currentNumericValue?: number | null;
  onSaveNumeric?: (v: number | null) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [localVal, setLocalVal] = useState(String(currentNumericValue ?? ""));

  if (inline && onSaveNumeric) {
    return (
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setLocalVal(String(currentNumericValue ?? "")); }}>
        <PopoverTrigger asChild>
          <button className="group flex items-center gap-1 text-xs font-medium text-foreground leading-snug hover:text-primary transition-colors cursor-pointer">
            {value}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 min-w-[180px]" align="start">
          <Input
            type="number"
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            className="h-8 text-xs mb-2"
            step="0.01"
            autoFocus
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await onSaveNumeric(localVal === "" ? null : Number(localVal));
                setOpen(false);
              }
            }}
          />
          <Button
            size="sm"
            className="w-full h-7 text-xs"
            onClick={async () => {
              await onSaveNumeric(localVal === "" ? null : Number(localVal));
              setOpen(false);
            }}
          >
            Salvar
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="group flex items-center gap-1 text-xs font-medium text-foreground leading-snug hover:text-primary transition-colors cursor-pointer">
          {value}
          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1 min-w-[160px]" align="start">
        {options.map(opt => (
          <button
            key={opt.value}
            className="w-full text-left text-xs px-3 py-1.5 rounded-sm hover:bg-accent transition-colors"
            onClick={async () => {
              try {
                await onSave(opt.value);
                setOpen(false);
              } catch {
                toast.error("Erro ao atualizar");
              }
            }}
          >
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
