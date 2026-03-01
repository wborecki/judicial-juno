import { useParams, useNavigate } from "react-router-dom";
import { useProcesso, useUpdateProcesso, Processo } from "@/hooks/useProcessos";
import { useNegocios, useCreateNegocio, useUpdateNegocio, NegocioDB } from "@/hooks/useNegocios";
import { useUsuarios } from "@/hooks/useEquipes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Scale, CheckCircle2, XCircle, RotateCcw, Clock,
  Gavel, FileText, Banknote, MapPin, Calendar, User, Users,
  DollarSign, Briefcase, TrendingUp, Plus
} from "lucide-react";

const STATUS_LABELS: Record<number, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

const PIPELINE_LABELS: Record<string, string> = {
  captado: "Captado",
  triagem: "Em Triagem",
  distribuido: "Distribuído",
  em_analise: "Em Análise",
  precificado: "Precificado",
  comercial: "Comercial",
};

const PIPELINE_COLORS: Record<string, string> = {
  captado: "bg-muted text-muted-foreground",
  triagem: "bg-warning/10 text-warning",
  distribuido: "bg-info/10 text-info",
  em_analise: "bg-accent/10 text-accent",
  precificado: "bg-primary/10 text-primary",
  comercial: "bg-info/10 text-info",
};

const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente",
  apto: "Apto",
  descartado: "Descartado",
  "reanálise": "Reanálise",
};

const TRIBUNAIS = [
  "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6",
  "TJSP", "TJRJ", "TJMG", "TJRS", "TJPR", "TJSC",
  "TJBA", "TJPE", "TJCE", "TJGO", "TJDF",
  "TRT1", "TRT2", "TRT3", "TRT4", "TRT5",
  "JEF",
];

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
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
  const { data: usuarios } = useUsuarios();
  const updateProcesso = useUpdateProcesso();
  const createNegocio = useCreateNegocio();

  const [tribunal, setTribunal] = useState("");
  const [natureza, setNatureza] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState("");
  const [statusProcesso, setStatusProcesso] = useState("");
  const [transitoJulgado, setTransitoJulgado] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [triageObs, setTriageObs] = useState("");

  useEffect(() => {
    if (processo) {
      setTribunal(processo.tribunal);
      setNatureza(processo.natureza);
      setTipoPagamento(processo.tipo_pagamento);
      setStatusProcesso(String(processo.status_processo));
      setTransitoJulgado(processo.transito_julgado);
      setObservacoes(processo.observacoes ?? "");
      setTriageObs(processo.triagem_observacoes ?? "");
    }
  }, [processo]);

  const handleTriagem = async (resultado: string) => {
    if (!processo) return;
    try {
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          tribunal,
          natureza,
          tipo_pagamento: tipoPagamento,
          status_processo: Number(statusProcesso),
          transito_julgado: transitoJulgado,
          observacoes,
          triagem_resultado: resultado,
          triagem_observacoes: triageObs,
          triagem_data: new Date().toISOString(),
          pipeline_status: resultado === "apto" ? "distribuido" : "triagem",
        },
      });
      toast.success(`Processo marcado como ${TRIAGEM_LABELS[resultado]}`);
    } catch {
      toast.error("Erro ao atualizar processo");
    }
  };

  const handleSaveFields = async () => {
    if (!processo) return;
    try {
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          tribunal,
          natureza,
          tipo_pagamento: tipoPagamento,
          status_processo: Number(statusProcesso),
          transito_julgado: transitoJulgado,
          observacoes,
          triagem_observacoes: triageObs,
        },
      });
      toast.success("Dados salvos com sucesso");
    } catch {
      toast.error("Erro ao salvar dados");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
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

  const analista = usuarios?.find(u => u.id === processo.analista_id);
  const precificador = usuarios?.find(u => u.id === processo.precificado_por);

  const pipelineSteps = ["captado", "triagem", "distribuido", "em_analise", "precificado", "comercial"];
  const currentStepIdx = pipelineSteps.indexOf(processo.pipeline_status);

  const defaultTab = processo.pipeline_status === "triagem" ? "triagem"
    : processo.pipeline_status === "em_analise" ? "analise"
    : processo.pipeline_status === "precificado" ? "precificacao"
    : processo.pipeline_status === "comercial" ? "comercial"
    : "dados";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-mono text-lg font-bold tracking-tight">{processo.numero_processo}</h1>
            <Badge className={PIPELINE_COLORS[processo.pipeline_status]}>
              {PIPELINE_LABELS[processo.pipeline_status]}
            </Badge>
            {processo.triagem_resultado && processo.triagem_resultado !== "pendente" && (
              <Badge variant="outline" className="text-xs">
                Triagem: {TRIAGEM_LABELS[processo.triagem_resultado]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {processo.parte_autora} · {processo.tribunal} · {processo.tipo_pagamento} · {formatCurrency(processo.valor_estimado)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveFields}>
          Salvar Alterações
        </Button>
      </div>

      {/* Pipeline Progress */}
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex items-center gap-1">
            {pipelineSteps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              const isLost = false;
              return (
                <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`h-2 w-full rounded-full transition-colors ${
                    isLost ? "bg-destructive/30" :
                    isPast ? "bg-success" :
                    isActive ? "bg-primary" :
                    "bg-muted"
                  }`} />
                  <span className={`text-[10px] font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {PIPELINE_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
          <TabsTrigger value="partes">Partes</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="triagem">Triagem</TabsTrigger>
          <TabsTrigger value="analise" disabled={currentStepIdx < 3}>
            Análise
          </TabsTrigger>
          <TabsTrigger value="precificacao" disabled={currentStepIdx < 4}>
            Precificação
          </TabsTrigger>
          <TabsTrigger value="comercial" disabled={currentStepIdx < 5}>
            Comercial
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dados do Processo */}
        <TabsContent value="dados">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={Gavel} label="Tribunal">
                  <Select value={tribunal} onValueChange={setTribunal}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIBUNAIS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </InfoRow>
                <InfoRow icon={FileText} label="Natureza">
                  <Select value={natureza} onValueChange={setNatureza}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Cível", "Trabalhista", "Federal", "Previdenciário", "Tributário"].map(n =>
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </InfoRow>
                <InfoRow icon={Banknote} label="Tipo Pagamento">
                  <Select value={tipoPagamento} onValueChange={setTipoPagamento}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RPV">RPV</SelectItem>
                      <SelectItem value="Precatório">Precatório</SelectItem>
                    </SelectContent>
                  </Select>
                </InfoRow>
                <InfoRow icon={MapPin} label="Status Processo">
                  <Select value={statusProcesso} onValueChange={setStatusProcesso}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(s =>
                        <SelectItem key={s} value={String(s)}>S{s} - {STATUS_LABELS[s]}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </InfoRow>
                <div className="flex items-center justify-between py-1">
                  <Label className="text-xs text-muted-foreground">Trânsito em Julgado</Label>
                  <Switch checked={transitoJulgado} onCheckedChange={setTransitoJulgado} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />Partes e Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField label="Parte Autora" value={processo.parte_autora} />
                <InfoField label="Parte Ré" value={processo.parte_re} />
                <InfoField label="Valor Estimado" value={formatCurrency(processo.valor_estimado)} />
                <InfoField label="Data Distribuição" value={formatDate(processo.data_distribuicao)} />
                <InfoField label="Data Captação" value={formatDate(processo.data_captacao)} />
                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs text-muted-foreground">Observações</Label>
                  <Textarea
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Notas gerais sobre o processo..."
                    className="resize-none h-20 text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Partes */}
        <TabsContent value="partes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />Parte Autora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField label="Nome" value={processo.parte_autora} />
                {processo.pessoa_id && (
                  <p className="text-xs text-muted-foreground">Pessoa vinculada: {processo.pessoa_id.slice(0, 8)}...</p>
                )}
                {!processo.pessoa_id && (
                  <p className="text-xs text-muted-foreground italic">Nenhuma pessoa vinculada ao processo.</p>
                )}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />Parte Ré
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField label="Nome" value={processo.parte_re} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documentos">
          <Card className="glass-card">
            <CardContent className="p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Documentos do Processo</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Em breve será possível fazer upload e gerenciar documentos vinculados a este processo,
                como petições, decisões, ofícios requisitórios e outros anexos.
              </p>
              <Button variant="outline" size="sm" disabled>
                <Plus className="w-4 h-4 mr-2" />Adicionar Documento (em breve)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Triagem */}
        <TabsContent value="triagem">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-warning" />Qualificação do Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="Resultado Atual" value={TRIAGEM_LABELS[processo.triagem_resultado ?? "pendente"]} />
                <InfoField label="Data da Triagem" value={formatDate(processo.triagem_data)} />
                <InfoField label="Status do Processo" value={`S${processo.status_processo} - ${STATUS_LABELS[processo.status_processo]}`} />
                <InfoField label="Trânsito em Julgado" value={processo.transito_julgado ? "Sim" : "Não"} />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Observações da Triagem</Label>
                  <Textarea
                    value={triageObs}
                    onChange={e => setTriageObs(e.target.value)}
                    placeholder="Notas sobre a triagem..."
                    className="resize-none h-20 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />Ações de Triagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Analise os dados do processo e defina se ele está apto para avançar no pipeline,
                  precisa de reanálise ou deve ser descartado.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => handleTriagem("apto")}
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                    disabled={updateProcesso.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />Aprovar — Apto
                  </Button>
                  <Button
                    onClick={() => handleTriagem("reanálise")}
                    variant="outline"
                    className="w-full border-info/30 text-info hover:bg-info/10"
                    disabled={updateProcesso.isPending}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />Reanálise
                  </Button>
                  <Button
                    onClick={() => handleTriagem("descartado")}
                    variant="outline"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={updateProcesso.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />Descartar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Análise */}
        <TabsContent value="analise">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />Dados da Análise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField label="Equipe Responsável" value={processo.equipe_id ? "Atribuída" : "Não atribuída"} />
                <InfoField label="Analista" value={analista?.nome ?? "Não atribuído"} />
                <InfoField label="Distribuído em" value={formatDate(processo.distribuido_em)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Precificação */}
        <TabsContent value="precificacao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />Precificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField label="Valor Estimado" value={formatCurrency(processo.valor_estimado)} />
                <InfoField label="Valor Precificado" value={formatCurrency(processo.valor_precificado)} />
                <InfoField label="Data Precificação" value={formatDate(processo.precificacao_data)} />
                <InfoField label="Precificado por" value={precificador?.nome ?? "—"} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Comercial */}
        <TabsContent value="comercial">
          <div className="space-y-4">
            {negocios.length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">Nenhum negócio vinculado a este processo.</p>
                  <Button
                    onClick={async () => {
                      if (!processo) return;
                      try {
                        await createNegocio.mutateAsync({
                          processo_id: processo.id,
                          pessoa_id: processo.pessoa_id,
                          tipo_servico: null,
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
                    }}
                    disabled={createNegocio.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />Criar Negócio
                  </Button>
                </CardContent>
              </Card>
            )}
            {negocios.map(n => {
              const statusLabel = n.negocio_status === "ganho" ? "Ganho" : n.negocio_status === "perdido" ? "Perdido" : "Em Andamento";
              return (
                <Card key={n.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-info" />Negócio — {statusLabel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoField label="Tipo de Serviço" value={n.tipo_servico ? TIPO_SERVICO_LABELS[n.tipo_servico] : "—"} />
                    <InfoField label="Valor Proposta" value={formatCurrency(n.valor_proposta)} />
                    <InfoField label="Valor Fechamento" value={formatCurrency(n.valor_fechamento)} />
                    <InfoField label="Data Fechamento" value={formatDate(n.data_fechamento)} />
                    <InfoField label="Status" value={statusLabel} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Timeline */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TimelineItem date={processo.data_captacao} label="Lead captado" />
            {processo.pipeline_status !== "captado" && (
              <TimelineItem date={processo.triagem_data ?? processo.data_captacao} label="Enviado para triagem" />
            )}
            {processo.triagem_resultado && processo.triagem_resultado !== "pendente" && (
              <TimelineItem date={processo.triagem_data} label={`Triagem: ${TRIAGEM_LABELS[processo.triagem_resultado]}`} />
            )}
            {processo.distribuido_em && (
              <TimelineItem date={processo.distribuido_em} label="Distribuído para equipe" />
            )}
            {processo.precificacao_data && (
              <TimelineItem date={processo.precificacao_data} label={`Precificado: ${formatCurrency(processo.valor_precificado)}`} />
            )}
            {negocios.filter(n => n.data_fechamento).map(n => (
              <TimelineItem key={n.id} date={n.data_fechamento} label={`Negócio ${n.negocio_status}: ${formatCurrency(n.valor_fechamento)}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="text-xs text-muted-foreground w-28 shrink-0">{label}</Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function TimelineItem({ date, label }: { date?: string | null; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
      <span className="text-[11px] text-muted-foreground w-20 shrink-0">{formatDate(date)}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function Filter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
