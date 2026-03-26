import { useState } from "react";
import { Search, Plus, Eye, EyeOff, Trash2, Radar, ChevronRight, Gavel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAcompanhamentos, useAcompanhamentoResultados, useCreateAcompanhamento, useToggleAcompanhamento, useDeleteAcompanhamento } from "@/hooks/useAcompanhamentos";
import { usePessoas } from "@/hooks/usePessoas";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ComunicarDividaSheet from "@/components/acompanhamento/ComunicarDividaSheet";

export default function Acompanhamento() {
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedPessoaId, setSelectedPessoaId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dividaSheetOpen, setDividaSheetOpen] = useState(false);

  const { data: acompanhamentos, isLoading } = useAcompanhamentos();
  const { data: resultados, isLoading: loadingResultados } = useAcompanhamentoResultados(detailId);
  const { data: pessoas } = usePessoas();
  const createMutation = useCreateAcompanhamento();
  const toggleMutation = useToggleAcompanhamento();
  const deleteMutation = useDeleteAcompanhamento();

  const filtered = acompanhamentos?.filter((a: any) => {
    const q = search.toLowerCase();
    return (
      a.pessoas?.nome?.toLowerCase().includes(q) ||
      a.cpf_cnpj?.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => {
    const pessoa = pessoas?.find((p) => p.id === selectedPessoaId);
    if (!pessoa) {
      toast.error("Selecione uma pessoa");
      return;
    }
    createMutation.mutate(
      { pessoa_id: pessoa.id, cpf_cnpj: pessoa.cpf_cnpj, observacoes: observacoes || undefined },
      {
        onSuccess: () => {
          toast.success("Acompanhamento habilitado");
          setSheetOpen(false);
          setSelectedPessoaId("");
          setObservacoes("");
        },
        onError: () => toast.error("Erro ao criar acompanhamento"),
      }
    );
  };

  const selectedDetail = acompanhamentos?.find((a: any) => a.id === detailId);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Busca de Devedor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitore CPFs/CNPJs para saber quando surgem processos judiciais
          </p>
        </div>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Novo Acompanhamento
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF/CNPJ..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="glass-card m-4 rounded-xl border border-border overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[25%]">Nome</TableHead>
                <TableHead className="w-[18%]">CPF/CNPJ</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[18%]">Última Verificação</TableHead>
                <TableHead className="w-[12%]">Processos</TableHead>
                <TableHead className="w-[15%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : !filtered?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum acompanhamento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a: any) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setDetailId(a.id)}>
                    <TableCell className="font-medium truncate">{a.pessoas?.nome || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{a.cpf_cnpj}</TableCell>
                    <TableCell>
                      <Badge variant={a.ativo ? "default" : "secondary"} className="text-[10px]">
                        {a.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.ultima_verificacao
                        ? format(new Date(a.ultima_verificacao), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "Nunca verificado"}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{a.total_processos_encontrados || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={a.ativo ? "Desativar" : "Ativar"}
                          onClick={() => toggleMutation.mutate({ id: a.id, ativo: !a.ativo })}
                        >
                          {a.ativo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          title="Excluir"
                          onClick={() =>
                            deleteMutation.mutate(a.id, {
                              onSuccess: () => toast.success("Acompanhamento excluído"),
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sheet: Novo Acompanhamento */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Novo Acompanhamento</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pessoa</Label>
              <Select value={selectedPessoaId} onValueChange={setSelectedPessoaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pessoa cadastrada" />
                </SelectTrigger>
                <SelectContent>
                  {pessoas?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} — {p.cpf_cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                O CPF/CNPJ da pessoa será usado para monitoramento automático.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Notas sobre este acompanhamento..."
                rows={3}
              />
            </div>
          </div>
          <SheetFooter className="sticky bottom-0 bg-background border-t pt-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Habilitar Acompanhamento"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sheet: Detalhe / Resultados */}
      <Sheet open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-primary" />
              {selectedDetail?.pessoas?.nome || "Detalhe"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">CPF/CNPJ</p>
                <p className="font-mono">{selectedDetail?.cpf_cnpj}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <Badge variant={selectedDetail?.ativo ? "default" : "secondary"}>
                  {selectedDetail?.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Última Verificação</p>
                <p>{selectedDetail?.ultima_verificacao
                  ? format(new Date(selectedDetail.ultima_verificacao), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "Nunca"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Processos Encontrados</p>
                <p className="font-semibold text-lg">{selectedDetail?.total_processos_encontrados || 0}</p>
              </div>
            </div>
            {selectedDetail?.observacoes && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Observações</p>
                <p className="text-sm">{selectedDetail.observacoes}</p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => setDividaSheetOpen(true)}
            >
              <Gavel className="w-4 h-4 mr-1" />
              Comunicar Dívida ao Juiz
            </Button>

            <div className="border-t pt-4">
              <h3 className="font-medium text-sm mb-3">Processos Encontrados</h3>
              {loadingResultados ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : !resultados?.length ? (
                <p className="text-sm text-muted-foreground">Nenhum processo encontrado ainda pela automação.</p>
              ) : (
                <div className="space-y-2">
                  {resultados.map((r: any) => (
                    <div key={r.id} className="border rounded-lg p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium">{r.numero_processo || "—"}</span>
                        <Badge variant={r.vinculado ? "default" : "outline"} className="text-[10px]">
                          {r.vinculado ? "Vinculado" : "Não vinculado"}
                        </Badge>
                      </div>
                      {r.tribunal && <p className="text-muted-foreground text-xs">Tribunal: {r.tribunal}</p>}
                      <p className="text-muted-foreground text-[10px]">
                        Encontrado em: {format(new Date(r.encontrado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet: Comunicar Dívida */}
      <ComunicarDividaSheet
        open={dividaSheetOpen}
        onOpenChange={setDividaSheetOpen}
        acompanhamento={selectedDetail ? {
          id: selectedDetail.id,
          pessoa_id: selectedDetail.pessoa_id,
          cpf_cnpj: selectedDetail.cpf_cnpj,
          pessoas: selectedDetail.pessoas as any,
        } : null}
      />
    </div>
  );
}
