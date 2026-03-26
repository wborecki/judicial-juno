import { useState } from "react";
import { Paperclip } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateComunicacaoDivida } from "@/hooks/useComunicacoesDivida";
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
  const [credorNome, setCredorNome] = useState("");
  const [tipoCredor, setTipoCredor] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [vara, setVara] = useState("");
  const [uf, setUf] = useState("");
  const [valorCredito, setValorCredito] = useState("");
  const [valorDivida, setValorDivida] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const createMutation = useCreateComunicacaoDivida();
  const pessoa = acompanhamento?.pessoas;

  const resetForm = () => {
    setCredorNome("");
    setTipoCredor("");
    setNumeroProcesso("");
    setTribunal("");
    setVara("");
    setUf("");
    setValorCredito("");
    setValorDivida("");
    setObservacoes("");
  };

  const handleSubmit = () => {
    if (!acompanhamento) return;
    if (!credorNome.trim()) {
      toast.error("Informe o nome do credor");
      return;
    }

    createMutation.mutate(
      {
        acompanhamento_id: acompanhamento.id,
        pessoa_id: acompanhamento.pessoa_id,
        credor_nome: credorNome.trim(),
        tipo_credor: tipoCredor || undefined,
        numero_processo: numeroProcesso.trim() || "—",
        tribunal: tribunal || undefined,
        vara: vara || undefined,
        uf: uf || undefined,
        valor_credito: valorCredito ? parseFloat(valorCredito) : undefined,
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
            <div className="space-y-1.5">
              <Label>Credor / Entidade *</Label>
              <Input
                value={credorNome}
                onChange={(e) => setCredorNome(e.target.value)}
                placeholder="Nome do credor da dívida"
              />
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
              <Label>Número do Processo</Label>
              <Input
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tribunal</Label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tribunal" />
                </SelectTrigger>
                <SelectContent>
                  {TRIBUNAIS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vara</Label>
                <Input
                  value={vara}
                  onChange={(e) => setVara(e.target.value)}
                  placeholder="Ex: 1ª Vara Cível"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Estado (UF)</Label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor do Crédito (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorCredito}
                  onChange={(e) => setValorCredito(e.target.value)}
                  placeholder="0,00"
                />
              </div>
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
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Detalhes adicionais..."
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
