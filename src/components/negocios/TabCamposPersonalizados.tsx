import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCamposAnalise } from "@/hooks/useCamposAnalise";
import { useNegocioCamposValores, useSaveNegocioCampoValor } from "@/hooks/useNegocioCamposValores";
import { toast } from "sonner";

interface Props {
  negocioId: string;
}

export default function TabCamposPersonalizados({ negocioId }: Props) {
  const { data: campos = [] } = useCamposAnalise("negocio");
  const { data: valores = [] } = useNegocioCamposValores(negocioId);
  const saveCampoValor = useSaveNegocioCampoValor();

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
      await saveCampoValor.mutateAsync({ negocio_id: negocioId, campo_id: campoId, valor });
    } catch {
      toast.error("Erro ao salvar campo");
    }
  };

  return (
    <div className="space-y-4">
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
          Nenhum campo personalizado para negócios. Acesse Configurações → Campos Personalizados para criar.
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
        <Checkbox checked={valor === "true"} onCheckedChange={(checked) => onSave(checked ? "true" : "false")} />
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
