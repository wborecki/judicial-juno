import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProcesso, useUpdateProcesso } from "@/hooks/useProcessos";
import { useProcessoAndamentos } from "@/hooks/useProcessoAndamentos";
import { useProcessoDocumentos } from "@/hooks/useProcessoDocumentos";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";
import { useNegocios } from "@/hooks/useNegocios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Users, Clock, StickyNote, Landmark, Briefcase, Save, Pencil } from "lucide-react";
import { toast } from "sonner";
import ProcessoHeader from "@/components/processo/ProcessoHeader";
import ModalConverter from "@/components/processo/ModalConverter";
import ModalDescartar from "@/components/processo/ModalDescartar";
import TabPartes from "@/components/processo/TabPartes";
import TabAndamentos from "@/components/processo/TabAndamentos";
import TabDocumentos from "@/components/processo/TabDocumentos";
import TabNotas from "@/components/processo/TabNotas";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const updateProcesso = useUpdateProcesso();

  // Financial editing state
  const [finEditing, setFinEditing] = useState(false);
  const [finValorCausa, setFinValorCausa] = useState<number | null>(null);
  const [finValorPrecificado, setFinValorPrecificado] = useState<number | null>(null);
  const [finTipoPagamento, setFinTipoPagamento] = useState<string>("");

  const startFinEdit = () => {
    if (!processo) return;
    setFinValorCausa(processo.valor_estimado);
    setFinValorPrecificado(processo.valor_precificado);
    setFinTipoPagamento(processo.tipo_pagamento || "");
    setFinEditing(true);
  };

  const saveFinanceiro = async () => {
    if (!processo) return;
    try {
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          valor_estimado: finValorCausa,
          valor_precificado: finValorPrecificado,
          tipo_pagamento: finTipoPagamento,
        },
      });
      toast.success("Dados financeiros atualizados");
      setFinEditing(false);
    } catch {
      toast.error("Erro ao salvar dados financeiros");
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
    <div className="space-y-4 max-w-7xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" />Voltar
      </Button>

      <ProcessoHeader
        processo={processo}
        onConvert={() => setConvertOpen(true)}
        onDiscard={() => setDiscardOpen(true)}
        onReanalyse={async () => {
          try {
            await updateProcesso.mutateAsync({
              id: processo.id,
              updates: {
                triagem_resultado: "reanálise",
                triagem_data: new Date().toISOString(),
              },
            });
            toast.success("Processo em acompanhamento para reanálise futura");
          } catch {
            toast.error("Erro ao atualizar status");
          }
        }}
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
          <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-foreground">Dados Financeiros</p>
              {!finEditing ? (
                <Button variant="ghost" size="sm" onClick={startFinEdit} className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground">
                  <Pencil className="w-3.5 h-3.5" />Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setFinEditing(false)} className="text-xs h-7">Cancelar</Button>
                  <Button size="sm" onClick={saveFinanceiro} disabled={updateProcesso.isPending} className="text-xs gap-1.5 h-7">
                    <Save className="w-3.5 h-3.5" />Salvar
                  </Button>
                </div>
              )}
            </div>

            {finEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Valor da Causa (R$)</p>
                  <Input type="number" value={finValorCausa ?? ""} onChange={e => setFinValorCausa(e.target.value ? Number(e.target.value) : null)} className="h-8 text-xs" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Valor Precificado (R$)</p>
                  <Input type="number" value={finValorPrecificado ?? ""} onChange={e => setFinValorPrecificado(e.target.value ? Number(e.target.value) : null)} className="h-8 text-xs" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Data Precificação</p>
                  <p className="text-xs font-medium text-muted-foreground/60">{processo.precificacao_data ? new Date(processo.precificacao_data).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Tipo Pagamento</p>
                  <Select value={finTipoPagamento} onValueChange={setFinTipoPagamento}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RPV">RPV</SelectItem>
                      <SelectItem value="Precatório">Precatório</SelectItem>
                      <SelectItem value="Alvará">Alvará</SelectItem>
                      <SelectItem value="Depósito Judicial">Depósito Judicial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
                <PlaceholderField label="Valor da Causa" value={processo.valor_estimado ? processo.valor_estimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"} />
                <PlaceholderField label="Valor Precificado" value={processo.valor_precificado ? processo.valor_precificado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"} />
                <PlaceholderField label="Data Precificação" value={processo.precificacao_data ? new Date(processo.precificacao_data).toLocaleDateString("pt-BR") : "—"} />
                <PlaceholderField label="Tipo Pagamento" value={processo.tipo_pagamento || "—"} />
              </div>
            )}

            {negocios.length > 0 && (
              <div className="border-t border-border/20 pt-4 space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" />Negócios Vinculados ({negocios.length})
                </p>
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
              </div>
            )}

            {negocios.length === 0 && (
              <p className="text-[10px] text-muted-foreground italic">Nenhum negócio vinculado a este processo.</p>
            )}
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
