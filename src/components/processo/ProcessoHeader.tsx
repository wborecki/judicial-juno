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
import { Copy, Check, MoreHorizontal, Pencil, RefreshCw, ExternalLink, ArrowLeft, User, Users } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useNegocios } from "@/hooks/useNegocios";
import { useNavigate } from "react-router-dom";
import { DollarSign, Clock, CalendarClock, Shield, TrendingUp, Briefcase } from "lucide-react";

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

  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  // First autor and first reu
  const primeiroAutor = partes.find(p => p.tipo === "autor");
  const primeiroReu = partes.find(p => p.tipo === "reu");

  // Resumo data
  const ultimoMov = andamentos[0];
  const risco = !processo.transito_julgado ? "Alto" : (processo.valor_estimado ?? 0) > 200000 ? "Médio" : "Baixo";
  const riscoColor = risco === "Alto" ? "text-destructive" : risco === "Médio" ? "text-warning" : "text-success";
  const negocioStatus = negocios.length === 0 ? "Não criado" : negocios.some(n => n.negocio_status === "ganho") ? "Fechado" : "Em andamento";
  const negocioColor = negocioStatus === "Fechado" ? "text-success" : negocioStatus === "Em andamento" ? "text-primary" : "text-muted-foreground";

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

          {/* Row 2: Partes inline */}
          <div className="px-4 pb-3 flex items-center gap-6 text-xs border-t border-border/20 pt-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase">Autor:</span>
              <span className="font-medium truncate max-w-[200px]">
                {primeiroAutor?.nome ?? processo.parte_autora}
              </span>
              {primeiroAutor?.cpf_cnpj && (
                <span className="text-muted-foreground">({primeiroAutor.cpf_cnpj})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase">Réu:</span>
              <span className="font-medium truncate max-w-[200px]">
                {primeiroReu?.nome ?? processo.parte_re}
              </span>
            </div>
            {processo.vara_comarca && (
              <span className="text-muted-foreground ml-auto shrink-0">{processo.vara_comarca}</span>
            )}
          </div>

          {/* Row 3: Summary mini-cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-border/20">
            <SummaryCell icon={DollarSign} label="Valor Estimado" value={formatCurrency(processo.valor_estimado)} accent="text-primary" />
            <SummaryCell icon={Clock} label="Último Movimento" value={ultimoMov ? ultimoMov.titulo : "Nenhum"} sub={ultimoMov ? formatDate(ultimoMov.data_andamento) : undefined} />
            <SummaryCell icon={CalendarClock} label="Prazos" value="Nenhum" accent="text-muted-foreground" />
            <SummaryCell icon={Shield} label="Triagem" value={TRIAGEM_LABELS[triagem]} sub={formatDate(processo.triagem_data)} />
            <SummaryCell icon={TrendingUp} label="Risco" value={risco} accent={riscoColor} />
            <SummaryCell icon={Briefcase} label="Negócio" value={negocioStatus} accent={negocioColor} sub={negocios.length > 0 ? `${negocios.length}` : undefined} />
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
