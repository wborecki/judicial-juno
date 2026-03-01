import { useParams, useNavigate } from "react-router-dom";
import { useProcesso } from "@/hooks/useProcessos";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useProcessoDocumentos } from "@/hooks/useProcessoDocumentos";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, FileText, Users, Clock, Database, Link2, StickyNote, Landmark } from "lucide-react";
import ProcessoHeader from "@/components/processo/ProcessoHeader";
import ProcessoResumo from "@/components/processo/ProcessoResumo";
import PainelTriagem from "@/components/processo/PainelTriagem";
import TabDadosGerais from "@/components/processo/TabDadosGerais";
import TabPartes from "@/components/processo/TabPartes";
import TabAndamentos from "@/components/processo/TabAndamentos";
import TabDocumentos from "@/components/processo/TabDocumentos";

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: processo, isLoading } = useProcesso(id);
  const { data: andamentos = [] } = useProcessoAndamentos(id);
  const { data: documentos = [] } = useProcessoDocumentos(id);
  const { data: partes = [] } = useProcessoPartes(id);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-6xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
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

  // Counts for accordion previews
  const autores = partes.filter(p => p.tipo === "autor");
  const reus = partes.filter(p => p.tipo === "reu");
  const partesPreview = partes.length > 0
    ? `${autores.length} autor(es), ${reus.length} réu(s)`
    : "Partes legado";

  const ultimoMov = andamentos[0];
  const movPreview = andamentos.length > 0
    ? `${andamentos.length} movimentações${ultimoMov ? `, última em ${new Date(ultimoMov.data_andamento).toLocaleDateString("pt-BR")}` : ""}`
    : "Nenhuma";

  const docsPreview = documentos.length > 0
    ? `${documentos.length} documento(s)`
    : "Nenhum";

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <ProcessoHeader processo={processo} />

      {/* Resumo executivo */}
      <ProcessoResumo processo={processo} />

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Main content - Accordions */}
        <div className="bg-card border border-border/40 rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] overflow-hidden">
          <Accordion type="multiple" defaultValue={["dados", "partes"]} className="divide-y divide-border/40">
            {/* A) Dados do Processo */}
            <AccordionItem value="dados" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  Dados do Processo
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TabDadosGerais processo={processo} />
              </AccordionContent>
            </AccordionItem>

            {/* B) Partes */}
            <AccordionItem value="partes" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Partes
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">{partesPreview}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TabPartes processoId={processo.id} parteAutoraLegacy={processo.parte_autora} parteReLegacy={processo.parte_re} />
              </AccordionContent>
            </AccordionItem>

            {/* C) Movimentações */}
            <AccordionItem value="andamentos" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Movimentações
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">{movPreview}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TabAndamentos processoId={processo.id} />
              </AccordionContent>
            </AccordionItem>

            {/* D) Documentos */}
            <AccordionItem value="documentos" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Documentos
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">{docsPreview}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TabDocumentos processoId={processo.id} />
              </AccordionContent>
            </AccordionItem>

            {/* E) Financeiro/RPV */}
            <AccordionItem value="financeiro" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Landmark className="w-4 h-4 text-muted-foreground" />
                  Financeiro / RPV / Precatório
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <PlaceholderField label="Nº Requisitório" value="—" />
                  <PlaceholderField label="Ente Devedor" value="—" />
                  <PlaceholderField label="Data-Base" value="—" />
                  <PlaceholderField label="Valor Bruto" value="—" />
                  <PlaceholderField label="Deduções" value="—" />
                  <PlaceholderField label="Valor Líquido" value="—" />
                  <PlaceholderField label="LOA" value="—" />
                  <PlaceholderField label="Status" value="—" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 italic">Dados financeiros ainda não disponíveis no sistema.</p>
              </AccordionContent>
            </AccordionItem>

            {/* F) Relacionados */}
            <AccordionItem value="relacionados" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  Processos Relacionados
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 text-xs">
                  <PlaceholderField label="Processo Principal" value="—" />
                  <PlaceholderField label="Cumprimentos" value="Nenhum" />
                  <PlaceholderField label="Apensos" value="Nenhum" />
                  <PlaceholderField label="Recursos" value="Nenhum" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 italic">Vinculação de processos ainda não disponível.</p>
              </AccordionContent>
            </AccordionItem>

            {/* G) Notas internas */}
            <AccordionItem value="notas" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <StickyNote className="w-4 h-4 text-muted-foreground" />
                  Notas Internas
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-[10px] text-muted-foreground italic">Notas internas ainda não disponíveis. Em breve será possível adicionar notas com responsável e anexos.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Sidebar */}
        <PainelTriagem processo={processo} />
      </div>
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
