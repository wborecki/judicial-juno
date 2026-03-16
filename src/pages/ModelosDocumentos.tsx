import { useState } from "react";
import { useDocumentoModelos, useCreateModelo, useUpdateModelo, useDeleteModelo, type DocumentoModelo } from "@/hooks/useDocumentoModelos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, FileText, Pencil, Trash2, Variable, X } from "lucide-react";

const TIPO_VAR_OPTIONS = [
  { value: "texto", label: "Texto" },
  { value: "data", label: "Data" },
  { value: "moeda", label: "Moeda" },
  { value: "cpf", label: "CPF/CNPJ" },
  { value: "numero", label: "Número" },
];

const emptyForm = {
  nome: "",
  descricao: "",
  clicksign_template_key: "",
  arquivo_url: "",
  variaveis: [] as { nome: string; tipo: string }[],
  ativo: true,
};

export default function ModelosDocumentos() {
  const { data: modelos = [], isLoading } = useDocumentoModelos();
  const createMut = useCreateModelo();
  const updateMut = useUpdateModelo();
  const deleteMut = useDeleteModelo();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentoModelo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newVarNome, setNewVarNome] = useState("");
  const [newVarTipo, setNewVarTipo] = useState("texto");

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (m: DocumentoModelo) => {
    setEditing(m);
    setForm({
      nome: m.nome,
      descricao: m.descricao || "",
      clicksign_template_key: m.clicksign_template_key || "",
      arquivo_url: m.arquivo_url || "",
      variaveis: m.variaveis || [],
      ativo: m.ativo,
    });
    setSheetOpen(true);
  };

  const addVariable = () => {
    if (!newVarNome.trim()) return;
    setForm(f => ({
      ...f,
      variaveis: [...f.variaveis, { nome: newVarNome.trim(), tipo: newVarTipo }],
    }));
    setNewVarNome("");
    setNewVarTipo("texto");
  };

  const removeVariable = (idx: number) => {
    setForm(f => ({
      ...f,
      variaveis: f.variaveis.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    const payload = {
      nome: form.nome,
      descricao: form.descricao || null,
      clicksign_template_key: form.clicksign_template_key || null,
      arquivo_url: form.arquivo_url || null,
      variaveis: form.variaveis,
      ativo: form.ativo,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload } as any, {
        onSuccess: () => { toast.success("Modelo atualizado"); setSheetOpen(false); },
        onError: () => toast.error("Erro ao atualizar"),
      });
    } else {
      createMut.mutate(payload as any, {
        onSuccess: () => { toast.success("Modelo criado"); setSheetOpen(false); },
        onError: () => toast.error("Erro ao criar"),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => toast.success("Modelo removido"),
      onError: () => toast.error("Erro ao remover"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Modelos de Documentos</h1>
          <p className="text-xs text-muted-foreground mt-1">Gerencie templates para envio via ClickSign</p>
        </div>
        <Button size="sm" onClick={openNew} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo Modelo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : modelos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Nenhum modelo cadastrado</p>
          <p className="text-xs mt-1">Crie modelos de documentos para envio rápido via ClickSign.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {modelos.map(m => (
            <div key={m.id} className="border rounded-xl p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{m.nome}</span>
                  <Badge variant={m.ativo ? "default" : "secondary"} className="text-[10px]">
                    {m.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  {m.clicksign_template_key && (
                    <Badge variant="outline" className="text-[10px]">ClickSign</Badge>
                  )}
                </div>
                {m.descricao && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.descricao}</p>}
                {m.variaveis.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {m.variaveis.map((v, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {`{{${v.nome}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(m)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover modelo?</AlertDialogTitle>
                      <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(m.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet para criar/editar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar Modelo" : "Novo Modelo de Documento"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Contrato de Cessão de Crédito" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2} placeholder="Descrição do modelo..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Template Key (ClickSign)</Label>
              <Input value={form.clicksign_template_key} onChange={e => setForm(f => ({ ...f, clicksign_template_key: e.target.value }))} placeholder="Chave do template no ClickSign (opcional)" />
              <p className="text-[10px] text-muted-foreground">Se preenchido, o documento será gerado a partir do template no ClickSign.</p>
            </div>

            {/* Variáveis */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Variable className="w-3.5 h-3.5" /> Variáveis Dinâmicas
              </Label>
              {form.variaveis.length > 0 && (
                <div className="space-y-1">
                  {form.variaveis.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg px-3 py-1.5">
                      <span className="font-mono text-primary">{`{{${v.nome}}}`}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {TIPO_VAR_OPTIONS.find(t => t.value === v.tipo)?.label ?? v.tipo}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-5 w-5 ml-auto" onClick={() => removeVariable(i)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newVarNome}
                  onChange={e => setNewVarNome(e.target.value)}
                  placeholder="Nome da variável"
                  className="flex-1"
                  onKeyDown={e => e.key === "Enter" && addVariable()}
                />
                <Select value={newVarTipo} onValueChange={setNewVarTipo}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_VAR_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={addVariable}>Adicionar</Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Ativo</Label>
              <Switch checked={form.ativo} onCheckedChange={v => setForm(f => ({ ...f, ativo: v }))} />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
