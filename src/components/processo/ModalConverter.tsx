import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, User, Users } from "lucide-react";
import { toast } from "sonner";
import { Processo, useUpdateProcesso } from "@/hooks/useProcessos";
import { useCreateNegocio } from "@/hooks/useNegocios";
import { useProcessoPartes } from "@/hooks/useProcessoPartes";

const TIPO_SERVICO_LABELS: Record<string, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

const formatCurrency = (v?: number | null) =>
  v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

interface Props {
  processo: Processo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalConverter({ processo, open, onOpenChange }: Props) {
  const createNegocio = useCreateNegocio();
  const updateProcesso = useUpdateProcesso();
  const { data: partes = [] } = useProcessoPartes(processo.id);

  const [tipoServico, setTipoServico] = useState("compra_credito");
  const [observacoes, setObservacoes] = useState("");
  const [selectedAutores, setSelectedAutores] = useState<Set<string>>(new Set());
  const [isConverting, setIsConverting] = useState(false);

  const autores = useMemo(() => partes.filter(p => p.tipo === "autor"), [partes]);
  const reus = useMemo(() => partes.filter(p => p.tipo === "reu"), [partes]);

  // If no structured autores, use legacy
  const hasStructuredAutores = autores.length > 0;

  const toggleAutor = (id: string) => {
    setSelectedAutores(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedAutores.size === autores.length) {
      setSelectedAutores(new Set());
    } else {
      setSelectedAutores(new Set(autores.map(a => a.id)));
    }
  };

  const handleConverter = async () => {
    setIsConverting(true);
    try {
      // Mark as convertido
      if (processo.triagem_resultado !== "convertido") {
        await updateProcesso.mutateAsync({
          id: processo.id,
          updates: {
            triagem_resultado: "convertido",
            triagem_data: new Date().toISOString(),
          },
        });
      }

      if (hasStructuredAutores && selectedAutores.size > 0) {
        // Create one negócio per selected autor
        const selected = autores.filter(a => selectedAutores.has(a.id));
        const reuNome = reus.map(r => r.nome).join(", ") || processo.parte_re;

        for (const autor of selected) {
          await createNegocio.mutateAsync({
            processo_id: processo.id,
            pessoa_id: autor.pessoa_id ?? null,
            tipo_servico: tipoServico,
            negocio_status: "em_andamento",
            valor_proposta: processo.valor_estimado,
            valor_fechamento: null,
            data_abertura: new Date().toISOString(),
            data_fechamento: null,
            responsavel_id: null,
            observacoes: [
              `Titular: ${autor.nome}`,
              `Devedor: ${reuNome}`,
              observacoes.trim() || null,
            ].filter(Boolean).join("\n"),
          });
        }

        toast.success(
          selected.length === 1
            ? "1 negócio criado com sucesso!"
            : `${selected.length} negócios criados com sucesso!`
        );
      } else {
        // Legacy: single deal
        await createNegocio.mutateAsync({
          processo_id: processo.id,
          pessoa_id: processo.pessoa_id,
          tipo_servico: tipoServico,
          negocio_status: "em_andamento",
          valor_proposta: processo.valor_estimado,
          valor_fechamento: null,
          data_abertura: new Date().toISOString(),
          data_fechamento: null,
          responsavel_id: null,
          observacoes: observacoes.trim() || null,
        });
        toast.success("Negócio criado com sucesso!");
      }

      setObservacoes("");
      setSelectedAutores(new Set());
      onOpenChange(false);
    } catch {
      toast.error("Erro ao criar negócio(s)");
    } finally {
      setIsConverting(false);
    }
  };

  const canConvert = hasStructuredAutores ? selectedAutores.size > 0 : true;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Criar Negócio
          </SheetTitle>
          <SheetDescription className="text-xs">
            {hasStructuredAutores
              ? "Selecione os titulares do crédito para criar um negócio por titular."
              : "Um novo negócio será criado a partir deste processo."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CNJ</span>
              <span className="font-mono font-medium">{processo.numero_processo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tribunal</span>
              <span>{processo.tribunal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da Causa</span>
              <span className="font-semibold text-primary">{formatCurrency(processo.valor_estimado)}</span>
            </div>
            {reus.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Devedor(es)</span>
                <span className="truncate max-w-[250px]">{reus.map(r => r.nome).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Autores selection */}
          {hasStructuredAutores ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Titulares do Crédito — selecione para criar negócios
                </Label>
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-[10px] h-6 px-2">
                  {selectedAutores.size === autores.length ? "Desmarcar todos" : "Selecionar todos"}
                </Button>
              </div>
              <div className="border border-border/40 rounded-lg divide-y divide-border/30 max-h-48 overflow-y-auto">
                {autores.map(autor => (
                  <label
                    key={autor.id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={selectedAutores.has(autor.id)}
                      onCheckedChange={() => toggleAutor(autor.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{autor.nome}</p>
                      {autor.cpf_cnpj && (
                        <p className="text-[10px] text-muted-foreground font-mono">{autor.cpf_cnpj}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {selectedAutores.size > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {selectedAutores.size} negócio(s) será(ão) criado(s)
                </p>
              )}
            </div>
          ) : (
            <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Titular</span>
                <span className="font-medium text-foreground truncate max-w-[250px]">{processo.parte_autora}</span>
              </div>
            </div>
          )}

          {/* Tipo de serviço */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de Serviço</Label>
            <Select value={tipoServico} onValueChange={setTipoServico}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Notas sobre a conversão..."
              className="resize-none h-16 text-xs"
            />
          </div>
        </div>

        <SheetFooter className="mt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancelar</Button>
          <Button
            size="sm"
            onClick={handleConverter}
            disabled={isConverting || !canConvert}
            className="text-xs gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
          >
            <Briefcase className="w-3.5 h-3.5" />
            {hasStructuredAutores && selectedAutores.size > 1
              ? `Criar ${selectedAutores.size} Negócios`
              : "Criar Negócio"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
