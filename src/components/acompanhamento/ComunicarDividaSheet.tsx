import { useState, useMemo } from "react";
import { Paperclip, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateComunicacaoDivida } from "@/hooks/useComunicacoesDivida";
import { usePessoas } from "@/hooks/usePessoas";
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
}

export default function ComunicarDividaSheet({ open, onOpenChange, acompanhamento }: ComunicarDividaSheetProps) {
  const [credorPessoaId, setCredorPessoaId] = useState("");
  const [credorSearch, setCredorSearch] = useState("");
  const [tipoCredor, setTipoCredor] = useState("");
  const [tipoDivida, setTipoDivida] = useState("");
  const [valorDivida, setValorDivida] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: pessoas } = usePessoas();
  const createMutation = useCreateComunicacaoDivida();
  const pessoa = acompanhamento?.pessoas;

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
    setValorDivida("");
    setDataVencimento("");
    setObservacoes("");
  };

  const handleSelectCredor = (p: any) => {
    setCredorPessoaId(p.id);
    setCredorSearch("");
    // Auto-detect tipo based on cpf_cnpj length
    if (p.cpf_cnpj) {
      const digits = p.cpf_cnpj.replace(/\D/g, "");
      if (digits.length <= 11) {
        setTipoCredor("pessoa_fisica");
      } else {
        setTipoCredor("empresa");
      }
    }
  };

  const handleSubmit = () => {
    if (!acompanhamento) return;
    if (!credorSelecionado) {
      toast.error("Selecione o credor da lista de pessoas");
      return;
    }

    createMutation.mutate(
      {
        acompanhamento_id: acompanhamento.id,
        pessoa_id: acompanhamento.pessoa_id,
        credor_nome: credorSelecionado.nome,
        tipo_credor: tipoCredor || undefined,
        numero_processo: tipoDivida || "—",
        valor_divida: valorDivida ? parseFloat(valorDivida) : undefined,
        dados_pessoa: pessoa ? {
          nome: pessoa.nome,
          cpf_cnpj: pessoa.cpf_cnpj,
          endereco: pessoa.endereco,
          cidade: pessoa.cidade,
          uf: pessoa.uf,
          email: pessoa.email,
          telefone: pessoa.telefone,
        } : undefined,
        observacoes: observacoes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Dívida anexada com sucesso");
          resetForm();
          onOpenChange(false);
        },
        onError: () => toast.error("Erro ao anexar dívida"),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-primary" />
            Anexar Dívida
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
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
                  {credorSearch.trim() && pessoasFiltradas.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
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
                    </div>
                  )}
                  {credorSearch.trim() && pessoasFiltradas.length === 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md p-3">
                      <p className="text-xs text-muted-foreground text-center">Nenhuma pessoa encontrada</p>
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
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            <Paperclip className="w-4 h-4 mr-1" />
            {createMutation.isPending ? "Salvando..." : "Anexar Dívida"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
