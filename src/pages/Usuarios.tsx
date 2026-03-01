import { useState } from "react";
import { useUsuariosComRoles, useInviteUser, useUpdateUsuario, UsuarioComRole } from "@/hooks/useUsuarios";
import { useEquipes } from "@/hooks/useEquipes";
import { useUserRole } from "@/hooks/useEquipes";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Plus, MoreHorizontal, Pencil, ShieldCheck, UserX, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  analista: "Analista",
  usuario: "Usuário",
};
const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  analista: "secondary",
  usuario: "outline",
};

export default function UsuariosPage() {
  const { data: usuarios = [], isLoading } = useUsuariosComRoles();
  const { data: equipes = [] } = useEquipes();
  const { data: currentRole } = useUserRole();
  const inviteMut = useInviteUser();
  const updateMut = useUpdateUsuario();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UsuarioComRole | null>(null);

  // Invite form state
  const [invEmail, setInvEmail] = useState("");
  const [invNome, setInvNome] = useState("");
  const [invCargo, setInvCargo] = useState("");
  const [invRole, setInvRole] = useState("analista");
  const [invEquipe, setInvEquipe] = useState<string>("");

  // Edit form state
  const [editNome, setEditNome] = useState("");
  const [editCargo, setEditCargo] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEquipe, setEditEquipe] = useState<string>("");
  const [editAtivo, setEditAtivo] = useState(true);

  const isAdmin = currentRole === "admin";

  const resetInvite = () => {
    setInvEmail("");
    setInvNome("");
    setInvCargo("");
    setInvRole("analista");
    setInvEquipe("");
  };

  const handleInvite = async () => {
    if (!invEmail) return;
    try {
      await inviteMut.mutateAsync({
        email: invEmail,
        nome: invNome || invEmail,
        cargo: invCargo,
        role: invRole,
        equipe_id: invEquipe || null,
      });
      toast.success("Convite enviado com sucesso!");
      setInviteOpen(false);
      resetInvite();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar convite");
    }
  };

  const openEdit = (u: UsuarioComRole) => {
    setEditUser(u);
    setEditNome(u.nome);
    setEditCargo(u.cargo);
    setEditRole(u.role || "usuario");
    setEditEquipe(u.equipe_id || "");
    setEditAtivo(u.ativo);
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      await updateMut.mutateAsync({
        user_id: editUser.id,
        nome: editNome,
        cargo: editCargo,
        role: editRole,
        equipe_id: editEquipe || null,
        ativo: editAtivo,
      });
      toast.success("Usuário atualizado!");
      setEditUser(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  const toggleAtivo = async (u: UsuarioComRole) => {
    try {
      await updateMut.mutateAsync({ user_id: u.id, ativo: !u.ativo });
      toast.success(u.ativo ? "Usuário desativado" : "Usuário reativado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {usuarios.length} usuário{usuarios.length !== 1 && "s"} cadastrado{usuarios.length !== 1 && "s"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
        )}
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => {
                const equipe = equipes.find((e) => e.id === u.equipe_id);
                return (
                  <TableRow key={u.id} className={!u.ativo ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell className="text-xs">{u.cargo || "—"}</TableCell>
                    <TableCell className="text-xs">{equipe?.nome ?? "—"}</TableCell>
                    <TableCell>
                      {u.role ? (
                        <Badge variant={roleBadgeVariant[u.role] || "outline"}>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {roleLabels[u.role] || u.role}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem papel</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.ativo ? "default" : "secondary"}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAtivo(u)}>
                              {u.ativo ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Reativar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="usuario@empresa.com" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Nome completo" value={invNome} onChange={(e) => setInvNome(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input placeholder="Ex: Analista Jurídico" value={invCargo} onChange={(e) => setInvCargo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={invRole} onValueChange={setInvRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="usuario">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Equipe</Label>
              <Select value={invEquipe} onValueChange={setInvEquipe}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {equipes.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleInvite} disabled={inviteMut.isPending || !invEmail}>
              {inviteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input value={editCargo} onChange={(e) => setEditCargo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="usuario">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Equipe</Label>
              <Select value={editEquipe} onValueChange={setEditEquipe}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {equipes.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={editAtivo} onCheckedChange={setEditAtivo} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={updateMut.isPending}>
              {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
