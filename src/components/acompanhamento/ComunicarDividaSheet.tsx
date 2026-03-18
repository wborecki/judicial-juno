import { useState } from "react";
import { Gavel } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreateComunicacaoDivida, useComunicacoesDivida } from "@/hooks/useComunicacoesDivida";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TRIBUNAIS = [
  "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6",
  "TJAC","TJAL","TJAM","TJAP","TJBA","TJCE","TJDF","TJES","TJGO",
  "TJMA","TJMG","TJMS","TJMT","TJPA","TJPB","TJPE","TJPI","TJPR",
  "TJRJ","TJRN","TJRO","TJRR","TJRS","TJSC","TJSE","TJSP","TJTO",
  "TST","TRT1","TRT2","TRT3","TRT4","TRT5","TRT6","TRT7","TRT8",
  "TRT9","TRT10","TRT11","TRT12","TRT13","TRT14","TRT15","TRT16",
  "TRT17","TRT18","TRT19","TRT20","TRT21","TRT22","TRT23","TRT24",
  "STF","STJ",
];

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  enviado: { label: "Enviado", variant: "default" },
  erro: { label: "Erro", variant: "destructive" },
  rascunho: { label: "Rascunho", variant: "secondary" },
};

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
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [valorCredito, setValorCredito] = useState("");
  const [valorDivida, setValorDivida] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const createMutation = useCreateComunicacaoDivida();
  const { data: comunicacoes, isLoading: loadingComunicacoes } = useComunicacoesDivida(acompanhamento?.id ?? null);

  const pessoa = acompanhamento?.pessoas;

  const resetForm = () => {
    setNumeroProcesso("");
    setTribunal("");
    setValorCredito("");
    setValorDivida("");
    setObservacoes("");
  };

  const handleSubmit = () => {
    if (!acompanhamento) return;
    if (!numeroProcesso.trim()) {
      toast.error("Informe o número do processo");
      return;
    }

    createMutation.mutate(
      {
        acompanhamento_id: acompanhamento.id,
        pessoa_id: acompanhamento.pessoa_id,
        numero_processo: numeroProcesso.trim(),
        tribunal: tribunal || undefined,
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
          toast.success("Comunicação de dívida registrada");
          resetForm();
        },
        onError: () => toast.error("Erro ao registrar comunicação"),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            Comunicar Dívida ao Juiz
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Dados da Pessoa (readonly) */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Dados do Credor</p>
            <p className="text-sm font-medium">{pessoa?.nome || "—"}</p>
            <p className="text-xs font-mono text-muted-foreground">{acompanhamento?.cpf_cnpj}</p>
            {pessoa?.endereco && (
              <p className="text-xs text-muted-foreground">
                {pessoa.endereco}{pessoa.cidade ? `, ${pessoa.cidade}` : ""}{pessoa.uf ? ` - ${pessoa.uf}` : ""}
              </p>
            )}
            {pessoa?.email && <p className="text-xs text-muted-foreground">{pessoa.email}</p>}
            {pessoa?.telefone && <p className="text-xs text-muted-foreground">{pessoa.telefone}</p>}
          </div>

          {/* Formulário */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Número do Processo *</Label>
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
                placeholder="Detalhes adicionais sobre a comunicação..."
                rows={3}
              />
            </div>
          </div>

          {/* Histórico de comunicações */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-3">Histórico de Comunicações</h3>
            {loadingComunicacoes ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : !comunicacoes?.length ? (
              <p className="text-sm text-muted-foreground">Nenhuma comunicação registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {comunicacoes.map((c) => {
                  const st = STATUS_LABELS[c.status] || STATUS_LABELS.pendente;
                  return (
                    <div key={c.id} className="border rounded-lg p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium">{c.numero_processo}</span>
                        <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                      </div>
                      {c.tribunal && <p className="text-muted-foreground text-xs">Tribunal: {c.tribunal}</p>}
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {c.valor_credito != null && <span>Crédito: R$ {Number(c.valor_credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                        {c.valor_divida != null && <span>Dívida: R$ {Number(c.valor_divida).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                      </div>
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

        <SheetFooter className="sticky bottom-0 bg-background border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            <Gavel className="w-4 h-4 mr-1" />
            {createMutation.isPending ? "Registrando..." : "Registrar Comunicação"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
