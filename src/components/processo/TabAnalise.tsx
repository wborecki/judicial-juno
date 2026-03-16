import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCamposAnalise } from "@/hooks/useCamposAnalise";
import { useProcessoCamposValores, useSaveProcessoCampoValor } from "@/hooks/useProcessoCamposValores";
import { toast } from "sonner";

interface Props {
  processo: any;
  onSaveField: (field: string, value: any) => Promise<void>;
}

export default function TabAnalise({ processo, onSaveField }: Props) {
  const { data: campos = [] } = useCamposAnalise();
  const { data: valores = [] } = useProcessoCamposValores(processo.id);
  const saveCampoValor = useSaveProcessoCampoValor();

  const grouped = useMemo(() => {
    const map: Record<string, typeof campos> = {};
    campos.forEach((c) => {
      if (!map[c.grupo]) map[c.grupo] = [];
      map[c.grupo].push(c);
    });
    return map;
  }, [campos]);

  const getValor = (campoId: string) => valores.find((v) => v.campo_id === campoId)?.valor ?? "";

  const handleSave = async (campoId: string, valor: string | null) => {
    try {
      await saveCampoValor.mutateAsync({ processo_id: processo.id, campo_id: campoId, valor });
    } catch {
      toast.error("Erro ao salvar campo");
    }
  };

  return (
    <div className="space-y-4">
      {/* Fixed financial block */}
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-foreground mb-1">Dados Financeiros</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
          <InlineNumberField label="Valor da Causa (R$)" defaultValue={processo.valor_estimado} onSave={(v) => onSaveField("valor_estimado", v)} />
          <InlineNumberField label="Valor Precificado (R$)" defaultValue={processo.valor_precificado} onSave={(v) => onSaveField("valor_precificado", v)} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Data Precificação</p>
            <Input type="date" defaultValue={processo.precificacao_data ? processo.precificacao_data.slice(0, 10) : ""} className="h-8 text-xs" onBlur={(e) => onSaveField("precificacao_data", e.target.value || null)} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Tipo Pagamento</p>
            <Select defaultValue={processo.tipo_pagamento || ""} onValueChange={(v) => onSaveField("tipo_pagamento", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RPV">RPV</SelectItem>
                <SelectItem value="Precatório">Precatório</SelectItem>
                <SelectItem value="Alvará">Alvará</SelectItem>
                <SelectItem value="Depósito Judicial">Depósito Judicial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dynamic field groups */}
      {Object.entries(grouped).map(([grupo, camposGrupo]) => (
        <div key={grupo} className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
          <p className="text-xs font-semibold text-foreground mb-1">{grupo}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
            {camposGrupo.map((campo) => (
              <DynamicField key={campo.id} campo={campo} valor={getValor(campo.id)} onSave={(v) => handleSave(campo.id, v)} />
            ))}
          </div>
        </div>
      ))}

      {campos.length === 0 && (
        <p className="text-[10px] text-muted-foreground italic text-center py-4">
          Nenhum campo de análise configurado. Acesse Configurações → Campos de Análise para criar campos.
        </p>
      )}
    </div>
  );
}

function DynamicField({ campo, valor, onSave }: { campo: any; valor: string; onSave: (v: string | null) => void }) {
  const [localVal, setLocalVal] = useState(valor);

  if (campo.tipo === "checkbox") {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={valor === "true"}
          onCheckedChange={(checked) => onSave(checked ? "true" : "false")}
        />
        <p className="text-xs">{campo.nome}{campo.obrigatorio && <span className="text-destructive ml-0.5">*</span>}</p>
      </div>
    );
  }

  if (campo.tipo === "select") {
    const opcoes: string[] = Array.isArray(campo.opcoes) ? campo.opcoes : [];
    return (
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
          {campo.nome}{campo.obrigatorio && <span className="text-destructive ml-0.5">*</span>}
        </p>
        <Select defaultValue={valor || ""} onValueChange={(v) => onSave(v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {opcoes.map((op) => (
              <SelectItem key={op} value={op}>{op}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const inputType = campo.tipo === "data" ? "date" : campo.tipo === "numero" || campo.tipo === "moeda" ? "number" : "text";
  const prefix = campo.tipo === "moeda" ? "R$ " : "";

  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
        {prefix}{campo.nome}{campo.obrigatorio && <span className="text-destructive ml-0.5">*</span>}
      </p>
      <Input
        type={inputType}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => onSave(localVal || null)}
        className="h-8 text-xs"
        step={campo.tipo === "moeda" ? "0.01" : undefined}
      />
    </div>
  );
}

function InlineNumberField({ label, defaultValue, onSave }: { label: string; defaultValue: number | null; onSave: (v: number | null) => void }) {
  const [val, setVal] = useState(defaultValue ?? "");
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave(val === "" ? null : Number(val))}
        className="h-8 w-full text-xs bg-transparent outline-none rounded border border-transparent px-2 hover:border-border/60 focus:border-input focus:ring-1 focus:ring-ring transition-colors"
        step="0.01"
      />
    </div>
  );
}
