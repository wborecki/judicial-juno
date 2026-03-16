import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Phone, Mail, MessageCircle, Plus, User, MapPin, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useContatos, useCreateContato, useDeleteContato } from "@/hooks/useContatos";
import { PessoaDB, useCreatePessoa, useUpdatePessoa, useDeletePessoa } from "@/hooks/usePessoas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Phone, Mail, MessageCircle, Plus, User, MapPin, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useContatos, useCreateContato, useDeleteContato } from "@/hooks/useContatos";
import { PessoaDB, useCreatePessoa, useUpdatePessoa, useDeletePessoa } from "@/hooks/usePessoas";

const TIPO_OPTIONS = [
  { value: "autor", label: "Autor" },
  { value: "reu", label: "Réu" },
  { value: "advogado", label: "Advogado" },
  { value: "terceiro", label: "Terceiro" },
];

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoa?: PessoaDB | null;
  mode?: "create" | "edit";
}

export default function PessoaSheet({ open, onOpenChange, pessoa, mode = "edit" }: Props) {
  const isCreate = mode === "create" || !pessoa;

  // Form state
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("autor");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Contatos
  const { data: contatos = [] } = useContatos(pessoa?.id);
  const createContato = useCreateContato();
  const deleteContato = useDeleteContato();
  const [showAddContato, setShowAddContato] = useState(false);
  const [contatoTipo, setContatoTipo] = useState("telefone");
  const [contatoValor, setContatoValor] = useState("");

  const createPessoa = useCreatePessoa();
  const updatePessoa = useUpdatePessoa();
  const deletePessoa = useDeletePessoa();

  // Sync form state when pessoa changes
  useEffect(() => {
    if (pessoa) {
      setNome(pessoa.nome);
      setCpfCnpj(pessoa.cpf_cnpj);
      setEmail(pessoa.email ?? "");
      setTelefone(pessoa.telefone ?? "");
      setTipo(pessoa.tipo);
      setEndereco(pessoa.endereco ?? "");
      setCidade(pessoa.cidade ?? "");
      setUf(pessoa.uf ?? "");
    } else {
      setNome("");
      setCpfCnpj("");
      setEmail("");
      setTelefone("");
      setTipo("autor");
      setEndereco("");
      setCidade("");
      setUf("");
    }
    setShowAddContato(false);
    setDeleteOpen(false);
  }, [pessoa, open]);

  const handleSave = async () => {
    if (!nome.trim() || !cpfCnpj.trim()) {
      toast.error("Nome e CPF/CNPJ são obrigatórios");
      return;
    }

    const payload = {
      nome: nome.trim(),
      cpf_cnpj: cpfCnpj.trim(),
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      tipo,
      endereco: endereco.trim() || null,
      cidade: cidade.trim() || null,
      uf: uf || null,
    };

    try {
      if (isCreate) {
        await createPessoa.mutateAsync(payload);
        toast.success("Pessoa cadastrada");
      } else {
        await updatePessoa.mutateAsync({ id: pessoa!.id, updates: payload });
        toast.success("Pessoa atualizada");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar pessoa");
    }
  };

  const handleDelete = async () => {
    if (!pessoa) return;
    try {
      await deletePessoa.mutateAsync(pessoa.id);
      toast.success("Pessoa excluída");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao excluir pessoa");
    }
    setDeleteOpen(false);
  };

  const handleAddContato = async () => {
    if (!pessoa || !contatoValor.trim()) return toast.error("Preencha o contato");
    try {
      await createContato.mutateAsync({
        pessoa_id: pessoa.id,
        tipo: contatoTipo,
        valor: contatoValor.trim(),
        principal: contatos.length === 0,
        observacoes: null,
      });
      toast.success("Contato adicionado");
      setContatoValor("");
      setShowAddContato(false);
    } catch {
      toast.error("Erro ao adicionar contato");
    }
  };

  const handleRemoveContato = async (contatoId: string) => {
    if (!pessoa) return;
    try {
      await deleteContato.mutateAsync({ id: contatoId, pessoaId: pessoa.id });
      toast.success("Contato removido");
    } catch {
      toast.error("Erro ao remover contato");
    }
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    const num = clean.startsWith("55") ? clean : `55${clean}`;
    window.open(`https://wa.me/${num}`, "_blank");
  };

  const isSaving = createPessoa.isPending || updatePessoa.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              {isCreate ? "Nova Pessoa" : nome || "Editar Pessoa"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-4">
            {/* Dados básicos */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground">Dados Básicos</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">Nome *</Label>
                  <Input className="h-9 text-sm" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">CPF/CNPJ *</Label>
                    <Input className="h-9 text-sm font-mono" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Tipo</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPO_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">E-mail</Label>
                    <Input className="h-9 text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Telefone</Label>
                    <Input className="h-9 text-sm" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Endereço
              </p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">Endereço</Label>
                  <Input className="h-9 text-sm" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, complemento" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Cidade</Label>
                    <Input className="h-9 text-sm" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">UF</Label>
                    <Select value={uf || "__none__"} onValueChange={v => setUf(v === "__none__" ? "" : v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {UF_OPTIONS.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contatos - only in edit mode */}
            {!isCreate && pessoa && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Contatos ({contatos.length})</p>
                    <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => setShowAddContato(true)}>
                      <Plus className="w-3 h-3" />Adicionar
                    </Button>
                  </div>

                  {contatos.length === 0 && !showAddContato && (
                    <p className="text-xs text-muted-foreground italic py-2 text-center">Nenhum contato cadastrado</p>
                  )}

                  <div className="space-y-1.5">
                    {contatos.map(c => {
                      const TipoIcon = c.tipo === "email" ? Mail : c.tipo === "whatsapp" ? MessageCircle : Phone;
                      return (
                        <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30 group">
                          <div className="flex items-center gap-2 text-xs min-w-0">
                            <TipoIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{c.valor}</span>
                            {c.principal && <Badge variant="secondary" className="text-[8px]">Principal</Badge>}
                          </div>
                          <div className="flex gap-0.5 shrink-0">
                            {(c.tipo === "telefone" || c.tipo === "whatsapp") && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openWhatsApp(c.valor)}>
                                <MessageCircle className="w-3 h-3 text-green-600" />
                              </Button>
                            )}
                            {c.tipo === "email" && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(`mailto:${c.valor}`, "_blank")}>
                                <Mail className="w-3 h-3 text-primary" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                              onClick={() => handleRemoveContato(c.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {showAddContato && (
                    <div className="p-2.5 rounded-lg border border-border/40 bg-muted/20 space-y-2">
                      <div className="flex gap-2">
                        <Select value={contatoTipo} onValueChange={setContatoTipo}>
                          <SelectTrigger className="h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="telefone">Telefone</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input className="h-8 text-xs flex-1" value={contatoValor} onChange={e => setContatoValor(e.target.value)} placeholder="Valor..." />
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" className="text-xs h-7" onClick={handleAddContato} disabled={createContato.isPending}>Salvar</Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setShowAddContato(false); setContatoValor(""); }}>Cancelar</Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sticky footer */}
          <SheetFooter className="border-t pt-4 mt-auto gap-2">
            {!isCreate && (
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive mr-auto gap-1.5" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="w-3.5 h-3.5" />Excluir
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : isCreate ? "Cadastrar" : "Salvar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pessoa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os contatos vinculados serão excluídos.
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
    </>
  );
}
