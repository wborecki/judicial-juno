import { useState } from "react";
import { Search, Plus, Trash2, Radar, Gavel, Paperclip, Pencil, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAcompanhamentos, useCreateAcompanhamento, useUpdateAcompanhamento, useToggleAcompanhamento, useDeleteAcompanhamento } from "@/hooks/useAcompanhamentos";
import { useComunicacoesDivida, useDeleteComunicacaoDivida } from "@/hooks/useComunicacoesDivida";
import { usePessoas } from "@/hooks/usePessoas";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ComunicarDividaSheet from "@/components/acompanhamento/ComunicarDividaSheet";
import InformarDividaDialog from "@/components/acompanhamento/InformarDividaDialog";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  enviado: { label: "Enviado", variant: "default" },
  erro: { label: "Erro", variant: "destructive" },
  rascunho: { label: "Rascunho", variant: "secondary" },
};

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function Acompanhamento() {
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAcomp, setEditingAcomp] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedPessoaId, setSelectedPessoaId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [valorProcesso, setValorProcesso] = useState("");
  const [vara, setVara] = useState("");
  const [uf, setUf] = useState("");
  const [dividaSheetOpen, setDividaSheetOpen] = useState(false);
  const [dividaSheetAcomp, setDividaSheetAcomp] = useState<any>(null);
  const [dividaEditData, setDividaEditData] = useState<any>(null);
  const [informarOpen, setInformarOpen] = useState(false);
  const [informarAcomp, setInformarAcomp] = useState<any>(null);

  const { data: acompanhamentos, isLoading } = useAcompanhamentos();
  const { data: pessoas } = usePessoas();
  const createMutation = useCreateAcompanhamento();
  const updateMutation = useUpdateAcompanhamento();
  const toggleMutation = useToggleAcompanhamento();
  const deleteMutation = useDeleteAcompanhamento();
  const deleteDividaMutation = useDeleteComunicacaoDivida();

  const selectedDetail = acompanhamentos?.find((a: any) => a.id === detailId);
  const { data: dividas, isLoading: loadingDividas } = useComunicacoesDivida(detailId);

  const filtered = acompanhamentos?.filter((a: any) => {
    const q = search.toLowerCase();
    return (
      a.pessoas?.nome?.toLowerCase().includes(q) ||
      a.cpf_cnpj?.toLowerCase().includes(q) ||
      a.numero_processo?.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => {
    const pessoa = pessoas?.find((p) => p.id === selectedPessoaId);
    if (!pessoa) {
      toast.error("Selecione uma pessoa");
      return;
    }
    createMutation.mutate(
      {
        pessoa_id: pessoa.id,
        cpf_cnpj: pessoa.cpf_cnpj,
        observacoes: observacoes || undefined,
        numero_processo: numeroProcesso || undefined,
        valor_processo: valorProcesso ? Number(valorProcesso) : undefined,
        vara: vara || undefined,
        uf: uf || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Acompanhamento habilitado");
          setSheetOpen(false);
          setSelectedPessoaId("");
          setObservacoes("");
          setNumeroProcesso("");
          setValorProcesso("");
          setVara("");
          setUf("");
        },
        onError: () => toast.error("Erro ao criar acompanhamento"),
      }
    );
  };

  const openAnexarDivida = (acomp: any) => {
    setDividaSheetAcomp({
      id: acomp.id,
      pessoa_id: acomp.pessoa_id,
      cpf_cnpj: acomp.cpf_cnpj,
      pessoas: acomp.pessoas,
    });
    setDividaEditData(null);
    setDividaSheetOpen(true);
  };

  const openEditDivida = (divida: any) => {
    if (!selectedDetail) return;
    setDividaSheetAcomp({
      id: selectedDetail.id,
      pessoa_id: selectedDetail.pessoa_id,
      cpf_cnpj: selectedDetail.cpf_cnpj,
      pessoas: selectedDetail.pessoas,
    });
    setDividaEditData(divida);
    setDividaSheetOpen(true);
  };

  const openInformarDivida = (acomp: any) => {
    setInformarAcomp({
      id: acomp.id,
      cpf_cnpj: acomp.cpf_cnpj,
      pessoas: acomp.pessoas,
    });
    setInformarOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Busca de Devedor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitore CPFs/CNPJs e registre dívidas judiciais
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
            placeholder="Buscar por nome, CPF/CNPJ ou nº processo..."
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
                <TableHead className="w-[18%]">Nome (Autor)</TableHead>
                <TableHead className="w-[13%]">CPF/CNPJ</TableHead>
                <TableHead className="w-[18%]">Nº Processo</TableHead>
                <TableHead className="w-[12%]">Valor</TableHead>
                <TableHead className="w-[10%]">Vara</TableHead>
                <TableHead className="w-[7%]">UF</TableHead>
                <TableHead className="w-[7%] text-center">Dívidas</TableHead>
                <TableHead className="w-[15%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : !filtered?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum acompanhamento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a: any) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setDetailId(a.id)}>
                    <TableCell className="font-medium truncate">{a.pessoas?.nome || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{a.cpf_cnpj}</TableCell>
                    <TableCell className="font-mono text-xs truncate">{a.numero_processo || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {a.valor_processo != null
                        ? `R$ ${Number(a.valor_processo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs truncate">{a.vara || "—"}</TableCell>
                    <TableCell className="text-xs">{a.uf || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={a.total_dividas > 0 ? "default" : "secondary"} className="text-xs">
                        {a.total_dividas}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 px-2.5"
                          onClick={() => openInformarDivida(a)}
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          Informar Dívida
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
          <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1 -mx-1">
            <div className="space-y-2">
              <Label>Pessoa (Autor)</Label>
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
              <Label>Número do Processo</Label>
              <Input
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor do Processo</Label>
              <Input
                type="number"
                value={valorProcesso}
                onChange={(e) => setValorProcesso(e.target.value)}
                placeholder="0,00"
                min={0}
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Vara</Label>
                <Input
                  value={vara}
                  onChange={(e) => setVara(e.target.value)}
                  placeholder="Ex: 1ª Vara Cível"
                />
              </div>
              <div className="space-y-2">
                <Label>UF</Label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UF_LIST.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      {/* Sheet: Detalhe — Lista de Dívidas */}
      <Sheet open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-primary" />
              {selectedDetail?.pessoas?.nome || "Detalhe"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Info do devedor */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{selectedDetail?.pessoas?.nome}</p>
                <Badge variant={selectedDetail?.ativo ? "default" : "secondary"} className="text-[10px]">
                  {selectedDetail?.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{selectedDetail?.cpf_cnpj}</p>
              {selectedDetail?.numero_processo && (
                <p className="font-mono text-xs text-muted-foreground">Processo: {selectedDetail.numero_processo}</p>
              )}
              {selectedDetail?.observacoes && (
                <p className="text-xs text-muted-foreground mt-1">{selectedDetail.observacoes}</p>
              )}
            </div>

            {/* Dois botões */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => selectedDetail && openInformarDivida(selectedDetail)}
              >
                <Gavel className="w-4 h-4 mr-1" />
                Informar Dívida
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => selectedDetail && openAnexarDivida(selectedDetail)}
              >
                <Paperclip className="w-4 h-4 mr-1" />
                Anexar Dívida
              </Button>
            </div>

            {/* Lista de Dívidas */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-sm mb-3">Dívidas Registradas</h3>
              {loadingDividas ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : !dividas?.length ? (
                <p className="text-sm text-muted-foreground">Nenhuma dívida registrada ainda.</p>
              ) : (
                <div className="space-y-2">
                  {dividas.map((c: any) => {
                    const st = STATUS_LABELS[c.status] || STATUS_LABELS.pendente;
                    return (
                      <div key={c.id} className="border rounded-lg p-3 text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs">{c.credor_nome || c.tipo_divida || "Dívida"}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              title="Editar"
                              onClick={() => openEditDivida(c)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              title="Excluir"
                              onClick={() =>
                                deleteDividaMutation.mutate(c.id, {
                                  onSuccess: () => toast.success("Dívida excluída"),
                                  onError: () => toast.error("Erro ao excluir dívida"),
                                })
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {c.tipo_divida && (
                          <p className="text-xs text-muted-foreground capitalize">{c.tipo_divida}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          {c.tipo_credor && <span className="capitalize">{c.tipo_credor.replace("_", " ")}</span>}
                          {c.tribunal && <span>Tribunal: {c.tribunal}</span>}
                          {c.vara && <span>Vara: {c.vara}</span>}
                          {c.uf && <span>UF: {c.uf}</span>}
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {c.valor_credito != null && <span>Crédito: R$ {Number(c.valor_credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                          {c.valor_divida != null && <span>Dívida: R$ {Number(c.valor_divida).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                        </div>
                        {(c as any).comprovante_url && (
                          <a
                            href={(c as any).comprovante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            {(c as any).comprovante_nome || "Comprovante"}
                          </a>
                        )}
                        <p className="text-muted-foreground text-[10px]">
                          Registrado em: {format(new Date(c.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet: Anexar Dívida */}
      <ComunicarDividaSheet
        open={dividaSheetOpen}
        onOpenChange={setDividaSheetOpen}
        acompanhamento={dividaSheetAcomp}
        editData={dividaEditData}
      />

      {/* Dialog: Informar Dívida ao Tribunal */}
      <InformarDividaDialog
        open={informarOpen}
        onOpenChange={setInformarOpen}
        acompanhamento={informarAcomp}
      />
    </div>
  );
}
