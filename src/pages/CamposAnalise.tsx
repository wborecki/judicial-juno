import { useState, useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GripVertical, FunctionSquare } from "lucide-react";
import { toast } from "sonner";
import { useAllCamposAnalise, useCamposAnalise, useCreateCampoAnalise, useUpdateCampoAnalise, useDeleteCampoAnalise, type CampoAnalise } from "@/hooks/useCamposAnalise";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateFormula, extractDependencies, detectCycles } from "@/lib/formula-engine";

const TIPOS = [
  { value: "texto", label: "Texto" },
  { value: "numero", label: "Número" },
  { value: "moeda", label: "Moeda (R$)" },
  { value: "data", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "checkbox", label: "Checkbox" },
  { value: "formula", label: "Fórmula (fx)" },
];

const TIPO_LABEL: Record<string, string> = Object.fromEntries(TIPOS.map((t) => [t.value, t.label]));

const ENTIDADES = [
  { value: "processo", label: "Processos" },
  { value: "negocio", label: "Negócios" },
];

const FORMATO_OPTIONS = [
  { value: "numero", label: "Número" },
  { value: "moeda", label: "Moeda (R$)" },
  { value: "percentual", label: "Percentual (%)" },
];

export default function CamposAnalise() {
  const [entidade, setEntidade] = useState("processo");
  const { data: campos = [], isLoading } = useAllCamposAnalise(entidade);
  const createCampo = useCreateCampoAnalise();
  const updateCampo = useUpdateCampoAnalise();
  const deleteCampo = useDeleteCampoAnalise();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CampoAnalise | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [grupo, setGrupo] = useState("");
  const [obrigatorio, setObrigatorio] = useState(false);
  const [ordem, setOrdem] = useState(0);
  const [opcoes, setOpcoes] = useState("");
  const [formula, setFormula] = useState("");
  const [formatoFormula, setFormatoFormula] = useState("numero");

  const formulaError = useMemo(() => {
    if (tipo !== "formula" || !formula.trim()) return null;
    return validateFormula(formula);
  }, [tipo, formula]);

  const openNew = () => {
    setEditing(null);
    setNome(""); setTipo("texto"); setGrupo(""); setObrigatorio(false);
    setOrdem(0); setOpcoes(""); setFormula(""); setFormatoFormula("numero");
    setSheetOpen(true);
  };

  const openEdit = (c: CampoAnalise) => {
    setEditing(c);
    setNome(c.nome); setTipo(c.tipo); setGrupo(c.grupo);
    setObrigatorio(c.obrigatorio); setOrdem(c.ordem);
    setOpcoes(Array.isArray(c.opcoes) ? c.opcoes.join(", ") : "");
    setFormula(c.formula ?? ""); setFormatoFormula(c.formato_formula ?? "numero");
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!grupo.trim()) { toast.error("Grupo é obrigatório"); return; }
    if (tipo === "formula") {
      if (!formula.trim()) { toast.error("Fórmula é obrigatória"); return; }
      if (formulaError) { toast.error(formulaError); return; }
      // Cycle detection
      const testCampos = campos.map(c => c.id === editing?.id ? { ...c, nome, formula } : c);
      if (!editing) testCampos.push({ nome, tipo: "formula", formula } as any);
      const cycles = detectCycles(testCampos);
      if (cycles.length > 0) {
        toast.error(`Referência circular detectada: ${cycles.join(" → ")}`);
        return;
      }
    }

    const payload = {
      nome: nome.trim(),
      tipo,
      grupo: grupo.trim(),
      obrigatorio: tipo === "formula" ? false : obrigatorio,
      ordem,
      opcoes: tipo === "select" ? opcoes.split(",").map((o) => o.trim()).filter(Boolean) : [],
      ativo: true,
      entidade,
      formula: tipo === "formula" ? formula.trim() : null,
      formato_formula: tipo === "formula" ? formatoFormula : "numero",
    };

    try {
      if (editing) {
        await updateCampo.mutateAsync({ id: editing.id, updates: payload });
        toast.success("Campo atualizado");
      } else {
        await createCampo.mutateAsync(payload);
        toast.success("Campo criado");
      }
      setSheetOpen(false);
    } catch {
      toast.error("Erro ao salvar campo");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampo.mutateAsync(id);
      toast.success("Campo desativado");
    } catch {
      toast.error("Erro ao remover campo");
    }
  };

  const grouped: Record<string, CampoAnalise[]> = {};
  campos.filter((c) => c.ativo).forEach((c) => {
    if (!grouped[c.grupo]) grouped[c.grupo] = [];
    grouped[c.grupo].push(c);
  });

  const existingGroups = [...new Set(campos.map((c) => c.grupo))].filter(Boolean);

  // Available fields for formula references
  const availableFields = useMemo(() => {
    const customFields = campos
      .filter(c => c.ativo && c.tipo !== "formula" && c.id !== editing?.id)
      .map(c => c.nome);
    const fixedFields = entidade === "processo" ? ["Valor da Causa", "Valor Precificado"] : [];
    return [...fixedFields, ...customFields];
  }, [campos, editing, entidade]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Campos Personalizados</h1>
          <p className="text-xs text-muted-foreground mt-1">Configure os campos que aparecerão na aba Análise de cada entidade</p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />Novo Campo
        </Button>
      </div>

      <Tabs value={entidade} onValueChange={setEntidade}>
        <TabsList>
          {ENTIDADES.map((e) => (
            <TabsTrigger key={e.value} value={e.value}>{e.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {Object.keys(grouped).length === 0 && !isLoading && (
        <Card className="glass-card">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <CardTitle className="text-lg mb-2">Nenhum campo configurado</CardTitle>
            <p className="text-sm text-muted-foreground max-w-md">Crie campos para que eles apareçam na aba Análise dos processos.</p>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([grupo, camposGrupo]) => (
        <div key={grupo} className="space-y-2">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{grupo}</p>
          <div className="space-y-1">
            {camposGrupo.map((campo) => (
              <div key={campo.id} className="flex items-center gap-3 bg-card border border-border/40 rounded-lg px-4 py-2.5 group">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {campo.tipo === "formula" && <FunctionSquare className="w-3.5 h-3.5 text-primary shrink-0" />}
                    <p className="text-sm font-medium truncate">{campo.nome}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{TIPO_LABEL[campo.tipo] || campo.tipo}</Badge>
                    {campo.tipo === "formula" && campo.formato_formula && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {FORMATO_OPTIONS.find(f => f.value === campo.formato_formula)?.label || campo.formato_formula}
                      </Badge>
                    )}
                    {campo.obrigatorio && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Obrigatório</Badge>}
                    <span className="text-[10px] text-muted-foreground">Ordem: {campo.ordem}</span>
                  </div>
                  {campo.tipo === "formula" && campo.formula && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{campo.formula}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openEdit(campo)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desativar campo?</AlertDialogTitle>
                      <AlertDialogDescription>O campo "{campo.nome}" será desativado e não aparecerá mais na aba Análise.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(campo.id)}>Desativar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar Campo" : "Novo Campo"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">Nome do campo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1" placeholder="Ex: Valor de risco" />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Grupo</Label>
              <Input value={grupo} onChange={(e) => setGrupo(e.target.value)} className="mt-1" placeholder="Ex: Jurídico, Financeiro" list="grupos-list" />
              <datalist id="grupos-list">
                {existingGroups.map((g) => <option key={g} value={g} />)}
              </datalist>
              <p className="text-[10px] text-muted-foreground mt-0.5">Campos do mesmo grupo aparecem juntos na aba Análise</p>
            </div>

            {tipo === "select" && (
              <div>
                <Label className="text-xs">Opções (separadas por vírgula)</Label>
                <Input value={opcoes} onChange={(e) => setOpcoes(e.target.value)} className="mt-1" placeholder="Opção 1, Opção 2, Opção 3" />
              </div>
            )}

            {tipo === "formula" && (
              <>
                <div>
                  <Label className="text-xs">Fórmula</Label>
                  <Textarea
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    className="mt-1 font-mono text-xs min-h-[60px]"
                    placeholder="Ex: {Valor da Causa} * 0.7"
                  />
                  {formulaError && (
                    <p className="text-[10px] text-destructive mt-1">⚠ {formulaError}</p>
                  )}
                  {!formulaError && formula.trim() && (
                    <p className="text-[10px] text-success mt-1">✓ Fórmula válida</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Formato de saída</Label>
                  <Select value={formatoFormula} onValueChange={setFormatoFormula}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMATO_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Campos disponíveis</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {availableFields.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormula(prev => prev + `{${f}}`)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-accent border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Funções: ROUND, IF, MIN, MAX, ABS, PERCENT
                  </p>
                </div>
              </>
            )}

            {tipo !== "formula" && (
              <div>
                <Label className="text-xs">Ordem</Label>
                <Input type="number" value={ordem} onChange={(e) => setOrdem(Number(e.target.value))} className="mt-1 w-24" />
              </div>
            )}
            {tipo === "formula" && (
              <div>
                <Label className="text-xs">Ordem</Label>
                <Input type="number" value={ordem} onChange={(e) => setOrdem(Number(e.target.value))} className="mt-1 w-24" />
              </div>
            )}

            {tipo !== "formula" && (
              <div className="flex items-center gap-2">
                <Checkbox checked={obrigatorio} onCheckedChange={(v) => setObrigatorio(!!v)} id="obrigatorio" />
                <Label htmlFor="obrigatorio" className="text-xs">Campo obrigatório</Label>
              </div>
            )}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createCampo.isPending || updateCampo.isPending || (tipo === "formula" && !!formulaError)}>
              {editing ? "Salvar" : "Criar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
