import { NegocioWithRelations, useUpdateNegocio } from "@/hooks/useNegocios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const TIPO_SERVICO_OPTIONS = [
  { value: "compra_credito", label: "Compra de Crédito Judicial" },
  { value: "compensacao_tributaria", label: "Compensação Tributária" },
  { value: "honorarios", label: "Honorários" },
  { value: "cessao_direitos", label: "Cessão de Direitos" },
];

interface Props {
  negocio: NegocioWithRelations;
}

export default function TabDadosGerais({ negocio }: Props) {
  const updateNegocio = useUpdateNegocio();

  const saveField = async (field: string, value: any) => {
    try {
      await updateNegocio.mutateAsync({ id: negocio.id, updates: { [field]: value } });
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-foreground mb-1">Informações do Negócio</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          <InlineField label="Título" defaultValue={negocio.titulo ?? ""} onSave={(v) => saveField("titulo", v || null)} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Tipo de Serviço</p>
            <Select defaultValue={negocio.tipo_servico ?? ""} onValueChange={(v) => saveField("tipo_servico", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TIPO_SERVICO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Prioridade</p>
            <Select defaultValue={negocio.prioridade} onValueChange={(v) => saveField("prioridade", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-foreground mb-1">Valores</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          <InlineNumberField label="Valor Proposta (R$)" defaultValue={negocio.valor_proposta} onSave={(v) => saveField("valor_proposta", v)} />
          <InlineNumberField label="Valor Fechamento (R$)" defaultValue={negocio.valor_fechamento} onSave={(v) => saveField("valor_fechamento", v)} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Data Abertura</p>
            <Input type="date" defaultValue={negocio.data_abertura?.slice(0, 10) ?? ""} className="h-8 text-xs" onBlur={(e) => saveField("data_abertura", e.target.value || null)} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-foreground mb-1">Observações</p>
        <ObservacoesField defaultValue={negocio.observacoes ?? ""} onSave={(v) => saveField("observacoes", v || null)} />
      </div>
    </div>
  );
}

function InlineField({ label, defaultValue, onSave }: { label: string; defaultValue: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      <Input value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} className="h-8 text-xs" />
    </div>
  );
}

function InlineNumberField({ label, defaultValue, onSave }: { label: string; defaultValue: number | null; onSave: (v: number | null) => void }) {
  const [val, setVal] = useState(defaultValue ?? "");
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val === "" ? null : Number(val))} className="h-8 text-xs" step="0.01" />
    </div>
  );
}

function ObservacoesField({ defaultValue, onSave }: { defaultValue: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(defaultValue);
  return <Textarea value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} rows={3} className="text-xs" />;
}
