import { useParams, useNavigate, Link } from "react-router-dom";
import { useNegocio, useUpdateNegocio } from "@/hooks/useNegocios";
import { useDefaultPipeline } from "@/hooks/useNegocioPipelines";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Briefcase, CheckCircle2, XCircle, MoreHorizontal, Link as LinkIcon, Pencil, User, Activity, Settings2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
// ArrowLeft removed — now using breadcrumbs
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import TabDadosGerais from "@/components/negocios/TabDadosGerais";
import TabAtividades from "@/components/negocios/TabAtividades";
import TabCamposPersonalizados from "@/components/negocios/TabCamposPersonalizados";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

function formatCurrency(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function NegocioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: negocio, isLoading } = useNegocio(id);
  const { data: pipeline } = useDefaultPipeline();
  const updateNegocio = useUpdateNegocio();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleStartEditTitle = () => {
    setTitleValue(negocio?.titulo || "");
    setEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    setEditingTitle(false);
    if (!negocio || titleValue === (negocio.titulo || "")) return;
    try {
      await updateNegocio.mutateAsync({ id: negocio.id, updates: { titulo: titleValue || null } });
    } catch {
      toast.error("Erro ao salvar título");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Negócio não encontrado.</p>
        <Button variant="link" onClick={() => navigate("/negocios")}>Voltar</Button>
      </div>
    );
  }

  const etapas = pipeline?.etapas ?? [];
  const currentEtapa = etapas.find((e) => e.id === negocio.pipeline_etapa);

  const handleMarkGanho = () => {
    updateNegocio.mutate(
      { id: negocio.id, updates: { negocio_status: "ganho", data_fechamento: new Date().toISOString() } },
      { onSuccess: () => toast.success("Negócio marcado como ganho!"), onError: () => toast.error("Erro") }
    );
  };

  const handleMarkPerdido = () => {
    updateNegocio.mutate(
      { id: negocio.id, updates: { negocio_status: "perdido", data_fechamento: new Date().toISOString() } },
      { onSuccess: () => toast.success("Negócio marcado como perdido"), onError: () => toast.error("Erro") }
    );
  };

  const handleMoveEtapa = (etapaId: string) => {
    updateNegocio.mutate(
      { id: negocio.id, updates: { pipeline_etapa: etapaId } },
      { onSuccess: () => toast.success("Etapa atualizada"), onError: () => toast.error("Erro") }
    );
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto p-6 overflow-y-auto h-full">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Dashboard</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/negocios">Negócios</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{negocio.titulo || "Sem título"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              {editingTitle ? (
                <Input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                  className="h-8 text-lg font-bold tracking-tight px-1 -ml-1 border-transparent bg-transparent focus-visible:border-input focus-visible:bg-background focus-visible:ring-1"
                />
              ) : (
                <button onClick={handleStartEditTitle} className="group flex items-center gap-1.5 text-left">
                  <h1 className="text-lg font-bold tracking-tight truncate">{negocio.titulo || "Sem título"}</h1>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                {negocio.pessoas?.nome && <span>{negocio.pessoas.nome}</span>}
                {negocio.tipo_servico && (
                  <>
                    <span>·</span>
                    <span>{TIPO_SERVICO_LABELS[negocio.tipo_servico] ?? negocio.tipo_servico}</span>
                  </>
                )}
                {negocio.processos?.numero_processo && (
                  <>
                    <span>·</span>
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => navigate(`/processos/${negocio.processo_id}`, { state: { fromPath: `/negocios/${negocio.id}`, fromLabel: negocio.titulo || "Negócio" } })}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span className="font-mono">{negocio.processos.numero_processo}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {negocio.negocio_status === "em_andamento" && (
              <>
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleMarkGanho}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Ganho
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleMarkPerdido}>
                  <XCircle className="w-3.5 h-3.5 text-destructive" /> Perdido
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Em breve")}>Gerar Proposta</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Em breve")}>Duplicar Negócio</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Em breve")}>Arquivar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status */}
          <Badge
            variant="secondary"
            className={
              negocio.negocio_status === "ganho"
                ? "bg-success/10 text-success"
                : negocio.negocio_status === "perdido"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }
          >
            {negocio.negocio_status === "em_andamento" ? "Em andamento" : negocio.negocio_status === "ganho" ? "Ganho" : "Perdido"}
          </Badge>

          {/* Pipeline etapa selector */}
          {etapas.length > 0 && (
            <div className="flex items-center gap-1">
              {etapas.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => handleMoveEtapa(e.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    e.id === negocio.pipeline_etapa
                      ? "font-semibold"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  style={{
                    borderColor: e.cor,
                    backgroundColor: e.id === negocio.pipeline_etapa ? e.cor + "20" : "transparent",
                    color: e.cor,
                  }}
                >
                  {e.nome}
                </button>
              ))}
            </div>
          )}

          {/* Valor */}
          <div className="ml-auto text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Valor Proposta</p>
            <span className="text-sm font-bold">{formatCurrency(negocio.valor_proposta)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="w-full justify-start border-b border-border/40 rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="dados" className="data-[state=active]:border-primary data-[state=active]:text-foreground border-b-2 border-transparent rounded-none px-4 py-3 bg-transparent text-muted-foreground text-xs gap-2 data-[state=active]:shadow-none">
            <User className="w-3.5 h-3.5" /> Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="atividades" className="data-[state=active]:border-primary data-[state=active]:text-foreground border-b-2 border-transparent rounded-none px-4 py-3 bg-transparent text-muted-foreground text-xs gap-2 data-[state=active]:shadow-none">
            <Activity className="w-3.5 h-3.5" /> Atividades
          </TabsTrigger>
          <TabsTrigger value="campos" className="data-[state=active]:border-primary data-[state=active]:text-foreground border-b-2 border-transparent rounded-none px-4 py-3 bg-transparent text-muted-foreground text-xs gap-2 data-[state=active]:shadow-none">
            <Settings2 className="w-3.5 h-3.5" /> Campos Personalizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <TabDadosGerais negocio={negocio} />
        </TabsContent>
        <TabsContent value="atividades">
          <TabAtividades negocioId={negocio.id} />
        </TabsContent>
        <TabsContent value="campos">
          <TabCamposPersonalizados negocioId={negocio.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
