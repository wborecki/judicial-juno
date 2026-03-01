import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check, MoreHorizontal, Pencil, RefreshCw, ExternalLink, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import PessoaSheet from "@/components/PessoaSheet";

const STATUS_LABELS: Record<number, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};
const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente", apto: "Apto", descartado: "Descartado", "reanálise": "Reanálise",
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
}

export default function ProcessoHeader({ processo, onConvert, onDiscard }: Props) {
  const updateProcesso = useUpdateProcesso();
  const [copied, setCopied] = useState(false);
  const [editValorOpen, setEditValorOpen] = useState(false);
  const [valorEdit, setValorEdit] = useState(processo.valor_estimado ?? 0);

  const [pessoaSheetOpen, setPessoaSheetOpen] = useState(false);
  const [pessoaSheetData, setPessoaSheetData] = useState<{ pessoaId?: string | null; nome?: string; cpfCnpj?: string | null }>({});

  const triagem = processo.triagem_resultado ?? "pendente";
  const p = processo as any; // shorthand for new fields not yet in generated types

  const handleCopyCNJ = async () => {
    await navigator.clipboard.writeText(processo.numero_processo);
    setCopied(true);
    toast.success("CNJ copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveValor = async () => {
    try {
      await updateProcesso.mutateAsync({ id: processo.id, updates: { valor_estimado: valorEdit } });
      toast.success("Valor atualizado");
      setEditValorOpen(false);
    } catch {
      toast.error("Erro ao atualizar valor");
    }
  };

  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  // Build detail fields – only show non-empty ones
  const detailFields: { label: string; value: string }[] = [];
  if (processo.classe_fase) detailFields.push({ label: "Classe Judicial", value: processo.classe_fase });
  if (p.assunto) detailFields.push({ label: "Assunto", value: p.assunto });
  detailFields.push({ label: "Valor da Causa", value: fmt(processo.valor_estimado) });
  if (p.orgao_julgador) detailFields.push({ label: "Órgão Julgador", value: p.orgao_julgador });
  if (processo.vara_comarca) detailFields.push({ label: "Vara / Comarca", value: processo.vara_comarca });
  if (p.area) detailFields.push({ label: "Área", value: p.area });
  if (p.foro) detailFields.push({ label: "Foro", value: p.foro });
  if (p.juiz) detailFields.push({ label: "Juiz", value: p.juiz });
  if (p.competencia) detailFields.push({ label: "Competência", value: p.competencia });
  if (p.data_autuacao) detailFields.push({ label: "Autuação", value: fmtDate(p.data_autuacao) });
  if (processo.data_distribuicao) detailFields.push({ label: "Distribuição", value: fmtDate(processo.data_distribuicao) });

    return (
    <>
      <div className="bg-card border border-border/40 rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] overflow-hidden">
        {/* ── Row 1: CNJ + Value + Actions ── */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 min-w-0">
              {/* CNJ number */}
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base font-bold tracking-tight text-primary">{processo.numero_processo}</h1>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCopyCNJ}>
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                {tribunalUrl && (
                  <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="rounded-full text-[11px] font-medium px-2.5 py-0.5">{processo.tribunal}</Badge>
                <Badge variant="secondary" className="rounded-full text-[11px] px-2.5 py-0.5">{processo.natureza}</Badge>
                <Badge variant="secondary" className="rounded-full text-[11px] px-2.5 py-0.5">{processo.tipo_pagamento}</Badge>
                {processo.classe_fase && <Badge variant="secondary" className="rounded-full text-[11px] px-2.5 py-0.5">{processo.classe_fase}</Badge>}
                <Badge variant="secondary" className="rounded-full text-[11px] px-2.5 py-0.5">
                  S{processo.status_processo} — {STATUS_LABELS[processo.status_processo] ?? "—"}
                </Badge>
                <Badge variant="secondary" className={`rounded-full text-[11px] px-2.5 py-0.5 ${processo.transito_julgado ? "bg-success/10 text-success" : ""}`}>
                  Trânsito: {processo.transito_julgado ? "Sim" : "Não"}
                </Badge>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {triagem === "apto" ? (
                  <Button size="sm" onClick={onConvert} className="text-xs gap-1.5 h-8 rounded-lg">
                    <Briefcase className="w-3.5 h-3.5" />Criar Negócio
                  </Button>
                ) : triagem === "pendente" || triagem === "reanálise" ? (
                  <>
                    <Button size="sm" onClick={onConvert} className="text-xs gap-1.5 h-8 rounded-lg bg-success hover:bg-success/90 text-success-foreground">
                      <Briefcase className="w-3.5 h-3.5" />Converter
                    </Button>
                    <Button size="sm" variant="outline" onClick={onDiscard} className="text-xs gap-1.5 h-8 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10">
                      Descartar
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Right side: value + triagem + menu */}
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
                  <DropdownMenuItem onClick={() => { setValorEdit(processo.valor_estimado ?? 0); setEditValorOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 mr-2" />Editar Valor da Causa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Sincronização não implementada")}>
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />Sincronizar Dados
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
        </div>

        {/* ── Row 2: Detail fields grid (3 columns) ── */}
        <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
            {detailFields.map(f => (
              <div key={f.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{f.label}</p>
                <p className="text-xs font-medium text-foreground leading-snug">{f.value}</p>
              </div>
            ))}
          </div>

          {processo.observacoes && (
            <p className="text-xs text-muted-foreground italic border-t border-border/10 pt-2">
              {processo.observacoes}
            </p>
          )}
        </div>
      </div>

      {/* Edit valor dialog */}
      <Dialog open={editValorOpen} onOpenChange={setEditValorOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Editar Valor da Causa</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Valor (R$)</Label>
            <Input type="number" value={valorEdit} onChange={e => setValorEdit(Number(e.target.value))} className="h-9 text-sm" />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditValorOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={handleSaveValor} disabled={updateProcesso.isPending} className="text-xs">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
