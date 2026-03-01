import { useParams, useNavigate } from "react-router-dom";
import { useProcesso, useUpdateProcesso } from "@/hooks/useProcessos";
import { useNegocios, useCreateNegocio, NegocioDB } from "@/hooks/useNegocios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, XCircle, RotateCcw, Clock,
  ExternalLink, Briefcase, Plus, User, Users
} from "lucide-react";

const STATUS_LABELS: Record<number, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente",
  apto: "Apto",
  descartado: "Descartado",
  "reanálise": "Reanálise",
};

const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
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

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: processo, isLoading } = useProcesso(id);
  const { data: negocios = [] } = useNegocios(id);
  const updateProcesso = useUpdateProcesso();
  const createNegocio = useCreateNegocio();

  const [triageObs, setTriageObs] = useState("");
  const [tipoServico, setTipoServico] = useState("compra_credito");

  useEffect(() => {
    if (processo) {
      setTriageObs(processo.triagem_observacoes ?? "");
    }
  }, [processo]);

  const handleTriagem = async (resultado: string) => {
    if (!processo) return;
    try {
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          triagem_resultado: resultado,
          triagem_observacoes: triageObs,
          triagem_data: new Date().toISOString(),
        },
      });
      toast.success(`Processo marcado como ${TRIAGEM_LABELS[resultado]}`);
    } catch {
      toast.error("Erro ao atualizar processo");
    }
  };

  const handleCreateNegocio = async () => {
    if (!processo) return;
    try {
      await createNegocio.mutateAsync({
        processo_id: processo.id,
        pessoa_id: processo.pessoa_id,
        tipo_servico: tipoServico,
        negocio_status: "em_andamento",
        valor_proposta: null,
        valor_fechamento: null,
        data_abertura: new Date().toISOString(),
        data_fechamento: null,
        responsavel_id: null,
        observacoes: null,
      });
      toast.success("Negócio criado com sucesso");
    } catch {
      toast.error("Erro ao criar negócio");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Processo não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />Voltar
        </Button>
      </div>
    );
  }

  const triagem = processo.triagem_resultado ?? "pendente";
  const tribunalUrl = TRIBUNAL_URLS[processo.tribunal]
    ? `${TRIBUNAL_URLS[processo.tribunal]}${processo.numero_processo}`
    : null;

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl">
      {/* Navigation */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/processos")} className="text-xs gap-1.5 -ml-2">
        <ArrowLeft className="w-3.5 h-3.5" />Voltar à listagem
      </Button>

      {/* Header — Cabeçalho do Processo */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono text-lg font-bold tracking-tight">{processo.numero_processo}</h1>
                {tribunalUrl && (
                  <a href={tribunalUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <Badge className={TRIAGEM_COLORS[triagem]}>
                  {TRIAGEM_LABELS[triagem]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded">{processo.tribunal}</span>
                <span>{processo.natureza}</span>
                <span>{processo.tipo_pagamento}</span>
                <span>S{processo.status_processo} — {STATUS_LABELS[processo.status_processo]}</span>
                <span>Trânsito: {processo.transito_julgado ? "✓ Sim" : "Não"}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Valor Estimado</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(processo.valor_estimado)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parte Autora</p>
            </div>
            <p className="text-sm font-medium">{processo.parte_autora}</p>
            {processo.pessoa_id && (
              <p className="text-[10px] text-muted-foreground mt-1">Pessoa vinculada</p>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parte Ré</p>
            </div>
            <p className="text-sm font-medium">{processo.parte_re}</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise / Triagem — Ação rápida */}
      <Card className="glass-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Análise e Triagem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Resultado Atual</p>
              <p className="font-medium">{TRIAGEM_LABELS[triagem]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data Triagem</p>
              <p className="font-medium">{formatDate(processo.triagem_data)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Captação</p>
              <p className="font-medium">{formatDate(processo.data_captacao)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Distribuição</p>
              <p className="font-medium">{formatDate(processo.data_distribuicao)}</p>
            </div>
          </div>

          <Textarea
            value={triageObs}
            onChange={e => setTriageObs(e.target.value)}
            placeholder="Observações da análise..."
            className="resize-none h-16 text-xs"
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleTriagem("apto")}
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground text-xs gap-1.5"
              disabled={updateProcesso.isPending}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />Apto
            </Button>
            <Button
              onClick={() => handleTriagem("reanálise")}
              variant="outline"
              size="sm"
              className="border-info/30 text-info hover:bg-info/10 text-xs gap-1.5"
              disabled={updateProcesso.isPending}
            >
              <RotateCcw className="w-3.5 h-3.5" />Reanálise
            </Button>
            <Button
              onClick={() => handleTriagem("descartado")}
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-1.5"
              disabled={updateProcesso.isPending}
            >
              <XCircle className="w-3.5 h-3.5" />Descartar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Negócios vinculados */}
      <Card className="glass-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Negócios Vinculados
              {negocios.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">{negocios.length}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {negocios.length > 0 && (
            <div className="space-y-2">
              {negocios.map(n => (
                <NegocioRow key={n.id} negocio={n} />
              ))}
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2">
            <Select value={tipoServico} onValueChange={setTipoServico}>
              <SelectTrigger className="h-8 text-xs w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCreateNegocio} disabled={createNegocio.isPending} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />Criar Negócio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline compacta */}
      <Card className="glass-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
            <TimelineItem date={processo.data_captacao} label="Captado" />
            {processo.triagem_data && (
              <TimelineItem date={processo.triagem_data} label={`Triagem: ${TRIAGEM_LABELS[triagem]}`} />
            )}
            {processo.distribuido_em && (
              <TimelineItem date={processo.distribuido_em} label="Distribuído" />
            )}
            {processo.precificacao_data && (
              <TimelineItem date={processo.precificacao_data} label={`Precificado: ${formatCurrency(processo.valor_precificado)}`} />
            )}
            {negocios.filter(n => n.data_fechamento).map(n => (
              <TimelineItem key={n.id} date={n.data_fechamento} label={`Negócio ${n.negocio_status}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NegocioRow({ negocio }: { negocio: NegocioDB }) {
  const statusLabel = negocio.negocio_status === "ganho" ? "Ganho" : negocio.negocio_status === "perdido" ? "Perdido" : "Em Andamento";
  const statusColor = negocio.negocio_status === "ganho" ? "bg-success/10 text-success" : negocio.negocio_status === "perdido" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent-foreground";

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30">
      <div className="flex items-center gap-3 text-xs">
        <Badge variant="secondary" className={`text-[10px] ${statusColor}`}>{statusLabel}</Badge>
        <span className="font-medium">{negocio.tipo_servico ? TIPO_SERVICO_LABELS[negocio.tipo_servico] ?? negocio.tipo_servico : "Sem tipo"}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {negocio.valor_proposta && <span>{formatCurrency(negocio.valor_proposta)}</span>}
        <span>{formatDate(negocio.data_abertura)}</span>
      </div>
    </div>
  );
}

function TimelineItem({ date, label }: { date?: string | null; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      <span className="text-muted-foreground">{formatDate(date)}</span>
      <span>{label}</span>
    </span>
  );
}
