import { useState } from "react";
import {
  useEquipes, useUsuarios, useEquipeMembros,
  useCreateEquipe, useUpdateEquipe, useDeleteEquipe,
  useAddEquipeMembro, useUpdateEquipeMembro, useRemoveEquipeMembro,
  EquipeDB,
} from "@/hooks/useEquipes";
import { EQUIPE_TIPO_LABELS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Users, MoreHorizontal, Pencil, Trash2, UserPlus, X, Scale } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const TIPO_OPTIONS = Object.entries(EQUIPE_TIPO_LABELS).map(([value, label]) => ({ value, label }));

export default function Equipes() {
  const { data: equipes = [], isLoading: loadingEquipes } = useEquipes();
  const { data: usuarios = [] } = useUsuarios();
  const { data: membros = [] } = useEquipeMembros();

  const createEquipe = useCreateEquipe();
  const updateEquipe = useUpdateEquipe();
  const deleteEquipe = useDeleteEquipe();
  const addMembro = useAddEquipeMembro();
  const updateMembro = useUpdateEquipeMembro();
  const removeMembro = useRemoveEquipeMembro();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<EquipeDB | null>(null);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("analise_rpv");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [membrosSheetEquipe, setMembrosSheetEquipe] = useState<EquipeDB | null>(null);

  const openCreate = () => {
    setEditingEquipe(null);
    setNome("");
    setTipo("analise_rpv");
    setSheetOpen(true);
  };

  const openEdit = (eq: EquipeDB) => {
    setEditingEquipe(eq);
    setNome(eq.nome);
    setTipo(eq.tipo);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) { toast.error("Informe o nome da equipe"); return; }
    try {
      if (editingEquipe) {
        await updateEquipe.mutateAsync({ id: editingEquipe.id, updates: { nome: nome.trim(), tipo } });
        toast.success("Equipe atualizada");
      } else {
        await createEquipe.mutateAsync({ nome: nome.trim(), tipo });
        toast.success("Equipe criada");
      }
      setSheetOpen(false);
    } catch {
      toast.error("Erro ao salvar equipe");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEquipe.mutateAsync(deleteId);
      toast.success("Equipe excluída");
    } catch {
      toast.error("Erro ao excluir equipe");
    }
    setDeleteId(null);
  };

  const handleToggleAtiva = async (eq: EquipeDB) => {
    try {
      await updateEquipe.mutateAsync({ id: eq.id, updates: { ativa: !eq.ativa } });
      toast.success(eq.ativa ? "Equipe desativada" : "Equipe ativada");
    } catch {
      toast.error("Erro ao atualizar equipe");
    }
  };

  const handleAddMembro = async (equipeId: string, usuarioId: string) => {
    try {
      await addMembro.mutateAsync({ equipe_id: equipeId, usuario_id: usuarioId });
      toast.success("Membro adicionado");
    } catch {
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleRemoveMembro = async (membroId: string) => {
    try {
      await removeMembro.mutateAsync(membroId);
      toast.success("Membro removido");
    } catch {
      toast.error("Erro ao remover membro");
    }
  };

  const handleUpdatePeso = async (membroId: string, peso: number) => {
    try {
      await updateMembro.mutateAsync({ id: membroId, peso });
    } catch {
      toast.error("Erro ao atualizar peso");
    }
  };

  if (loadingEquipes) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Equipes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configuração de equipes e roteamento de processos
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />Nova Equipe
        </Button>
      </div>

      {equipes.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma equipe cadastrada.</p>
          <Button variant="link" onClick={openCreate} className="mt-2">Criar primeira equipe</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipes.map((eq) => {
            const equipeMembroIds = membros.filter((m) => m.equipe_id === eq.id);
            const equipeUsuarios = equipeMembroIds.map((m) => ({
              ...usuarios.find((u) => u.id === m.usuario_id),
              membroId: m.id,
              peso: m.peso,
            })).filter((u) => u.id);

            return (
              <Card
                key={eq.id}
                className={`glass-card hover:border-accent/30 transition-colors flex flex-col ${!eq.ativa ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{eq.nome}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant={eq.ativa ? "default" : "secondary"}>
                        {eq.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(eq)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMembrosSheetEquipe(eq)}>
                            <UserPlus className="w-3.5 h-3.5 mr-2" /> Gerenciar Membros
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAtiva(eq)}>
                            <Switch className="mr-2 scale-75" checked={eq.ativa} />
                            {eq.ativa ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(eq.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription>
                    {EQUIPE_TIPO_LABELS[eq.tipo as keyof typeof EQUIPE_TIPO_LABELS] ?? eq.tipo}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {equipeUsuarios.length} membro{equipeUsuarios.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex-1">
                    {equipeUsuarios.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Nenhum membro adicionado</p>
                    ) : (
                      <div className="space-y-1.5">
                        {equipeUsuarios.slice(0, 3).map((m) => (
                          <div key={m.membroId} className="flex items-center gap-2 h-7">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                              {m.nome?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="text-xs truncate">{m.nome}</span>
                            <div className="flex items-center gap-1 ml-auto shrink-0">
                              <Scale className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground font-mono">{m.peso}</span>
                            </div>
                          </div>
                        ))}
                        {equipeUsuarios.length > 3 && (
                          <p className="text-[11px] text-muted-foreground pl-8">
                            +{equipeUsuarios.length - 3} membro{equipeUsuarios.length - 3 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                    onClick={() => setMembrosSheetEquipe(eq)}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Gerenciar Membros
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sheet: Create/Edit Equipe */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingEquipe ? "Editar Equipe" : "Nova Equipe"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Nome</p>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da equipe"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Tipo</p>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={createEquipe.isPending || updateEquipe.isPending}>
              {(createEquipe.isPending || updateEquipe.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sheet: Manage Members */}
      <Sheet open={!!membrosSheetEquipe} onOpenChange={(o) => { if (!o) setMembrosSheetEquipe(null); }}>
        <SheetContent className="sm:max-w-lg">
          {membrosSheetEquipe && (
            <MembrosManager
              equipe={membrosSheetEquipe}
              membros={membros.filter((m) => m.equipe_id === membrosSheetEquipe.id)}
              usuarios={usuarios.filter((u) => u.ativo)}
              onAdd={(uid) => handleAddMembro(membrosSheetEquipe.id, uid)}
              onRemove={handleRemoveMembro}
              onUpdatePeso={handleUpdatePeso}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os membros serão desvinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Members Manager Sub-component ---

function MembrosManager({
  equipe,
  membros,
  usuarios,
  onAdd,
  onRemove,
  onUpdatePeso,
}: {
  equipe: EquipeDB;
  membros: { id: string; usuario_id: string; peso: number }[];
  usuarios: { id: string; nome: string; cargo: string }[];
  onAdd: (uid: string) => void;
  onRemove: (membroId: string) => void;
  onUpdatePeso: (membroId: string, peso: number) => void;
}) {
  const membroIds = new Set(membros.map((m) => m.usuario_id));
  const available = usuarios.filter((u) => !membroIds.has(u.id));

  return (
    <>
      <SheetHeader>
        <SheetTitle>Membros — {equipe.nome}</SheetTitle>
      </SheetHeader>
      <div className="space-y-5 py-4">
        {/* Current members */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">
            Membros atuais ({membros.length})
          </p>
          {membros.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-4 text-center">Nenhum membro nesta equipe</p>
          ) : (
            <div className="space-y-1">
              {membros.map((m) => {
                const user = usuarios.find((u) => u.id === m.usuario_id);
                if (!user) return null;
                return (
                  <MembroRow
                    key={m.id}
                    membroId={m.id}
                    nome={user.nome}
                    cargo={user.cargo}
                    peso={m.peso}
                    onUpdatePeso={onUpdatePeso}
                    onRemove={onRemove}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Add members */}
        {available.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Adicionar membro</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {available.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 h-11 px-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onAdd(u.id)}
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                    {u.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{u.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{u.cargo}</p>
                  </div>
                  <UserPlus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// --- Individual member row with local peso state ---

function MembroRow({
  membroId,
  nome,
  cargo,
  peso,
  onUpdatePeso,
  onRemove,
}: {
  membroId: string;
  nome: string;
  cargo: string;
  peso: number;
  onUpdatePeso: (membroId: string, peso: number) => void;
  onRemove: (membroId: string) => void;
}) {
  const [localPeso, setLocalPeso] = useState(String(peso));

  const handleBlur = () => {
    const parsed = Number(localPeso) || 0;
    if (parsed !== peso) {
      onUpdatePeso(membroId, parsed);
    }
  };

  return (
    <div className="flex items-center gap-3 h-11 px-3 rounded-lg hover:bg-muted/30 transition-colors group">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
        {nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{nome}</p>
        <p className="text-[10px] text-muted-foreground">{cargo}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3 h-3 text-muted-foreground" />
          <input
            type="number"
            value={localPeso}
            onChange={(e) => setLocalPeso(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            className="w-14 h-7 text-xs text-center bg-transparent outline-none rounded border border-transparent hover:border-border/60 focus:border-input focus:ring-1 focus:ring-ring transition-colors font-mono"
            min={0}
            max={1000}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => onRemove(membroId)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
