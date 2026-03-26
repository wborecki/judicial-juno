import { useState, useMemo, useRef, useEffect } from "react";
import { Paperclip, Search, Plus, Upload, X, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCreateComunicacaoDivida, useUpdateComunicacaoDivida } from "@/hooks/useComunicacoesDivida";
import { usePessoas, useCreatePessoa } from "@/hooks/usePessoas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TIPOS_DIVIDA = [
  { value: "emprestimo", label: "Empréstimo" },
  { value: "financiamento", label: "Financiamento" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "tributo", label: "Tributo / Imposto" },
  { value: "multa", label: "Multa" },
  { value: "servico", label: "Serviço" },
  { value: "aluguel", label: "Aluguel" },
  { value: "outros", label: "Outros" },
];

const TIPOS_CREDOR = [
  { value: "empresa", label: "Empresa" },
  { value: "governo", label: "Governo" },
  { value: "pessoa_fisica", label: "Pessoa Física" },
  { value: "orgao_publico", label: "Órgão Público" },
];

interface ComunicarDividaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acompanhamento: {
    id: string;
    pessoa_id: string;
    cpf_cnpj: string;
    pessoas?: { nome?: string; cpf_cnpj?: string; endereco?: string; cidade?: string; uf?: string; email?: string; telefone?: string } | null;
  } | null;
  editData?: any | null;
}

export default function ComunicarDividaSheet({ open, onOpenChange, acompanhamento, editData }: ComunicarDividaSheetProps) {
  const [credorPessoaId, setCredorPessoaId] = useState("");
  const [credorSearch, setCredorSearch] = useState("");
  const [tipoCredor, setTipoCredor] = useState("");
  const [tipoDivida, setTipoDivida] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [valorDivida, setValorDivida] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [criarPessoaOpen, setCriarPessoaOpen] = useState(false);
  const [novoPessoaNome, setNovoPessoaNome] = useState("");
  const [novoPessoaCpf, setNovoPessoaCpf] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivoExistente, setArquivoExistente] = useState<{ url: string; nome: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: pessoas } = usePessoas();
  const createMutation = useCreateComunicacaoDivida();
  const updateMutation = useUpdateComunicacaoDivida();
  const createPessoaMutation = useCreatePessoa();
  const pessoa = acompanhamento?.pessoas;

  const isEdit = !!editData;

  // Populate form when editing
  useEffect(() => {
    if (editData && open) {
      setCredorPessoaId(editData.pessoa_id || "");
      setTipoCredor(editData.tipo_credor || "");
      setTipoDivida(editData.tipo_divida || "");
      setValorDivida(editData.valor_divida != null ? String(editData.valor_divida) : "");
      setNumeroProcesso(editData.numero_processo && editData.numero_processo !== "—" ? editData.numero_processo : "");
      setObservacoes(editData.observacoes || "");
      setDataVencimento("");
      setArquivo(null);
      if (editData.comprovante_url) {
        setArquivoExistente({ url: editData.comprovante_url, nome: editData.comprovante_nome || "comprovante.pdf" });
      } else {
        setArquivoExistente(null);
      }
      // Try to find credor by name
      if (editData.credor_nome && pessoas) {
        const found = pessoas.find((p: any) => p.nome === editData.credor_nome);
        if (found) setCredorPessoaId(found.id);
      }
    } else if (!editData && open) {
      resetForm();
    }
  }, [editData, open, pessoas]);

  const credorSelecionado = useMemo(
    () => pessoas?.find((p: any) => p.id === credorPessoaId),
    [pessoas, credorPessoaId]
  );

  const pessoasFiltradas = useMemo(() => {
    if (!pessoas || !credorSearch.trim()) return [];
    const q = credorSearch.toLowerCase();
    return pessoas
      .filter((p: any) =>
        p.nome?.toLowerCase().includes(q) || p.cpf_cnpj?.includes(q)
      )
      .slice(0, 8);
  }, [pessoas, credorSearch]);

  const resetForm = () => {
    setCredorPessoaId("");
    setCredorSearch("");
    setTipoCredor("");
    setTipoDivida("");
    setNumeroProcesso("");
    setValorDivida("");
    setDataVencimento("");
    setObservacoes("");
    setArquivo(null);
    setArquivoExistente(null);
  };

  const handleSelectCredor = (p: any) => {
    setCredorPessoaId(p.id);
    setCredorSearch("");
    if (p.cpf_cnpj) {
      const digits = p.cpf_cnpj.replace(/\D/g, "");
      if (digits.length <= 11) {
        setTipoCredor("pessoa_fisica");
      } else {
        setTipoCredor("empresa");
      }
    }
  };

  const handleCriarPessoa = () => {
    if (!novoPessoaNome.trim() || !novoPessoaCpf.trim()) {
      toast.error("Preencha nome e CPF/CNPJ");
      return;
    }
    createPessoaMutation.mutate(
      { nome: novoPessoaNome.trim(), cpf_cnpj: novoPessoaCpf.trim(), tipo: "terceiro" },
      {
        onSuccess: (data: any) => {
          handleSelectCredor(data);
          setCriarPessoaOpen(false);
          setNovoPessoaNome("");
          setNovoPessoaCpf("");
          toast.success("Pessoa criada com sucesso");
        },
        onError: () => toast.error("Erro ao criar pessoa"),
      }
    );
  };

  const uploadFile = async (file: File): Promise<{ url: string; nome: string } | null> => {
    const ext = file.name.split(".").pop() || "pdf";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("comprovantes-divida").upload(path, file);
    if (error) {
      toast.error("Erro ao enviar arquivo");
      return null;
    }
    const { data: urlData } = supabase.storage.from("comprovantes-divida").getPublicUrl(path);
    return { url: urlData.publicUrl, nome: file.name };
  };

  const handleSubmit = async () => {
    if (!acompanhamento) return;
    if (!credorSelecionado && !isEdit) {
      toast.error("Selecione o credor da lista de pessoas");
      return;
    }

    setUploading(true);
    let comprovante_url = arquivoExistente?.url;
    let comprovante_nome = arquivoExistente?.nome;

    if (arquivo) {
      const result = await uploadFile(arquivo);
      if (result) {
        comprovante_url = result.url;
        comprovante_nome = result.nome;
      }
    }

    const payload: any = {
      credor_nome: credorSelecionado?.nome || editData?.credor_nome,
      tipo_credor: tipoCredor || undefined,
      numero_processo: numeroProcesso.trim() || "—",
      tipo_divida: tipoDivida || undefined,
      valor_divida: valorDivida ? parseFloat(valorDivida) : undefined,
      observacoes: observacoes || undefined,
      comprovante_url: comprovante_url || undefined,
      comprovante_nome: comprovante_nome || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData.id, updates: payload });
        toast.success("Dívida atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...payload,
          acompanhamento_id: acompanhamento.id,
          pessoa_id: acompanhamento.pessoa_id,
          dados_pessoa: pessoa ? {
            nome: pessoa.nome,
            cpf_cnpj: pessoa.cpf_cnpj,
            endereco: pessoa.endereco,
            cidade: pessoa.cidade,
            uf: pessoa.uf,
            email: pessoa.email,
            telefone: pessoa.telefone,
          } : undefined,
        });
        toast.success("Dívida anexada com sucesso");
      }
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar dívida");
    } finally {
      setUploading(false);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-primary" />
            {isEdit ? "Editar Dívida" : "Anexar Dívida"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-1 -mx-1 space-y-5">
          {/* Dados da Pessoa (readonly) */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Dados do Devedor</p>
            <p className="text-sm font-medium">{pessoa?.nome || "—"}</p>
            <p className="text-xs font-mono text-muted-foreground">{acompanhamento?.cpf_cnpj}</p>
          </div>

          {/* Formulário */}
          <div className="space-y-3">
            {/* Credor - busca na tabela pessoas */}
            <div className="space-y-1.5">
              <Label>Credor / Entidade *</Label>
              {credorSelecionado ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{credorSelecionado.nome}</p>
                    <p className="text-xs font-mono text-muted-foreground">{credorSelecionado.cpf_cnpj}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs shrink-0"
                    onClick={() => { setCredorPessoaId(""); setCredorSearch(""); }}
                  >
                    Trocar
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={credorSearch}
                    onChange={(e) => setCredorSearch(e.target.value)}
                    placeholder="Buscar por nome ou CPF/CNPJ..."
                    className="pl-9"
                  />
                  {credorSearch.trim() && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md max-h-56 overflow-y-auto">
                      {pessoasFiltradas.map((p: any) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center justify-between gap-2"
                          onClick={() => handleSelectCredor(p)}
                        >
                          <span className="text-sm font-medium truncate">{p.nome}</span>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">{p.cpf_cnpj}</span>
                        </button>
                      ))}
                      {pessoasFiltradas.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">Nenhuma pessoa encontrada</p>
                      )}
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2 border-t border-border text-primary"
                        onClick={() => {
                          setNovoPessoaNome(credorSearch.trim());
                          setCriarPessoaOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Criar nova pessoa</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Tipo do Credor</Label>
              <Select value={tipoCredor} onValueChange={setTipoCredor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CREDOR.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo da Dívida</Label>
              <Select value={tipoDivida} onValueChange={setTipoDivida}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo da dívida" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DIVIDA.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Número do Processo</Label>
              <Input
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor da Dívida (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorDivida}
                  onChange={(e) => setValorDivida(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>
            </div>

            {/* Upload de comprovante */}
            <div className="space-y-1.5">
              <Label>Comprovante da Dívida (PDF)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setArquivo(file);
                    setArquivoExistente(null);
                  }
                }}
              />
              {arquivo ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1">{arquivo.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setArquivo(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : arquivoExistente ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <a href={arquivoExistente.url} target="_blank" rel="noopener noreferrer" className="text-sm truncate flex-1 text-primary underline">
                    {arquivoExistente.nome}
                  </a>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setArquivoExistente(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Selecionar arquivo...
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Detalhes adicionais sobre a dívida..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="sticky bottom-0 bg-background border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            <Paperclip className="w-4 h-4 mr-1" />
            {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Anexar Dívida"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    {/* Dialog para criar nova pessoa */}
    <Dialog open={criarPessoaOpen} onOpenChange={setCriarPessoaOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Pessoa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={novoPessoaNome} onChange={(e) => setNovoPessoaNome(e.target.value)} placeholder="Nome completo ou razão social" />
          </div>
          <div className="space-y-1.5">
            <Label>CPF / CNPJ *</Label>
            <Input value={novoPessoaCpf} onChange={(e) => setNovoPessoaCpf(e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0000-00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCriarPessoaOpen(false)}>Cancelar</Button>
          <Button onClick={handleCriarPessoa} disabled={createPessoaMutation.isPending}>
            {createPessoaMutation.isPending ? "Criando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
