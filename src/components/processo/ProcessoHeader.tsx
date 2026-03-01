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
import { Copy, Check, MoreHorizontal, Pencil, RefreshCw, ExternalLink, ArrowLeft, User, Users, Gavel, MapPin, Scale, Building, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useProcessoPartes, ProcessoParte } from "@/hooks/useProcessoPartes";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useNegocios } from "@/hooks/useNegocios";
import { useNavigate } from "react-router-dom";
import { DollarSign, Clock, CalendarClock, Briefcase, FileText } from "lucide-react";
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

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const formatDate = (d?: string | null) => {
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
  const { data: negocios = [] } = useNegocios(processo.id);
  const [copied, setCopied] = useState(false);
  const [editValorOpen, setEditValorOpen] = useState(false);
  const [valorEdit, setValorEdit] = useState(processo.valor_estimado ?? 0);

  // Pessoa sheet state
  const [pessoaSheetOpen, setPessoaSheetOpen] = useState(false);
  const [pessoaSheetData, setPessoaSheetData] = useState<{ pessoaId?: string | null; nome?: string; cpfCnpj?: string | null }>({});

  const triagem = processo.triagem_resultado ?? "pendente";

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
    setPessoaSheetData({
      pessoaId: parte.pessoa_id,
      nome: parte.nome,
      cpfCnpj: parte.cpf_cnpj,
    });
    setPessoaSheetOpen(true);
  };

  const openPessoaSheetByName = (nome: string) => {
    setPessoaSheetData({ nome });
    setPessoaSheetOpen(true);
  };

  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  // Categorize partes
  const autores = partes.filter(p => p.tipo === "autor");
  const reus = partes.filter(p => p.tipo === "reu");
  const advogadosAutor = partes.filter(p => p.tipo === "advogado_autor");
  const advogadosReu = partes.filter(p => p.tipo === "advogado_reu");
  // Fallback: advogados sem tipo específico que tenham OAB
  const advogadosGeral = partes.filter(p => p.advogado_oab && !p.tipo.startsWith("advogado"));

  const primeiroAutor = autores[0];
  const primeiroReu = reus[0];

  // Resumo data
  const ultimoMov = andamentos[0];

  return (
    <>
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/processos")} className="text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" />Voltar
        </Button>

        <div className="bg-card border border-border/40 rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] overflow-hidden">
          {/* Row 1: CNJ + Value + Actions */}
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

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-medium">{processo.tribunal}</Badge>
                  <Badge variant="outline" className="text-[10px]">{processo.natureza}</Badge>
                  <Badge variant="outline" className="text-[10px]">{processo.tipo_pagamento}</Badge>
                  {processo.classe_fase && <Badge variant="outline" className="text-[10px]">{processo.classe_fase}</Badge>}
                  <Badge variant="outline" className="text-[10px]">
                    S{processo.status_processo} — {STATUS_LABELS[processo.status_processo] ?? "—"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${processo.transito_julgado ? "border-success/30 text-success" : "border-muted-foreground/30 text-muted-foreground"}`}
                  >
                    Trânsito: {processo.transito_julgado ? "Sim" : "Não"}
                  </Badge>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right mr-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor Estimado</p>
                  <p className="text-sm font-bold">{formatCurrency(processo.valor_estimado)}</p>
                </div>

                <Badge className={`text-[10px] ${TRIAGEM_COLORS[triagem]}`}>
                  {TRIAGEM_LABELS[triagem]}
                </Badge>

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
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setValorEdit(processo.valor_estimado ?? 0); setEditValorOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />Editar Valor Estimado
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

          {/* Row 2: Processo details + Partes */}
          <div className="px-4 pb-3 border-t border-border/20 pt-3 space-y-2">
            {/* Process details rows */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
              {processo.classe_fase && (
                <DetailField label="Classe Judicial" icon={Scale} value={processo.classe_fase} />
              )}
              {(processo as any).assunto && (
                <DetailField label="Assunto" icon={FileText} value={(processo as any).assunto} />
              )}
              <DetailField label="Valor da Causa" value={formatCurrency(processo.valor_estimado)} />
              {(processo as any).orgao_julgador && (
                <DetailField label="Órgão Julgador" icon={Landmark} value={(processo as any).orgao_julgador} />
              )}
              {processo.vara_comarca && (
                <DetailField label="Vara / Comarca" icon={MapPin} value={processo.vara_comarca} />
              )}
              {(processo as any).area && (
                <DetailField label="Área" value={(processo as any).area} />
              )}
              {(processo as any).foro && (
                <DetailField label="Foro" icon={Building} value={(processo as any).foro} />
              )}
              {(processo as any).juiz && (
                <DetailField label="Juiz" icon={Gavel} value={(processo as any).juiz} />
              )}
              {(processo as any).competencia && (
                <DetailField label="Competência" value={(processo as any).competencia} />
              )}
              {(processo as any).data_autuacao && (
                <DetailField label="Autuação" value={formatDate((processo as any).data_autuacao)} />
              )}
              {processo.data_distribuicao && (
                <DetailField label="Distribuição" value={formatDate(processo.data_distribuicao)} />
              )}
            </div>

            {/* Partes with hierarchy: Autor + Adv Autor | Réu + Adv Réu */}
            <div className="flex items-start gap-8 text-xs flex-wrap">
              {/* Polo Ativo */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Autor:</span>
                  {primeiroAutor ? (
                    <button onClick={() => openPessoaSheet(primeiroAutor)} className="font-medium text-primary hover:underline cursor-pointer truncate max-w-[220px]">
                      {primeiroAutor.nome}
                    </button>
                  ) : (
                    <button onClick={() => openPessoaSheetByName(processo.parte_autora)} className="font-medium text-primary hover:underline cursor-pointer truncate max-w-[220px]">
                      {processo.parte_autora}
                    </button>
                  )}
                  {primeiroAutor?.cpf_cnpj && <span className="text-muted-foreground">({primeiroAutor.cpf_cnpj})</span>}
                </div>
                {advogadosAutor.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-5">
                    <Gavel className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground">Adv. Autor:</span>
                    {advogadosAutor.map((adv, i) => (
                      <span key={adv.id}>
                        {i > 0 && <span className="text-muted-foreground">, </span>}
                        <button onClick={() => openPessoaSheet(adv)} className="font-medium text-primary hover:underline cursor-pointer">{adv.nome}</button>
                        {adv.advogado_oab && <span className="text-muted-foreground ml-0.5">({adv.advogado_oab})</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Polo Passivo */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Réu:</span>
                  {primeiroReu ? (
                    <button onClick={() => openPessoaSheet(primeiroReu)} className="font-medium text-primary hover:underline cursor-pointer truncate max-w-[220px]">
                      {primeiroReu.nome}
                    </button>
                  ) : (
                    <button onClick={() => openPessoaSheetByName(processo.parte_re)} className="font-medium text-primary hover:underline cursor-pointer truncate max-w-[220px]">
                      {processo.parte_re}
                    </button>
                  )}
                  {primeiroReu?.cpf_cnpj && <span className="text-muted-foreground">({primeiroReu.cpf_cnpj})</span>}
                </div>
                {advogadosReu.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-5">
                    <Gavel className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground">Adv. Réu:</span>
                    {advogadosReu.map((adv, i) => (
                      <span key={adv.id}>
                        {i > 0 && <span className="text-muted-foreground">, </span>}
                        <button onClick={() => openPessoaSheet(adv)} className="font-medium text-primary hover:underline cursor-pointer">{adv.nome}</button>
                        {adv.advogado_oab && <span className="text-muted-foreground ml-0.5">({adv.advogado_oab})</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Observações inline */}
            {processo.observacoes && (
              <p className="text-xs text-muted-foreground italic border-t border-border/10 pt-2 mt-1">
                {processo.observacoes}
              </p>
            )}
          </div>

          {/* Row 3: Summary mini-cards */}
          <div className="grid grid-cols-3 border-t border-border/20">
            <SummaryCell icon={DollarSign} label="Valor Estimado" value={formatCurrency(processo.valor_estimado)} accent="text-primary" />
            <SummaryCell icon={Clock} label="Último Movimento" value={ultimoMov ? ultimoMov.titulo : "Nenhum"} sub={ultimoMov ? formatDate(ultimoMov.data_andamento) : undefined} />
            <SummaryCell icon={CalendarClock} label="Prazos" value="Nenhum" accent="text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Edit valor dialog */}
      <Dialog open={editValorOpen} onOpenChange={setEditValorOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Editar Valor Estimado</DialogTitle>
          </DialogHeader>
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

      {/* Pessoa Sheet */}
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

function SummaryCell({ icon: Icon, label, value, sub, accent = "text-foreground" }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="px-3 py-2.5 border-r border-border/20 last:border-r-0">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className={`w-3 h-3 ${accent}`} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-[11px] font-semibold truncate ${accent}`}>{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function DetailField({ label, value, icon: Icon }: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="font-medium flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground shrink-0" />}
        {value}
      </p>
    </div>
  );
}
