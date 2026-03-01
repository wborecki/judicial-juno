import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProcesso } from "@/hooks/useProcessos";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useProcessoDocumentos } from "@/hooks/useProcessoDocumentos";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Users, Clock, Link2, StickyNote, Landmark } from "lucide-react";
import ProcessoHeader from "@/components/processo/ProcessoHeader";
import ModalConverter from "@/components/processo/ModalConverter";
import ModalDescartar from "@/components/processo/ModalDescartar";
import TabPartes from "@/components/processo/TabPartes";
import TabAndamentos from "@/components/processo/TabAndamentos";
import TabDocumentos from "@/components/processo/TabDocumentos";
import TabNotas from "@/components/processo/TabNotas";

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: processo, isLoading } = useProcesso(id);
  const { data: andamentos = [] } = useProcessoAndamentos(id);
  const { data: documentos = [] } = useProcessoDocumentos(id);
  const { data: partes = [] } = useProcessoPartes(id);

  const [convertOpen, setConvertOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
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

  return (
    <div className="space-y-4 max-w-7xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" />Voltar
      </Button>

      <ProcessoHeader
        processo={processo}
        onConvert={() => setConvertOpen(true)}
        onDiscard={() => setDiscardOpen(true)}
      />

      <Tabs defaultValue="partes" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 border-b border-border rounded-none pb-2">
          <TabsTrigger value="partes" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Users className="w-3.5 h-3.5" />Partes
            <span className="text-[10px] text-muted-foreground ml-0.5">({partes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="andamentos" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Clock className="w-3.5 h-3.5" />Movimentações
            <span className="text-[10px] text-muted-foreground ml-0.5">({andamentos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <FileText className="w-3.5 h-3.5" />Documentos
            <span className="text-[10px] text-muted-foreground ml-0.5">({documentos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Landmark className="w-3.5 h-3.5" />Financeiro
          </TabsTrigger>
          <TabsTrigger value="relacionados" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Link2 className="w-3.5 h-3.5" />Relacionados
          </TabsTrigger>
          <TabsTrigger value="notas" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <StickyNote className="w-3.5 h-3.5" />Anotações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partes" className="mt-4">
          <TabPartes processoId={processo.id} parteAutoraLegacy={processo.parte_autora} parteReLegacy={processo.parte_re} />
        </TabsContent>

        <TabsContent value="andamentos" className="mt-4">
          <TabAndamentos processoId={processo.id} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <TabDocumentos processoId={processo.id} />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <PlaceholderField label="Nº Requisitório" value="—" />
              <PlaceholderField label="Ente Devedor" value="—" />
              <PlaceholderField label="Data-Base" value="—" />
              <PlaceholderField label="Valor Bruto" value="—" />
              <PlaceholderField label="Deduções" value="—" />
              <PlaceholderField label="Valor Líquido" value="—" />
              <PlaceholderField label="LOA" value="—" />
              <PlaceholderField label="Status" value="—" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 italic">Dados financeiros ainda não disponíveis.</p>
          </div>
        </TabsContent>

        <TabsContent value="relacionados" className="mt-4">
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <PlaceholderField label="Processo Principal" value="—" />
              <PlaceholderField label="Cumprimentos" value="Nenhum" />
              <PlaceholderField label="Apensos" value="Nenhum" />
              <PlaceholderField label="Recursos" value="Nenhum" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 italic">Vinculação de processos ainda não disponível.</p>
          </div>
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <TabNotas processoId={processo.id} />
        </TabsContent>
      </Tabs>

      <ModalConverter processo={processo} open={convertOpen} onOpenChange={setConvertOpen} />
      <ModalDescartar processo={processo} open={discardOpen} onOpenChange={setDiscardOpen} />
    </div>
  );
}

function PlaceholderField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-medium text-muted-foreground/60">{value}</p>
    </div>
  );
}
