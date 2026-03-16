import { useState } from "react";
import { useTiposAtividade, useCreateTipoAtividade, useUpdateTipoAtividade, useDeleteTipoAtividade, type TipoAtividade } from "@/hooks/useTiposAtividade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ICON_OPTIONS = [
  "CheckSquare", "Users", "Phone", "Mail", "RefreshCw", "FileSearch",
  "FileSignature", "StickyNote", "Send", "FileText", "Calendar", "Clock",
  "Briefcase", "MessageSquare", "DollarSign", "Star",
];

const COR_OPTIONS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#06b6d4",
];

const ENTIDADE_OPTIONS = [
  { value: "agenda", label: "Agenda" },
  { value: "negocio", label: "Negócio" },
  { value: "ambos", label: "Ambos" },
];

const emptyForm = { nome: "", slug: "", icone: "StickyNote", cor: "#3b82f6", entidade: "agenda", ativo: true, ordem: 0 };

export default function TiposAtividade() {
  const { data: tipos = [], isLoading } = useTiposAtividade();
  const createMut = useCreateTipoAtividade();
  const updateMut = useUpdateTipoAtividade();
  const deleteMut = useDeleteTipoAtividade();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TipoAtividade | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setSheetOpen(true); };
  const openEdit = (t: TipoAtividade) => {
    setEditing(t);
    setForm({ nome: t.nome, slug: t.slug, icone: t.icone, cor: t.cor, entidade: t.entidade, ativo: t.ativo, ordem: t.ordem });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.nome.trim()) { toast.error("Informe o nome"); return; }
    const slug = form.slug.trim() || form.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
    const payload = { ...form, slug };

    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success("Tipo atualizado"); setSheetOpen(false); },
        onError: () => toast.error("Erro ao atualizar"),
      });
    } else {
      createMut.mutate(payload, {
        onSuccess: () => { toast.success("Tipo criado"); setSheetOpen(false); },
        onError: () => toast.error("Erro ao criar"),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => toast.success("Tipo removido"),
      onError: () => toast.error("Erro ao remover"),
    });
  };

  const agendaTipos = tipos.filter(t => t.entidade === "agenda" || t.entidade === "ambos");
  const negocioTipos = tipos.filter(t => t.entidade === "negocio" || t.entidade === "ambos");

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tipos de Atividade</h1>
          <p className="text-xs text-muted-foreground mt-1">Configure os tipos de atividade da agenda e dos negócios</p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> Novo Tipo
        </Button>
      </div>

      {/* Agenda */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Agenda</h2>
        <TipoTable tipos={agendaTipos} isLoading={isLoading} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {/* Negócio */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Negócio</h2>
        <TipoTable tipos={negocioTipos} isLoading={isLoading} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>{editing ? "Editar Tipo" : "Novo Tipo"}</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Nome</p>
              <Input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: Contato com Credor" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Slug (identificador)</p>
              <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="Gerado automaticamente" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Entidade</p>
              <Select value={form.entidade} onValueChange={v => set("entidade", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTIDADE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Ícone</p>
              <Select value={form.icone} onValueChange={v => set("icone", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Cor</p>
              <div className="flex gap-2 flex-wrap">
                {COR_OPTIONS.map(c => (
                  <button
                    key={c}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${form.cor === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => set("cor", c)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Ordem</p>
              <Input type="number" value={form.ordem} onChange={e => set("ordem", Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.ativo} onCheckedChange={v => set("ativo", v)} />
              <span className="text-xs">Ativo</span>
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

function TipoTable({ tipos, isLoading, onEdit, onDelete }: {
  tipos: TipoAtividade[];
  isLoading: boolean;
  onEdit: (t: TipoAtividade) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;
  if (tipos.length === 0) return <p className="text-xs text-muted-foreground">Nenhum tipo configurado.</p>;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cor</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Ícone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tipos.map(t => (
            <TableRow key={t.id}>
              <TableCell>
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.cor }} />
              </TableCell>
              <TableCell className="text-xs font-medium">{t.nome}</TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">{t.slug}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{t.icone}</TableCell>
              <TableCell>
                <Badge variant={t.ativo ? "default" : "secondary"} className="text-[10px]">
                  {t.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(t)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover tipo?</AlertDialogTitle>
                        <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(t.id)}>Remover</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
