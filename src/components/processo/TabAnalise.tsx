import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCamposAnalise } from "@/hooks/useCamposAnalise";
import { useProcessoCamposValores, useSaveProcessoCampoValor } from "@/hooks/useProcessoCamposValores";
import { useProcessoAreas, useEnsureProcessoAreas, useToggleAreaConcluida, useUpdateAreaObservacoes, AREAS_TRABALHO, AREA_LABELS, type AreaTrabalho } from "@/hooks/useProcessoAreas";
import { useEquipes } from "@/hooks/useEquipes";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProcesso, type Processo } from "@/hooks/useProcessos";
import { toast } from "sonner";
import { Scale, DollarSign, FileCheck, ShieldCheck, CheckCircle2, Clock, FunctionSquare, ShieldAlert, PlayCircle, Users } from "lucide-react";
import { evaluateFormula, formatFormulaResult } from "@/lib/formula-engine";

const AREA_ICONS: Record<AreaTrabalho, React.ReactNode> = {
  juridico: <Scale className="w-4 h-4" />,
  financeiro: <DollarSign className="w-4 h-4" />,
  documental: <FileCheck className="w-4 h-4" />,
  compliance: <ShieldCheck className="w-4 h-4" />,
};

interface Props {
  processo: Processo;
  onSaveField: (field: string, value: any) => Promise<void>;
}

export default function TabAnalise({ processo, onSaveField }: Props) {
  const { data: campos = [] } = useCamposAnalise();
  const { data: valores = [] } = useProcessoCamposValores(processo.id);
  const saveCampoValor = useSaveProcessoCampoValor();
  const { data: areas = [] } = useProcessoAreas(processo.id);
  const ensureAreas = useEnsureProcessoAreas();
  const toggleArea = useToggleAreaConcluida();
  const updateObs = useUpdateAreaObservacoes();
  const updateProcesso = useUpdateProcesso();
  const { data: equipes = [] } = useEquipes();
  const { user } = useAuth();

  const concluidasCount = areas.filter(a => a.concluido).length;
  const totalAreas = AREAS_TRABALHO.length;
  const progressPercent = totalAreas > 0 ? (concluidasCount / totalAreas) * 100 : 0;

  const regularCampos = useMemo(() => campos.filter(c => c.tipo !== "formula"), [campos]);
  const formulaCampos = useMemo(() => campos.filter(c => c.tipo === "formula" && c.formula), [campos]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof regularCampos> = {};
    regularCampos.forEach((c) => {
      if (!map[c.grupo]) map[c.grupo] = [];
      map[c.grupo].push(c);
    });
    return map;
  }, [regularCampos]);

  const getValor = (campoId: string) => valores.find((v) => v.campo_id === campoId)?.valor ?? "";

  const formulaVars = useMemo(() => {
    const vars = new Map<string, number>();
    if (processo.valor_estimado != null) {
      vars.set("Valor da Causa", Number(processo.valor_estimado));
      vars.set("Valor Estimado", Number(processo.valor_estimado));
    }
    if (processo.valor_precificado != null) {
      vars.set("Valor Precificado", Number(processo.valor_precificado));
    }
    campos.forEach(c => {
      if (c.tipo !== "formula") {
        const val = getValor(c.id);
        if (val) vars.set(c.nome, Number(val) || 0);
      }
    });
    return vars;
  }, [processo.valor_estimado, processo.valor_precificado, campos, valores]);

  const formulaGrouped = useMemo(() => {
    const map: Record<string, typeof formulaCampos> = {};
    formulaCampos.forEach((c) => {
      if (!map[c.grupo]) map[c.grupo] = [];
      map[c.grupo].push(c);
    });
    return map;
  }, [formulaCampos]);

  const handleSave = async (campoId: string, valor: string | null) => {
    try {
      await saveCampoValor.mutateAsync({ processo_id: processo.id, campo_id: campoId, valor });
    } catch {
      toast.error("Erro ao salvar campo");
    }
  };

  const handleToggle = async (areaItem: typeof areas[0]) => {
    try {
      await toggleArea.mutateAsync({
        id: areaItem.id,
        concluido: !areaItem.concluido,
        concluido_por: user?.id,
        processo_id: processo.id,
      });
      toast.success(!areaItem.concluido ? `${AREA_LABELS[areaItem.area as AreaTrabalho]} concluído` : `${AREA_LABELS[areaItem.area as AreaTrabalho]} reaberto`);
    } catch {
      toast.error("Erro ao atualizar área");
    }
  };

  const handleAptoAnalise = async () => {
    try {
      await ensureAreas.mutateAsync({ processoId: processo.id });
      await updateProcesso.mutateAsync({
        id: processo.id,
        updates: {
          apto_analise: true,
          apto_analise_por: user?.id ?? null,
          apto_analise_em: new Date().toISOString(),
        } as any,
      });
      toast.success("Processo apto para análise. Áreas liberadas.");
    } catch {
      toast.error("Erro ao marcar como apto");
    }
  };

  const getAreaData = (area: AreaTrabalho) => areas.find(a => a.area === area);
  const isApto = (processo as any).apto_analise === true;

  return (
    <div className="space-y-4">
      {/* Gate: Apto para Análise */}
      {!isApto && (
        <div className="bg-warning/5 border border-warning/30 rounded-xl p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Análise Prévia Pendente</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              O analista deve realizar uma análise inicial antes de liberar para as equipes de trabalho.
            </p>
          </div>
          <Button
            onClick={handleAptoAnalise}
            disabled={ensureAreas.isPending || updateProcesso.isPending}
            className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
          >
            <PlayCircle className="w-4 h-4" />
            {ensureAreas.isPending ? "Liberando..." : "Apto para Análise — Liberar Áreas"}
          </Button>
        </div>
      )}

      {/* Areas checklist - clean vertical list */}
      {isApto && areas.length > 0 && (
        <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Áreas de Trabalho</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{concluidasCount}/{totalAreas}</span>
              {concluidasCount === totalAreas && (
                <Badge className="text-[10px] bg-success/10 text-success border-success/20">Pronto para Negócio</Badge>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-1.5" />

          <div className="space-y-1">
            {AREAS_TRABALHO.map(area => {
              const areaData = getAreaData(area);
              if (!areaData) return null;
              const concluido = areaData.concluido;
              const assignedEquipe = equipes.find((e: any) => e.id === areaData.equipe_id);

              return (
                <div
                  key={area}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    concluido ? "bg-success/5" : "hover:bg-muted/30"
                  }`}
                >
                  <Checkbox
                    checked={concluido}
                    onCheckedChange={() => handleToggle(areaData)}
                    className="shrink-0"
                  />
                  <div className={`shrink-0 ${concluido ? "text-success" : "text-muted-foreground"}`}>
                    {AREA_ICONS[area]}
                  </div>
                  <span className={`text-xs font-medium w-24 shrink-0 ${concluido ? "text-success" : ""}`}>
                    {AREA_LABELS[area]}
                  </span>

                  {assignedEquipe ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span className="text-[11px]">{assignedEquipe.nome}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50">Sem equipe</span>
                  )}

                  <div className="flex-1" />

                  {concluido && areaData.concluido_em && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(areaData.concluido_em).toLocaleDateString("pt-BR")}
                    </span>
                  )}

                  {concluido ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Observações colapsáveis por área */}
          {AREAS_TRABALHO.map(area => {
            const areaData = getAreaData(area);
            if (!areaData) return null;
            if (!areaData.observacoes && areaData.concluido) return null;
            return (
              <div key={`obs-${area}`} className="pl-10">
                <Textarea
                  placeholder={`Observações ${AREA_LABELS[area]}...`}
                  defaultValue={areaData.observacoes ?? ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim() || null;
                    if (val !== areaData.observacoes) {
                      updateObs.mutate({ id: areaData.id, observacoes: val });
                    }
                  }}
                  className="resize-none h-12 text-[11px] bg-transparent border-dashed"
                />
              </div>
            );
          })}
        </div>
      )}

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

      {/* Formula fields */}
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

      {campos.length === 0 && !isApto && (
        <p className="text-[10px] text-muted-foreground italic text-center py-4">
          Nenhum campo de análise configurado. Acesse Configurações → Campos de Análise para criar campos.
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

function InlineNumberField({ label, defaultValue, onSave }: { label: string; defaultValue?: number | null; onSave: (v: number | null) => void }) {
  const [val, setVal] = useState(defaultValue?.toString() ?? "");
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave(val === "" ? null : Number(val))}
        className="h-8 text-xs"
        step="0.01"
      />
    </div>
  );
}
