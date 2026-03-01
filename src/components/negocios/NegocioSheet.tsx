import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useCreateNegocio } from "@/hooks/useNegocios";
import { usePessoas } from "@/hooks/usePessoas";
import { PipelineEtapa } from "@/hooks/useNegocioPipelines";
import { toast } from "sonner";

const TIPO_SERVICO_OPTIONS = [
  { value: "compra_credito", label: "Compra de Crédito Judicial" },
  { value: "compensacao_tributaria", label: "Compensação Tributária" },
  { value: "honorarios", label: "Honorários" },
  { value: "cessao_direitos", label: "Cessão de Direitos" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  etapas: PipelineEtapa[];
}

export default function NegocioSheet({ open, onOpenChange, etapas }: Props) {
  const createNegocio = useCreateNegocio();
  const { data: pessoas = [] } = usePessoas();

  const [titulo, setTitulo] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [etapa, setEtapa] = useState(etapas[0]?.id ?? "qualificacao");
  const [pessoaId, setPessoaId] = useState("");
  const [valorProposta, setValorProposta] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [prioridade, setPrioridade] = useState("media");

  function reset() {
    setTitulo(""); setTipoServico(""); setEtapa(etapas[0]?.id ?? "qualificacao");
    setPessoaId(""); setValorProposta(""); setObservacoes(""); setPrioridade("media");
  }

  async function handleSubmit() {
    if (!titulo.trim()) {
      toast.error("Informe o título do negócio");
      return;
    }
    createNegocio.mutate(
      {
        titulo,
        tipo_servico: tipoServico || null,
        pipeline_etapa: etapa,
        pessoa_id: pessoaId || null,
        valor_proposta: valorProposta ? Number(valorProposta) : null,
        observacoes: observacoes || null,
        prioridade,
        negocio_status: "em_andamento",
      },
      {
        onSuccess: () => {
          toast.success("Negócio criado com sucesso!");
          reset();
          onOpenChange(false);
        },
        onError: () => toast.error("Erro ao criar negócio"),
      }
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Negócio</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome do negócio" />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de Serviço</Label>
            <Select value={tipoServico} onValueChange={setTipoServico}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TIPO_SERVICO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Etapa do Pipeline</Label>
            <Select value={etapa} onValueChange={setEtapa}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {etapas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Pessoa</Label>
            <Select value={pessoaId} onValueChange={setPessoaId}>
              <SelectTrigger><SelectValue placeholder="Vincular pessoa" /></SelectTrigger>
              <SelectContent>
                {pessoas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Valor Proposta</Label>
            <Input type="number" value={valorProposta} onChange={(e) => setValorProposta(e.target.value)} placeholder="0,00" />
          </div>

          <div className="space-y-1.5">
            <Label>Prioridade</Label>
            <Select value={prioridade} onValueChange={setPrioridade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSubmit} disabled={createNegocio.isPending}>
            {createNegocio.isPending ? "Criando..." : "Criar Negócio"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
