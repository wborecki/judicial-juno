import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageCircle, Plus, User, MapPin, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useContatos, useCreateContato, ContatoDB } from "@/hooks/useContatos";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PessoaData {
  id: string;
  nome: string;
  cpf_cnpj: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  tipo: string;
}

function usePessoaById(id?: string | null) {
  return useQuery({
    queryKey: ["pessoa", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("pessoas").select("*").eq("id", id).single();
      if (error) return null;
      return data as PessoaData;
    },
    enabled: !!id,
  });
}

function usePessoaByCpf(cpf?: string | null) {
  return useQuery({
    queryKey: ["pessoa-cpf", cpf],
    queryFn: async () => {
      if (!cpf) return null;
      const { data, error } = await supabase.from("pessoas").select("*").eq("cpf_cnpj", cpf).maybeSingle();
      if (error) return null;
      return data as PessoaData | null;
    },
    enabled: !!cpf,
  });
}

function useCreatePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pessoa: Omit<PessoaData, "id">) => {
      const { data, error } = await supabase.from("pessoas").insert(pessoa).select().single();
      if (error) throw error;
      return data as PessoaData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pessoas"] });
    },
  });
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Pass either pessoa_id or fallback name/cpf
  pessoaId?: string | null;
  nome?: string;
  cpfCnpj?: string | null;
}

export default function PessoaSheet({ open, onOpenChange, pessoaId, nome, cpfCnpj }: Props) {
  const { data: pessoaById } = usePessoaById(pessoaId);
  const { data: pessoaByCpf } = usePessoaByCpf(!pessoaId ? cpfCnpj : null);
  const pessoa = pessoaById ?? pessoaByCpf;

  const { data: contatos = [] } = useContatos(pessoa?.id);
  const createContato = useCreateContato();
  const createPessoa = useCreatePessoa();

  const [showAddContato, setShowAddContato] = useState(false);
  const [contatoTipo, setContatoTipo] = useState("telefone");
  const [contatoValor, setContatoValor] = useState("");

  // Registration form
  const [showRegister, setShowRegister] = useState(false);
  const [regNome, setRegNome] = useState(nome ?? "");
  const [regCpf, setRegCpf] = useState(cpfCnpj ?? "");
  const [regEmail, setRegEmail] = useState("");
  const [regTelefone, setRegTelefone] = useState("");
  const [regTipo, setRegTipo] = useState("autor");

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
      toast.error("Erro ao adicionar");
    }
  };

  const handleRegister = async () => {
    if (!regNome.trim() || !regCpf.trim()) return toast.error("Nome e CPF/CNPJ são obrigatórios");
    try {
      await createPessoa.mutateAsync({
        nome: regNome.trim(),
        cpf_cnpj: regCpf.trim(),
        email: regEmail.trim() || null,
        telefone: regTelefone.trim() || null,
        endereco: null,
        cidade: null,
        uf: null,
        tipo: regTipo,
      });
      toast.success("Pessoa cadastrada!");
      setShowRegister(false);
    } catch {
      toast.error("Erro ao cadastrar");
    }
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    const num = clean.startsWith("55") ? clean : `55${clean}`;
    window.open(`https://wa.me/${num}`, "_blank");
  };

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const displayName = pessoa?.nome ?? nome ?? "Pessoa";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            {displayName}
          </SheetTitle>
        </SheetHeader>

        {pessoa ? (
          <div className="space-y-4">
            {/* Person details */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">CPF/CNPJ</p>
                  <p className="font-medium">{pessoa.cpf_cnpj}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p className="font-medium capitalize">{pessoa.tipo}</p>
                </div>
                {pessoa.email && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">E-mail</p>
                    <p className="font-medium">{pessoa.email}</p>
                  </div>
                )}
                {pessoa.telefone && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Telefone</p>
                    <p className="font-medium">{pessoa.telefone}</p>
                  </div>
                )}
                {(pessoa.cidade || pessoa.uf) && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Localização</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {[pessoa.cidade, pessoa.uf].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                )}
                {pessoa.endereco && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Endereço</p>
                    <p className="font-medium">{pessoa.endereco}</p>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                {pessoa.telefone && (
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 flex-1" onClick={() => openWhatsApp(pessoa.telefone!)}>
                    <MessageCircle className="w-3.5 h-3.5 text-green-600" />WhatsApp
                  </Button>
                )}
                {pessoa.email && (
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 flex-1" onClick={() => openEmail(pessoa.email!)}>
                    <Mail className="w-3.5 h-3.5 text-primary" />E-mail
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Contatos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contatos</h4>
                <Button variant="ghost" size="sm" className="text-xs h-6 gap-1" onClick={() => setShowAddContato(true)}>
                  <Plus className="w-3 h-3" />Adicionar
                </Button>
              </div>

              {contatos.length === 0 && !showAddContato && (
                <p className="text-[10px] text-muted-foreground">Nenhum contato cadastrado</p>
              )}

              <div className="space-y-1.5">
                {contatos.map(c => (
                  <ContatoRow key={c.id} contato={c} onWhatsApp={openWhatsApp} onEmail={openEmail} />
                ))}
              </div>

              {showAddContato && (
                <div className="mt-2 p-2.5 rounded-lg border border-border/40 bg-muted/20 space-y-2">
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
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setShowAddContato(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Person not found - show register form */
          <div className="space-y-4">
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <p className="text-xs text-warning font-medium">Pessoa não cadastrada no sistema</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {nome && <span className="font-medium">{nome}</span>}
                {cpfCnpj && <span> • {cpfCnpj}</span>}
              </p>
            </div>

            {!showRegister ? (
              <Button size="sm" className="w-full text-xs gap-1.5" onClick={() => { setRegNome(nome ?? ""); setRegCpf(cpfCnpj ?? ""); setShowRegister(true); }}>
                <Plus className="w-3.5 h-3.5" />Cadastrar Pessoa
              </Button>
            ) : (
              <div className="space-y-3 p-3 border border-border/40 rounded-lg">
                <h4 className="text-xs font-semibold">Cadastrar Pessoa</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Nome *</Label>
                    <Input className="h-8 text-xs" value={regNome} onChange={e => setRegNome(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">CPF/CNPJ *</Label>
                    <Input className="h-8 text-xs" value={regCpf} onChange={e => setRegCpf(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">E-mail</Label>
                      <Input className="h-8 text-xs" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Telefone</Label>
                      <Input className="h-8 text-xs" value={regTelefone} onChange={e => setRegTelefone(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Tipo</Label>
                    <Select value={regTipo} onValueChange={setRegTipo}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autor">Autor</SelectItem>
                        <SelectItem value="reu">Réu</SelectItem>
                        <SelectItem value="advogado">Advogado</SelectItem>
                        <SelectItem value="terceiro">Terceiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="text-xs" onClick={handleRegister} disabled={createPessoa.isPending}>Cadastrar</Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowRegister(false)}>Cancelar</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ContatoRow({ contato, onWhatsApp, onEmail }: { contato: ContatoDB; onWhatsApp: (p: string) => void; onEmail: (e: string) => void }) {
  const tipoIcon = contato.tipo === "email" ? Mail : contato.tipo === "whatsapp" ? MessageCircle : Phone;
  const TipoIcon = tipoIcon;

  return (
    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/30 border border-border/30">
      <div className="flex items-center gap-2 text-xs min-w-0">
        <TipoIcon className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="font-medium truncate">{contato.valor}</span>
        {contato.principal && <Badge variant="secondary" className="text-[8px]">Principal</Badge>}
      </div>
      <div className="flex gap-0.5 shrink-0">
        {(contato.tipo === "telefone" || contato.tipo === "whatsapp") && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onWhatsApp(contato.valor)}>
            <MessageCircle className="w-3 h-3 text-green-600" />
          </Button>
        )}
        {contato.tipo === "email" && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEmail(contato.valor)}>
            <Mail className="w-3 h-3 text-primary" />
          </Button>
        )}
      </div>
    </div>
  );
}
