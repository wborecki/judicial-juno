import { useState } from "react";
import { useNegocioAtividades, useCreateNegocioAtividade } from "@/hooks/useNegocioAtividades";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Users, StickyNote, CheckSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { toast } from "sonner";
import { format } from "date-fns";

const TIPO_OPTIONS = [
  { value: "nota", label: "Nota", icon: StickyNote },
  { value: "ligacao", label: "Ligação", icon: Phone },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "reuniao", label: "Reunião", icon: Users },
  { value: "tarefa", label: "Tarefa", icon: CheckSquare },
];

const TIPO_COLORS: Record<string, string> = {
  nota: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ligacao: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  email: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  reuniao: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  tarefa: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

interface Props {
  negocioId: string;
}

export default function TabAtividades({ negocioId }: Props) {
  const { data: atividades = [], isLoading } = useNegocioAtividades(negocioId);
  const createAtividade = useCreateNegocioAtividade();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tipo, setTipo] = useState("nota");
  const [descricao, setDescricao] = useState("");

  const handleCreate = () => {
    if (!descricao.trim()) { toast.error("Informe a descrição"); return; }
    createAtividade.mutate(
      { negocio_id: negocioId, tipo, descricao },
      {
        onSuccess: () => {
          toast.success("Atividade registrada");
          setDescricao("");
          setTipo("nota");
          setSheetOpen(false);
        },
        onError: () => toast.error("Erro ao registrar atividade"),
      }
    );
  };

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{atividades.length} atividade(s)</p>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nova Atividade
        </Button>
      </div>

      {atividades.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhuma atividade registrada.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border/60" />
          <div className="space-y-0">
            {atividades.map((a) => {
              const tipoOpt = TIPO_OPTIONS.find((t) => t.value === a.tipo);
              const Icon = tipoOpt?.icon ?? StickyNote;
              return (
                <div key={a.id} className="relative pb-1 last:pb-0 group">
                  <div className="absolute -left-6 top-3 w-[10px] h-[10px] rounded-full border-2 border-card bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                  <div className="py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge className={`text-[9px] shrink-0 rounded-full px-2 py-0 ${TIPO_COLORS[a.tipo] ?? ""}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {tipoOpt?.label ?? a.tipo}
                        </Badge>
                        <span className="text-xs text-foreground">{a.descricao}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {format(new Date(a.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>Nova Atividade</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Tipo</p>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Descrição</p>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Descreva a atividade..." />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
            <Button onClick={handleCreate} disabled={createAtividade.isPending}>
              {createAtividade.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
