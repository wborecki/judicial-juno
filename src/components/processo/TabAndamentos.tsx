import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useProcessoAndamentos, useCreateProcessoAndamento, useDeleteProcessoAndamento } from "@/hooks/useProcessoAndamentos";

const TIPO_ANDAMENTO_LABELS: Record<string, string> = {
  despacho: "Despacho",
  decisao: "Decisão",
  sentenca: "Sentença",
  intimacao: "Intimação",
  peticao: "Petição",
  outros: "Outros",
};

const TIPO_ANDAMENTO_COLORS: Record<string, string> = {
  despacho: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  decisao: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  sentenca: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  intimacao: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  peticao: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  outros: "bg-muted text-muted-foreground border-border",
};

interface Props {
  processoId: string;
}

export default function TabAndamentos({ processoId }: Props) {
  const { data: andamentos = [], isLoading } = useProcessoAndamentos(processoId);
  const createAndamento = useCreateProcessoAndamento();
  const deleteAndamento = useDeleteProcessoAndamento();

  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("outros");
  const [dataAndamento, setDataAndamento] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = async () => {
    if (!titulo.trim()) return toast.error("Título é obrigatório");
    try {
      await createAndamento.mutateAsync({
        processo_id: processoId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        tipo,
        data_andamento: new Date(dataAndamento).toISOString(),
        criado_por: null,
      });
      toast.success("Andamento adicionado");
      setTitulo(""); setDescricao(""); setTipo("outros"); setShowForm(false);
    } catch {
      toast.error("Erro ao adicionar andamento");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAndamento.mutateAsync({ id, processoId });
      toast.success("Andamento removido");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-3">
      {showForm ? (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Novo Andamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" className="h-8 text-xs" value={dataAndamento} onChange={e => setDataAndamento(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_ANDAMENTO_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Título</Label>
                <Input className="h-8 text-xs" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Despacho de citação" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Descrição (opcional)</Label>
              <Textarea className="text-xs resize-none h-16" value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={createAndamento.isPending} className="text-xs">Adicionar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />Novo Andamento
        </Button>
      )}

      {/* Timeline */}
      {andamentos.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhum andamento registrado</p>
      )}

      <div className="relative space-y-0">
        {andamentos.map((a, i) => (
          <div key={a.id} className="flex gap-3 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shrink-0 mt-1.5" />
              {i < andamentos.length - 1 && <div className="w-px flex-1 bg-border" />}
            </div>
            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] ${TIPO_ANDAMENTO_COLORS[a.tipo] ?? TIPO_ANDAMENTO_COLORS.outros}`}>
                      {TIPO_ANDAMENTO_LABELS[a.tipo] ?? a.tipo}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatDate(a.data_andamento)}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1">{a.titulo}</p>
                  {a.descricao && <p className="text-xs text-muted-foreground mt-0.5">{a.descricao}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
