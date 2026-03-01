import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProcessoPartes, useCreateProcessoParte, useDeleteProcessoParte } from "@/hooks/useProcessoPartes";

interface Props {
  processoId: string;
  parteAutoraLegacy: string;
  parteReLegacy: string;
}

export default function TabPartes({ processoId, parteAutoraLegacy, parteReLegacy }: Props) {
  const { data: partes = [], isLoading } = useProcessoPartes(processoId);
  const createParte = useCreateProcessoParte();
  const deleteParte = useDeleteProcessoParte();

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [tipo, setTipo] = useState("autor");

  const autores = partes.filter(p => p.tipo === "autor");
  const reus = partes.filter(p => p.tipo === "reu");

  const handleAdd = async () => {
    if (!nome.trim()) return toast.error("Nome é obrigatório");
    try {
      await createParte.mutateAsync({
        processo_id: processoId,
        nome: nome.trim(),
        cpf_cnpj: cpfCnpj.trim() || null,
        tipo,
        pessoa_id: null,
      });
      toast.success("Parte adicionada");
      setNome(""); setCpfCnpj(""); setShowForm(false);
    } catch {
      toast.error("Erro ao adicionar parte");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParte.mutateAsync({ id, processoId });
      toast.success("Parte removida");
    } catch {
      toast.error("Erro ao remover parte");
    }
  };

  return (
    <div className="space-y-3">
      {/* Legacy parties (from processos table) */}
      {partes.length === 0 && (
        <Card className="glass-card border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Partes originais (campos texto do processo)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Autor</p>
                  <p className="text-sm font-medium">{parteAutoraLegacy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Réu</p>
                  <p className="text-sm font-medium">{parteReLegacy}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Autores */}
      <Card className="glass-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Autores
            <Badge variant="secondary" className="text-[10px]">{autores.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          {autores.map(p => (
            <ParteRow key={p.id} nome={p.nome} cpfCnpj={p.cpf_cnpj} onDelete={() => handleDelete(p.id)} />
          ))}
          {autores.length === 0 && <p className="text-xs text-muted-foreground">Nenhum autor cadastrado</p>}
        </CardContent>
      </Card>

      {/* Réus */}
      <Card className="glass-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Réus
            <Badge variant="secondary" className="text-[10px]">{reus.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          {reus.map(p => (
            <ParteRow key={p.id} nome={p.nome} cpfCnpj={p.cpf_cnpj} onDelete={() => handleDelete(p.id)} />
          ))}
          {reus.length === 0 && <p className="text-xs text-muted-foreground">Nenhum réu cadastrado</p>}
        </CardContent>
      </Card>

      {/* Add form */}
      {showForm ? (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autor">Autor</SelectItem>
                    <SelectItem value="reu">Réu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input className="h-8 text-xs" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CPF/CNPJ</Label>
                <Input className="h-8 text-xs" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={createParte.isPending} className="text-xs">Adicionar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />Adicionar Parte
        </Button>
      )}
    </div>
  );
}

function ParteRow({ nome, cpfCnpj, onDelete }: { nome: string; cpfCnpj: string | null; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30">
      <div className="text-xs">
        <span className="font-medium">{nome}</span>
        {cpfCnpj && <span className="text-muted-foreground ml-2">({cpfCnpj})</span>}
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
        <Trash2 className="w-3 h-3 text-destructive" />
      </Button>
    </div>
  );
}
