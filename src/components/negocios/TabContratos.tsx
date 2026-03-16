import { useState } from "react";
import { useContratosCessao, useCreateContrato, useUpdateContrato, useDeleteContrato, type ContratoCessao } from "@/hooks/useContratosCessao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, FileText, Pencil, Trash2, Send } from "lucide-react";
import EnviarAssinaturaSheet from "./EnviarAssinaturaSheet";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "minuta", label: "Minuta" },
  { value: "assinado", label: "Assinado" },
  { value: "registrado", label: "Registrado" },
  { value: "homologado", label: "Homologado" },
];

const STATUS_COLORS: Record<string, string> = {
  minuta: "bg-muted text-muted-foreground",
  assinado: "bg-info/10 text-info",
  registrado: "bg-warning/10 text-warning",
  homologado: "bg-success/10 text-success",
};

interface Props {
  negocioId: string;
  processoId?: string | null;
}

const emptyForm = {
  status: "minuta",
  data_assinatura: "",
  data_registro: "",
  data_homologacao: "",
  valor_cessao: "",
  observacoes: "",
};

export default function TabContratos({ negocioId, processoId }: Props) {
  const { data: contratos = [], isLoading } = useContratosCessao(negocioId);
  const createMut = useCreateContrato();
  const updateMut = useUpdateContrato();
  const deleteMut = useDeleteContrato();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ContratoCessao | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (c: ContratoCessao) => {
    setEditing(c);
    setForm({
      status: c.status,
      data_assinatura: c.data_assinatura ?? "",
      data_registro: c.data_registro ?? "",
      data_homologacao: c.data_homologacao ?? "",
      valor_cessao: c.valor_cessao?.toString() ?? "",
      observacoes: c.observacoes ?? "",
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    const payload = {
      negocio_id: negocioId,
      processo_id: processoId ?? null,
      status: form.status,
      data_assinatura: form.data_assinatura || null,
      data_registro: form.data_registro || null,
      data_homologacao: form.data_homologacao || null,
      valor_cessao: form.valor_cessao ? Number(form.valor_cessao) : null,
      observacoes: form.observacoes || null,
      arquivo_url: null,
      arquivo_nome: null,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success("Contrato atualizado"); setSheetOpen(false); },
        onError: () => toast.error("Erro ao atualizar"),
      });
    } else {
      createMut.mutate(payload, {
        onSuccess: () => { toast.success("Contrato criado"); setSheetOpen(false); },
        onError: () => toast.error("Erro ao criar"),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => toast.success("Contrato removido"),
      onError: () => toast.error("Erro ao remover"),
    });
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{contratos.length} contrato(s)</p>
        <Button size="sm" onClick={openNew} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo Contrato
        </Button>
      </div>

      {contratos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhum contrato de cessão registrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contratos.map(c => (
            <div key={c.id} className="border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${STATUS_COLORS[c.status] ?? ""}`}>
                    {STATUS_OPTIONS.find(s => s.value === c.status)?.label ?? c.status}
                  </Badge>
                  {c.valor_cessao && (
                    <span className="text-xs font-semibold text-primary">
                      {c.valor_cessao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  {c.data_assinatura && <span>Assinado: {format(new Date(c.data_assinatura), "dd/MM/yyyy")}</span>}
                  {c.data_registro && <span>Registrado: {format(new Date(c.data_registro), "dd/MM/yyyy")}</span>}
                  {c.data_homologacao && <span>Homologado: {format(new Date(c.data_homologacao), "dd/MM/yyyy")}</span>}
                </div>
                {c.observacoes && <p className="text-xs text-muted-foreground mt-1 truncate">{c.observacoes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
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
                      <AlertDialogTitle>Remover contrato?</AlertDialogTitle>
                      <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(c.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>{editing ? "Editar Contrato" : "Novo Contrato de Cessão"}</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Valor da Cessão</Label>
              <Input type="number" value={form.valor_cessao} onChange={e => set("valor_cessao", e.target.value)} placeholder="0,00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Data Assinatura</Label>
                <Input type="date" value={form.data_assinatura} onChange={e => set("data_assinatura", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data Registro</Label>
                <Input type="date" value={form.data_registro} onChange={e => set("data_registro", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data Homologação</Label>
              <Input type="date" value={form.data_homologacao} onChange={e => set("data_homologacao", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} rows={3} placeholder="Notas sobre o contrato..." />
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
