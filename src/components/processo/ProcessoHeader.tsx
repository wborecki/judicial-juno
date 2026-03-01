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
import { Copy, Check, MoreHorizontal, Pencil, RefreshCw, ExternalLink, ArrowLeft, User, Users, Gavel, DollarSign, Clock, CalendarClock, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useProcessoPartes, ProcessoParte } from "@/hooks/useProcessoPartes";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const updateProcesso = useUpdateProcesso();
  const { data: partes = [] } = useProcessoPartes(processo.id);
  const { data: andamentos = [] } = useProcessoAndamentos(processo.id);
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

  const openPessoaSheet = (parte: ProcessoParte) => {
    setPessoaSheetData({ pessoaId: parte.pessoa_id, nome: parte.nome, cpfCnpj: parte.cpf_cnpj });
    setPessoaSheetOpen(true);
  };

  const openPessoaSheetByName = (nome: string) => {
    setPessoaSheetData({ nome });
    setPessoaSheetOpen(true);
  };

  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  const autores = partes.filter(p => p.tipo === "autor");
  const reus = partes.filter(p => p.tipo === "reu");
  const advogadosAutor = partes.filter(p => p.tipo === "advogado_autor");
  const advogadosReu = partes.filter(p => p.tipo === "advogado_reu");
  const primeiroAutor = autores[0];
  const primeiroReu = reus[0];
  const ultimoMov = andamentos[0];

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
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/processos")} className="text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" />Voltar
        </Button>

        <div className="bg-card border border-border/40 rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] overflow-hidden">
          {/* ── Row 1: CNJ + Badges + Value + Actions ── */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-base font-bold tracking-tight">{processo.numero_processo}</h1>
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-medium">{processo.tribunal}</Badge>
                  <Badge variant="outline" className="text-[10px]">{processo.natureza}</Badge>
                  <Badge variant="outline" className="text-[10px]">{processo.tipo_pagamento}</Badge>
                  {processo.classe_fase && <Badge variant="outline" className="text-[10px]">{processo.classe_fase}</Badge>}
                  <Badge variant="outline" className="text-[10px]">
                    S{processo.status_processo} — {STATUS_LABELS[processo.status_processo] ?? "—"}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${processo.transito_julgado ? "border-success/30 text-success" : "border-muted-foreground/30 text-muted-foreground"}`}>
                    Trânsito: {processo.transito_julgado ? "Sim" : "Não"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right mr-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor da Causa</p>
                  <p className="text-sm font-bold">{fmt(processo.valor_estimado)}</p>
                </div>
                <Badge className={`text-[10px] ${TRIAGEM_COLORS[triagem]}`}>{TRIAGEM_LABELS[triagem]}</Badge>
                {triagem === "apto" ? (
                  <Button size="sm" onClick={onConvert} className="text-xs gap-1.5 h-8">
                    <Briefcase className="w-3.5 h-3.5" />Criar Negócio
                  </Button>
                ) : triagem === "pendente" || triagem === "reanálise" ? (
                  <>
                    <Button size="sm" onClick={onConvert} className="text-xs gap-1.5 h-8 bg-success hover:bg-success/90 text-success-foreground">
                      <Briefcase className="w-3.5 h-3.5" />Converter
                    </Button>
                    <Button size="sm" variant="outline" onClick={onDiscard} className="text-xs gap-1.5 h-8 border-destructive/30 text-destructive hover:bg-destructive/10">
                      Descartar
                    </Button>
                  </>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
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

          {/* ── Row 2: Dados do processo (grid 3 colunas) ── */}
          <div className="px-4 pb-3 border-t border-border/20 pt-3 space-y-3">
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
              {detailFields.map(f => (
                <div key={f.label}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{f.label}</p>
                  <p className="text-xs font-medium text-foreground leading-snug">{f.value}</p>
                </div>
              ))}
            </div>

            {/* ── Partes ── */}
            <div className="flex items-start gap-10 text-xs pt-1 border-t border-border/10">
              <PartesBlock
                icon={User}
                iconClass="text-primary"
                label="Autor"
                parte={primeiroAutor}
                fallbackNome={processo.parte_autora}
                advogados={advogadosAutor}
                onClickParte={primeiroAutor ? () => openPessoaSheet(primeiroAutor) : () => openPessoaSheetByName(processo.parte_autora)}
                onClickAdv={openPessoaSheet}
              />
              <PartesBlock
                icon={Users}
                iconClass="text-muted-foreground"
                label="Réu"
                parte={primeiroReu}
                fallbackNome={processo.parte_re}
                advogados={advogadosReu}
                onClickParte={primeiroReu ? () => openPessoaSheet(primeiroReu) : () => openPessoaSheetByName(processo.parte_re)}
                onClickAdv={openPessoaSheet}
              />
            </div>

            {processo.observacoes && (
              <p className="text-xs text-muted-foreground italic border-t border-border/10 pt-2">
                {processo.observacoes}
              </p>
            )}
          </div>

          {/* ── Row 3: Summary footer ── */}
          <div className="grid grid-cols-3 border-t border-border/20">
            <SummaryCell icon={DollarSign} label="Valor da Causa" value={fmt(processo.valor_estimado)} accent="text-primary" />
            <SummaryCell icon={Clock} label="Último Movimento" value={ultimoMov ? ultimoMov.titulo : "Nenhum"} sub={ultimoMov ? fmtDate(ultimoMov.data_andamento) : undefined} />
            <SummaryCell icon={CalendarClock} label="Prazos" value="Nenhum" accent="text-muted-foreground" />
          </div>
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

/* ── Sub-components ── */

function PartesBlock({ icon: Icon, iconClass, label, parte, fallbackNome, advogados, onClickParte, onClickAdv }: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  parte?: ProcessoParte;
  fallbackNome: string;
  advogados: ProcessoParte[];
  onClickParte: () => void;
  onClickAdv: (adv: ProcessoParte) => void;
}) {
  const nome = parte?.nome ?? fallbackNome;
  const cpf = parte?.cpf_cnpj;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconClass} shrink-0`} />
        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{label}:</span>
        <button onClick={onClickParte} className="font-medium text-primary hover:underline cursor-pointer truncate max-w-[280px]">{nome}</button>
        {cpf && <span className="text-muted-foreground">({cpf})</span>}
      </div>
      {advogados.map(adv => (
        <div key={adv.id} className="flex items-center gap-1.5 ml-5">
          <Gavel className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground">Adv. {label}:</span>
          <button onClick={() => onClickAdv(adv)} className="font-medium text-primary hover:underline cursor-pointer">{adv.nome}</button>
          {adv.advogado_oab && <span className="text-muted-foreground ml-0.5">({adv.advogado_oab})</span>}
        </div>
      ))}
    </div>
  );
}

function SummaryCell({ icon: Icon, label, value, sub, accent = "text-foreground" }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="px-4 py-2.5 border-r border-border/20 last:border-r-0">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className={`w-3 h-3 ${accent}`} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-[11px] font-semibold truncate ${accent}`}>{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
