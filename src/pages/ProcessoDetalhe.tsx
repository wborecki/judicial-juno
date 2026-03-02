import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProcesso, useUpdateProcesso } from "@/hooks/useProcessos";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useProcessoDocumentos } from "@/hooks/useProcessoDocumentos";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";
import { useNegocios } from "@/hooks/useNegocios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Users, Clock, StickyNote, FileSearch, Briefcase, History, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ProcessoHeader from "@/components/processo/ProcessoHeader";
import ModalConverter from "@/components/processo/ModalConverter";
import ModalDescartar from "@/components/processo/ModalDescartar";
import TabPartes from "@/components/processo/TabPartes";
import TabAndamentos from "@/components/processo/TabAndamentos";
import TabDocumentos from "@/components/processo/TabDocumentos";
import TabNotas from "@/components/processo/TabNotas";
import TabHistorico from "@/components/processo/TabHistorico";
import TabAnalise from "@/components/processo/TabAnalise";

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: processo, isLoading } = useProcesso(id);
  const { data: andamentos = [] } = useProcessoAndamentos(id);
  const { data: documentos = [] } = useProcessoDocumentos(id);
  const { data: partes = [] } = useProcessoPartes(id);
  const { data: negocios = [] } = useNegocios(id);
  const [convertOpen, setConvertOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [confirmAcompanhar, setConfirmAcompanhar] = useState(false);
  const [confirmRemoverAcomp, setConfirmRemoverAcomp] = useState(false);
  const updateProcesso = useUpdateProcesso();

  const saveField = async (field: string, value: any) => {
    if (!processo) return;
    try {
      await updateProcesso.mutateAsync({ id: processo.id, updates: { [field]: value } });
      toast.success("Atualizado");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

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
    <div className="space-y-3 max-w-7xl mx-auto p-6 overflow-y-auto h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Dashboard</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/processos">Processos</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-xs">{processo.numero_processo}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProcessoHeader
        processo={processo}
        onConvert={() => setConvertOpen(true)}
        onDiscard={() => setDiscardOpen(true)}
        onReanalyse={() => setConfirmAcompanhar(true)}
        onRemoveReanalyse={() => setConfirmRemoverAcomp(true)}
      />

      <Tabs defaultValue="partes" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 border-b border-border rounded-none pb-2">
          <TabsTrigger value="partes" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Users className="w-3.5 h-3.5" />Partes
            <span className="text-[10px] text-muted-foreground ml-0.5">({partes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analise" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <FileSearch className="w-3.5 h-3.5" />Análise
          </TabsTrigger>
          <TabsTrigger value="andamentos" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Clock className="w-3.5 h-3.5" />Movimentações
            <span className="text-[10px] text-muted-foreground ml-0.5">({andamentos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <FileText className="w-3.5 h-3.5" />Documentos
            <span className="text-[10px] text-muted-foreground ml-0.5">({documentos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="negocios" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <Briefcase className="w-3.5 h-3.5" />Negócios
            <span className="text-[10px] text-muted-foreground ml-0.5">({negocios.length})</span>
          </TabsTrigger>
          <TabsTrigger value="notas" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <StickyNote className="w-3.5 h-3.5" />Anotações
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md">
            <History className="w-3.5 h-3.5" />Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partes" className="mt-4">
          <TabPartes processoId={processo.id} parteAutoraLegacy={processo.parte_autora} parteReLegacy={processo.parte_re} />
        </TabsContent>

        <TabsContent value="analise" className="mt-4">
          <TabAnalise processo={processo} onSaveField={saveField} />
        </TabsContent>

        <TabsContent value="andamentos" className="mt-4">
          <TabAndamentos processoId={processo.id} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <TabDocumentos processoId={processo.id} />
        </TabsContent>

        <TabsContent value="negocios" className="mt-4">
          <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-foreground">Negócios Vinculados</p>
            {negocios.length > 0 ? (
              <div className="space-y-2">
                {negocios.map(n => (
                  <div key={n.id} className="bg-muted/30 border border-border/30 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tipo Serviço</p>
                      <p className="font-medium">{n.tipo_servico || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor Proposta</p>
                      <p className="font-medium">{n.valor_proposta ? n.valor_proposta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor Fechamento</p>
                      <p className="font-medium">{n.valor_fechamento ? n.valor_fechamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                      <p className="font-medium capitalize">{n.negocio_status?.replace(/_/g, " ") || "—"}</p>
                    </div>
                    {n.observacoes && (
                      <div className="col-span-full">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Observações</p>
                        <p className="font-medium text-muted-foreground">{n.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">Nenhum negócio vinculado a este processo.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <TabNotas processoId={processo.id} />
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <TabHistorico processoId={processo.id} />
        </TabsContent>
      </Tabs>

      <ModalConverter processo={processo} open={convertOpen} onOpenChange={setConvertOpen} />
      <ModalDescartar processo={processo} open={discardOpen} onOpenChange={setDiscardOpen} />

      <AlertDialog open={confirmAcompanhar} onOpenChange={setConfirmAcompanhar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Colocar em acompanhamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O processo <span className="font-mono font-semibold">{processo.numero_processo}</span> será marcado para acompanhamento e reanálise futura.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try {
                await updateProcesso.mutateAsync({
                  id: processo.id,
                  updates: { triagem_resultado: "reanálise", triagem_data: new Date().toISOString() },
                });
                toast.success("Processo em acompanhamento");
              } catch {
                toast.error("Erro ao atualizar status");
              }
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRemoverAcomp} onOpenChange={setConfirmRemoverAcomp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acompanhamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O processo <span className="font-mono font-semibold">{processo.numero_processo}</span> voltará ao status "Pendente".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try {
                await updateProcesso.mutateAsync({
                  id: processo.id,
                  updates: { triagem_resultado: "pendente", triagem_data: null },
                });
                toast.success("Acompanhamento removido");
              } catch {
                toast.error("Erro ao atualizar status");
              }
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

