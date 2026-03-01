import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useProcesso } from "@/hooks/useProcessos";
import { useCreateNegocio } from "@/hooks/useNegocios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Users, Clock, CheckCircle, Briefcase, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import TabDadosGerais from "@/components/processo/TabDadosGerais";
import TabPartes from "@/components/processo/TabPartes";
import TabAndamentos from "@/components/processo/TabAndamentos";
import TabDocumentos from "@/components/processo/TabDocumentos";
import TabTriagem from "@/components/processo/TabTriagem";
import TabNegocios from "@/components/processo/TabNegocios";

const STATUS_LABELS: Record<number, string> = { 1: "Ativo", 2: "Suspenso", 3: "Arquivado" };
const TRIAGEM_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  apto: "bg-success/10 text-success border-success/20",
  descartado: "bg-destructive/10 text-destructive border-destructive/20",
  "reanálise": "bg-info/10 text-info border-info/20",
};
const TRIAGEM_LABELS: Record<string, string> = {
  pendente: "Pendente", apto: "Apto", descartado: "Descartado", "reanálise": "Reanálise",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "dados";
  const { data: processo, isLoading } = useProcesso(id);
  const createNegocio = useCreateNegocio();

  const handleEnviarNegocios = async () => {
    if (!processo) return;
    try {
      await createNegocio.mutateAsync({
        processo_id: processo.id,
        valor_proposta: processo.valor_estimado,
        negocio_status: "em_andamento",
        data_abertura: new Date().toISOString(),
        pessoa_id: processo.pessoa_id,
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

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
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

  return (
    <div className="space-y-4 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/processos")} className="text-xs gap-1.5 -ml-2">
        <ArrowLeft className="w-3.5 h-3.5" />Voltar à listagem
      </Button>

      {/* Strong Header */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-lg font-bold">{processo.numero_processo}</h1>
              <Badge variant="secondary" className={`text-[10px] ${TRIAGEM_COLORS[triagem]}`}>
                {TRIAGEM_LABELS[triagem]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {STATUS_LABELS[processo.status_processo] ?? "—"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium text-foreground">{processo.tribunal}</span>
              {processo.vara_comarca && <span>• {processo.vara_comarca}</span>}
              {processo.classe_fase && <span>• {processo.classe_fase}</span>}
              <span>• {processo.transito_julgado ? "Trânsito em julgado" : "Sem trânsito"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right mr-2">
              <p className="text-[10px] text-muted-foreground">Valor Estimado</p>
              <p className="text-sm font-bold">{formatCurrency(processo.valor_estimado)}</p>
            </div>
            {triagem === "apto" && (
              <Button
                size="sm"
                className="text-xs gap-1.5"
                onClick={handleEnviarNegocios}
                disabled={createNegocio.isPending}
              >
                <Briefcase className="w-3.5 h-3.5" />Criar Negócio
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="dados" className="text-xs gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="partes" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />Partes
          </TabsTrigger>
          <TabsTrigger value="andamentos" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" />Movimentações
          </TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" />Documentos
          </TabsTrigger>
          <TabsTrigger value="triagem" className="text-xs gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />Triagem
          </TabsTrigger>
          {triagem === "apto" && (
            <TabsTrigger value="negocios" className="text-xs gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />Negócios
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dados">
          <TabDadosGerais processo={processo} />
        </TabsContent>
        <TabsContent value="partes">
          <TabPartes processoId={processo.id} parteAutoraLegacy={processo.parte_autora} parteReLegacy={processo.parte_re} />
        </TabsContent>
        <TabsContent value="andamentos">
          <TabAndamentos processoId={processo.id} />
        </TabsContent>
        <TabsContent value="documentos">
          <TabDocumentos processoId={processo.id} />
        </TabsContent>
        <TabsContent value="triagem">
          <TabTriagem processo={processo} />
        </TabsContent>
        {triagem === "apto" && (
          <TabsContent value="negocios">
            <TabNegocios processo={processo} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
