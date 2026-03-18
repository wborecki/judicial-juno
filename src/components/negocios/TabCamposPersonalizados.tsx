import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FunctionSquare } from "lucide-react";
import { useCamposAnalise } from "@/hooks/useCamposAnalise";
import { useNegocioCamposValores, useSaveNegocioCampoValor } from "@/hooks/useNegocioCamposValores";
import { evaluateFormula, formatFormulaResult } from "@/lib/formula-engine";
import { toast } from "sonner";

interface Props {
  negocioId: string;
  negocio?: any;
}

export default function TabCamposPersonalizados({ negocioId, negocio }: Props) {
  const { data: campos = [] } = useCamposAnalise("negocio");
  const { data: valores = [] } = useNegocioCamposValores(negocioId);
  const saveCampoValor = useSaveNegocioCampoValor();

  const regularCampos = useMemo(() => campos.filter(c => c.tipo !== "formula"), [campos]);
  const formulaCampos = useMemo(() => campos.filter(c => c.tipo === "formula" && c.formula), [campos]);

  const regularGrouped = useMemo(() => {
    const map: Record<string, typeof regularCampos> = {};
    regularCampos.forEach((c) => {
      if (!map[c.grupo]) map[c.grupo] = [];
      map[c.grupo].push(c);
    });
    return map;
  }, [regularCampos]);

  const formulaGrouped = useMemo(() => {
    const map: Record<string, typeof formulaCampos> = {};
    formulaCampos.forEach((c) => {
      if (!map[c.grupo]) map[c.grupo] = [];
      map[c.grupo].push(c);
    });
    return map;
  }, [formulaCampos]);

  const getValor = (campoId: string) => valores.find((v) => v.campo_id === campoId)?.valor ?? "";

  const formulaVars = useMemo(() => {
    const vars = new Map<string, number>();
    // Add negocio fixed fields if available
    if (negocio?.valor_face != null) vars.set("Valor Face", Number(negocio.valor_face));
    if (negocio?.valor_proposta != null) vars.set("Valor Proposta", Number(negocio.valor_proposta));
    if (negocio?.valor_fechamento != null) vars.set("Valor Fechamento", Number(negocio.valor_fechamento));
    if (negocio?.desagio_percentual != null) vars.set("Deságio", Number(negocio.desagio_percentual));
    // Custom fields
    campos.forEach(c => {
      if (c.tipo !== "formula") {
        const val = getValor(c.id);
        if (val) vars.set(c.nome, Number(val) || 0);
      }
    });
    return vars;
  }, [negocio, campos, valores]);

  const handleSave = async (campoId: string, valor: string | null) => {
    try {
      await saveCampoValor.mutateAsync({ negocio_id: negocioId, campo_id: campoId, valor });
    } catch {
      toast.error("Erro ao salvar campo");
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(regularGrouped).map(([grupo, camposGrupo]) => (
        <div key={grupo} className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
          <p className="text-xs font-semibold text-foreground mb-1">{grupo}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
            {camposGrupo.map((campo) => (
              <DynamicField key={campo.id} campo={campo} valor={getValor(campo.id)} onSave={(v) => handleSave(campo.id, v)} />
            ))}
          </div>
        </div>
      ))}

      {Object.entries(formulaGrouped).map(([grupo, camposGrupo]) => (
        <div key={`fx-${grupo}`} className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FunctionSquare className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">{grupo} — Campos Calculados</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
            {camposGrupo.map((campo) => (
              <FormulaField key={campo.id} campo={campo} vars={formulaVars} />
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

function FormulaField({ campo, vars }: { campo: any; vars: Map<string, number> }) {
  const result = useMemo(() => {
    try {
      return evaluateFormula(campo.formula, vars);
    } catch {
      return null;
    }
  }, [campo.formula, vars]);

  const formatted = result !== null
    ? formatFormulaResult(result, campo.formato_formula || "numero")
    : "—";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1 flex items-center gap-1">
              <FunctionSquare className="w-3 h-3 text-primary" />
              {campo.nome}
            </p>
            <div className="h-8 flex items-center px-2 rounded border border-border/30 bg-muted/30 text-xs font-medium text-foreground">
              {formatted}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-mono">{campo.formula}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
