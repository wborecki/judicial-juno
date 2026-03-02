import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateAgendaEvento, useUpdateAgendaEvento, useDeleteAgendaEvento, type AgendaEvento } from "@/hooks/useAgendaEventos";
import { useUsuarios } from "@/hooks/useEquipes";
import { useProcessos } from "@/hooks/useProcessos";
import { useNegocios } from "@/hooks/useNegocios";
import { usePessoas } from "@/hooks/usePessoas";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

const TIPO_OPTIONS = [
  { value: "tarefa", label: "Tarefa Interna" },
  { value: "reuniao", label: "Reunião com Cliente" },
  { value: "audiencia", label: "Audiência Judicial" },
  { value: "prazo", label: "Prazo Processual" },
];

const PRIORIDADE_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const COR_OPTIONS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento?: AgendaEvento | null;
  defaultDate?: Date;
}

export function EventoSheet({ open, onOpenChange, evento, defaultDate }: Props) {
  const create = useCreateAgendaEvento();
  const update = useUpdateAgendaEvento();
  const del = useDeleteAgendaEvento();
  const { data: usuarios } = useUsuarios();
  const { data: processos } = useProcessos();
  const { data: negocios } = useNegocios();
  const { data: pessoas } = usePessoas();

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "tarefa",
    data_inicio: "",
    data_fim: "",
    dia_inteiro: false,
    local: "",
    cor: "#3b82f6",
    prioridade: "media",
    status: "pendente",
    processo_id: "",
    negocio_id: "",
    pessoa_id: "",
    responsavel_id: "",
  });

  useEffect(() => {
    if (evento) {
      setForm({
        titulo: evento.titulo,
        descricao: evento.descricao ?? "",
        tipo: evento.tipo,
        data_inicio: evento.data_inicio ? format(new Date(evento.data_inicio), "yyyy-MM-dd'T'HH:mm") : "",
        data_fim: evento.data_fim ? format(new Date(evento.data_fim), "yyyy-MM-dd'T'HH:mm") : "",
        dia_inteiro: evento.dia_inteiro,
        local: evento.local ?? "",
        cor: evento.cor ?? "#3b82f6",
        prioridade: evento.prioridade,
        status: evento.status,
        processo_id: evento.processo_id ?? "",
        negocio_id: evento.negocio_id ?? "",
        pessoa_id: evento.pessoa_id ?? "",
        responsavel_id: evento.responsavel_id ?? "",
      });
    } else {
      const d = defaultDate ?? new Date();
      setForm({
        titulo: "",
        descricao: "",
        tipo: "tarefa",
        data_inicio: format(d, "yyyy-MM-dd'T'HH:mm"),
        data_fim: "",
        dia_inteiro: false,
        local: "",
        cor: "#3b82f6",
        prioridade: "media",
        status: "pendente",
        processo_id: "",
        negocio_id: "",
        pessoa_id: "",
        responsavel_id: "",
      });
    }
  }, [evento, defaultDate, open]);

  const handleSave = async () => {
    if (!form.titulo || !form.data_inicio) {
      toast.error("Título e data de início são obrigatórios");
      return;
    }
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || null,
        tipo: form.tipo,
        data_inicio: new Date(form.data_inicio).toISOString(),
        data_fim: form.data_fim ? new Date(form.data_fim).toISOString() : null,
        dia_inteiro: form.dia_inteiro,
        local: form.local || null,
        cor: form.cor,
        prioridade: form.prioridade,
        status: form.status,
        processo_id: form.processo_id || null,
        negocio_id: form.negocio_id || null,
        pessoa_id: form.pessoa_id || null,
        responsavel_id: form.responsavel_id || null,
        criado_por: null,
      };
      if (evento) {
        await update.mutateAsync({ id: evento.id, ...payload });
        toast.success("Evento atualizado");
      } else {
        await create.mutateAsync(payload);
        toast.success("Evento criado");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar evento");
    }
  };

  const handleDelete = async () => {
    if (!evento) return;
    try {
      await del.mutateAsync(evento.id);
      toast.success("Evento excluído");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{evento ? "Editar Evento" : "Novo Evento"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div>
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Título do evento" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORIDADE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.dia_inteiro} onCheckedChange={(v) => set("dia_inteiro", v)} />
            <Label>Dia inteiro</Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Início *</Label>
              <Input type={form.dia_inteiro ? "date" : "datetime-local"} value={form.dia_inteiro ? form.data_inicio.split("T")[0] : form.data_inicio} onChange={(e) => set("data_inicio", e.target.value)} />
            </div>
            <div>
              <Label>Fim</Label>
              <Input type={form.dia_inteiro ? "date" : "datetime-local"} value={form.dia_inteiro ? (form.data_fim?.split("T")[0] ?? "") : form.data_fim} onChange={(e) => set("data_fim", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Local</Label>
            <Input value={form.local} onChange={(e) => set("local", e.target.value)} placeholder="Local ou link da reunião" />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={3} placeholder="Detalhes do evento" />
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex gap-2 mt-1">
              {COR_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${form.cor === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => set("cor", c)}
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vinculações</p>

            <div>
              <Label>Responsável</Label>
              <Select value={form.responsavel_id} onValueChange={(v) => set("responsavel_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {(usuarios ?? []).filter((u) => u.ativo).map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Processo</Label>
              <Select value={form.processo_id} onValueChange={(v) => set("processo_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {(processos ?? []).slice(0, 50).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.numero_processo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Negócio</Label>
              <Select value={form.negocio_id} onValueChange={(v) => set("negocio_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {(negocios ?? []).slice(0, 50).map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.titulo || n.id.slice(0, 8)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pessoa</Label>
              <Select value={form.pessoa_id} onValueChange={(v) => set("pessoa_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {(pessoas ?? []).slice(0, 50).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {evento && (
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={create.isPending || update.isPending}>
              {evento ? "Salvar alterações" : "Criar evento"}
            </Button>
            {evento && (
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={del.isPending}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
