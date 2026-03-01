import { useParams, useNavigate } from "react-router-dom";
import { useProcesso } from "@/hooks/useProcessos";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Users, Clock, CheckCircle, Briefcase, LayoutDashboard } from "lucide-react";
import TabDadosGerais from "@/components/processo/TabDadosGerais";
import TabPartes from "@/components/processo/TabPartes";
import TabAndamentos from "@/components/processo/TabAndamentos";
import TabDocumentos from "@/components/processo/TabDocumentos";
import TabTriagem from "@/components/processo/TabTriagem";
import TabNegocios from "@/components/processo/TabNegocios";

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: processo, isLoading } = useProcesso(id);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
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

  return (
    <div className="space-y-4 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/processos")} className="text-xs gap-1.5 -ml-2">
        <ArrowLeft className="w-3.5 h-3.5" />Voltar à listagem
      </Button>

      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="dados" className="text-xs gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="partes" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />Partes
          </TabsTrigger>
          <TabsTrigger value="andamentos" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" />Andamentos
          </TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" />Documentos
          </TabsTrigger>
          <TabsTrigger value="triagem" className="text-xs gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />Triagem
          </TabsTrigger>
          <TabsTrigger value="negocios" className="text-xs gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />Negócios
          </TabsTrigger>
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
        <TabsContent value="negocios">
          <TabNegocios processo={processo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
