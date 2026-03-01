import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  useConversas, useMensagens, useParticipantes, useRemetentes,
  useSendMessage, useCreateConversa, useUploadChatFile,
  useDeleteConversa, useToggleFixarConversa, useRenameConversa,
  useAddRemetente, useRemoveRemetente,
  ChatConversa, ChatMensagem
} from "@/hooks/useChat";
import { useProcessos } from "@/hooks/useProcessos";
import { useNegocios } from "@/hooks/useNegocios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Send, Paperclip, Search, Plus, Scale, Briefcase,
  FileText, File, X, Users, User, UserPlus, Pin, Trash2, MoreVertical,
  PinOff, Pencil, Megaphone, Settings2, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Chat() {
  const { user } = useAuth();
  const { data: conversas = [], isLoading: loadingConversas } = useConversas();
  const [activeConversaId, setActiveConversaId] = useState<string | null>(null);
  const [searchConversas, setSearchConversas] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const deleteConversa = useDeleteConversa();
  const toggleFixar = useToggleFixarConversa();

  useEffect(() => {
    if (!activeConversaId && conversas.length > 0) {
      setActiveConversaId(conversas[0].id);
    }
  }, [conversas, activeConversaId]);

  useEffect(() => {
    if (activeConversaId && !conversas.find(c => c.id === activeConversaId)) {
      setActiveConversaId(conversas[0]?.id ?? null);
    }
  }, [conversas, activeConversaId]);

  const activeConversa = conversas.find(c => c.id === activeConversaId);

  const filteredConversas = useMemo(() => {
    if (!searchConversas) return conversas;
    const q = searchConversas.toLowerCase();
    return conversas.filter(c => c.nome?.toLowerCase().includes(q) || c.tipo.includes(q));
  }, [conversas, searchConversas]);

  const pinnedConversas = filteredConversas.filter(c => c.fixado);
  const unpinnedConversas = filteredConversas.filter(c => !c.fixado);

  const handleDelete = async (c: ChatConversa) => {
    try {
      await deleteConversa.mutateAsync({ conversaId: c.id, userId: user?.id ?? "" });
      toast.success("Conversa arquivada");
      if (activeConversaId === c.id) setActiveConversaId(null);
    } catch {
      toast.error("Erro ao arquivar conversa");
    }
  };

  const handleTogglePin = async (c: ChatConversa) => {
    try {
      await toggleFixar.mutateAsync({ conversaId: c.id, fixado: c.fixado });
      toast.success(c.fixado ? "Conversa desafixada" : "Conversa fixada");
    } catch {
      toast.error("Erro ao fixar/desafixar");
    }
  };

  return (
    <div className="flex h-screen animate-fade-in">
      {/* Left panel */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/10 shrink-0">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Chat
            </h1>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setShowNewChat(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." value={searchConversas} onChange={e => setSearchConversas(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loadingConversas && <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>}
          {!loadingConversas && filteredConversas.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">Nenhuma conversa encontrada.</div>
          )}

          {pinnedConversas.length > 0 && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-4 pt-3 pb-1 flex items-center gap-1">
                <Pin className="w-3 h-3" /> Fixadas
              </p>
              {pinnedConversas.map(c => (
                <ConversaItem key={c.id} conversa={c} isActive={c.id === activeConversaId}
                  onClick={() => setActiveConversaId(c.id)} onDelete={() => handleDelete(c)}
                  onTogglePin={() => handleTogglePin(c)} onRename={() => { setActiveConversaId(c.id); setShowRename(true); }} />
              ))}
            </>
          )}

          {pinnedConversas.length > 0 && unpinnedConversas.length > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-4 pt-3 pb-1">Todas</p>
          )}
          {unpinnedConversas.map(c => (
            <ConversaItem key={c.id} conversa={c} isActive={c.id === activeConversaId}
              onClick={() => setActiveConversaId(c.id)} onDelete={() => handleDelete(c)}
              onTogglePin={() => handleTogglePin(c)} onRename={() => { setActiveConversaId(c.id); setShowRename(true); }} />
          ))}
        </ScrollArea>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversaId ? (
          <MessagePanel
            conversaId={activeConversaId}
            userId={user?.id ?? ""}
            conversa={activeConversa}
            onAddMembers={() => setShowAddMembers(true)}
            onRename={() => setShowRename(true)}
            onGroupSettings={() => setShowGroupSettings(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageSquare className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm">Selecione ou crie uma conversa</p>
            </div>
          </div>
        )}
      </div>

      <NewChatSheet open={showNewChat} onOpenChange={setShowNewChat} userId={user?.id ?? ""} onCreated={(id) => { setActiveConversaId(id); setShowNewChat(false); }} />

      {activeConversaId && (
        <>
          <AddMembersSheet open={showAddMembers} onOpenChange={setShowAddMembers} conversaId={activeConversaId} />
          <RenameDialog open={showRename} onOpenChange={setShowRename} conversa={activeConversa} />
          <GroupSettingsSheet open={showGroupSettings} onOpenChange={setShowGroupSettings} conversa={activeConversa} userId={user?.id ?? ""} />
        </>
      )}
    </div>
  );
}

function ConversaItem({ conversa, isActive, onClick, onDelete, onTogglePin, onRename }: {
  conversa: ChatConversa; isActive: boolean; onClick: () => void; onDelete: () => void; onTogglePin: () => void; onRename: () => void;
}) {
  const isInstitucional = conversa.institucional;
  return (
    <div className={cn(
      "group relative w-full text-left px-4 py-3 border-b border-border/30 transition-colors flex items-center gap-3 cursor-pointer",
      isActive ? "bg-accent/10" : "hover:bg-muted/30"
    )} onClick={onClick}>
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
        isInstitucional ? "bg-amber-500/10 text-amber-600" :
        conversa.tipo === "grupo" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"
      )}>
        {isInstitucional ? <Megaphone className="w-4 h-4" /> :
         conversa.tipo === "grupo" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{conversa.nome ?? "Conversa"}</p>
          {conversa.fixado && <Pin className="w-3 h-3 text-primary shrink-0" />}
          {isInstitucional && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-amber-500/30 text-amber-600">Institucional</Badge>}
        </div>
        {conversa.ultima_mensagem ? (
          <p className="text-[10px] text-muted-foreground truncate">{conversa.ultima_mensagem}</p>
        ) : (
          <p className="text-[10px] text-muted-foreground">
            {format(new Date(conversa.updated_at), "dd/MM HH:mm", { locale: ptBR })}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity shrink-0">
            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {conversa.tipo === "grupo" && (
            <DropdownMenuItem onClick={e => { e.stopPropagation(); onRename(); }}>
              <Pencil className="w-3.5 h-3.5 mr-2" />Renomear
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={e => { e.stopPropagation(); onTogglePin(); }}>
            {conversa.fixado ? <PinOff className="w-3.5 h-3.5 mr-2" /> : <Pin className="w-3.5 h-3.5 mr-2" />}
            {conversa.fixado ? "Desafixar" : "Fixar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={e => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="w-3.5 h-3.5 mr-2" />Arquivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function RenameDialog({ open, onOpenChange, conversa }: { open: boolean; onOpenChange: (v: boolean) => void; conversa?: ChatConversa }) {
  const [nome, setNome] = useState("");
  const renameConversa = useRenameConversa();

  useEffect(() => {
    if (open && conversa) setNome(conversa.nome ?? "");
  }, [open, conversa]);

  const handleSave = async () => {
    if (!conversa || !nome.trim()) return;
    try {
      await renameConversa.mutateAsync({ conversaId: conversa.id, nome: nome.trim() });
      toast.success("Grupo renomeado");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao renomear");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>Renomear Grupo</DialogTitle></DialogHeader>
        <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do grupo..." className="text-sm"
          onKeyDown={e => { if (e.key === "Enter") handleSave(); }} />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!nome.trim() || renameConversa.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MessagePanel({ conversaId, userId, conversa, onAddMembers, onRename, onGroupSettings }: {
  conversaId: string; userId: string; conversa?: ChatConversa; onAddMembers: () => void; onRename: () => void; onGroupSettings: () => void;
}) {
  const { data: mensagens = [], isLoading } = useMensagens(conversaId);
  const { data: participantes = [] } = useParticipantes(conversaId);
  const { data: remetentes = [] } = useRemetentes(conversaId);
  const sendMessage = useSendMessage();
  const uploadFile = useUploadChatFile();
  const { data: processos = [] } = useProcessos();
  const { data: negocios = [] } = useNegocios();

  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareSearch, setShareSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensagens]);

  // Check if current user can send in institutional group
  const isInstitucional = conversa?.institucional ?? false;
  const isCreator = conversa?.criado_por === userId;
  const isDesignatedSender = remetentes.some(r => r.user_id === userId);
  const canSend = !isInstitucional || isCreator || isDesignatedSender;

  const handleSend = async () => {
    if (!text.trim() || !canSend) return;
    const t = text.trim();
    setText("");
    await sendMessage.mutateAsync({ conversa_id: conversaId, sender_id: userId, conteudo: t, tipo: "texto" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile.mutateAsync(file);
      await sendMessage.mutateAsync({ conversa_id: conversaId, sender_id: userId, conteudo: result.name, tipo: "arquivo", arquivo_url: result.url, arquivo_nome: result.name });
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleShareProcesso = async (processoId: string, numero: string) => {
    await sendMessage.mutateAsync({ conversa_id: conversaId, sender_id: userId, conteudo: `📋 Processo: ${numero}`, tipo: "processo", referencia_id: processoId });
    setShowShareSheet(false);
  };

  const handleShareNegocio = async (negocioId: string, tipo: string | null) => {
    await sendMessage.mutateAsync({ conversa_id: conversaId, sender_id: userId, conteudo: `💼 Negócio: ${tipo ?? "Sem tipo"}`, tipo: "negocio", referencia_id: negocioId });
    setShowShareSheet(false);
  };

  const filteredProcessos = useMemo(() => {
    if (!shareSearch) return processos.slice(0, 10);
    const q = shareSearch.toLowerCase();
    return processos.filter(p => p.numero_processo.toLowerCase().includes(q) || p.parte_autora.toLowerCase().includes(q)).slice(0, 10);
  }, [processos, shareSearch]);

  const filteredNegocios = useMemo(() => negocios.slice(0, 5), [negocios]);
  const isGroup = conversa?.tipo === "grupo";

  return (
    <>
      <div className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{conversa?.nome ?? "Conversa"}</p>
          <Badge variant="secondary" className="text-[10px]">{participantes.length} participante{participantes.length !== 1 ? "s" : ""}</Badge>
          {isInstitucional && <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 gap-1"><Megaphone className="w-3 h-3" />Institucional</Badge>}
        </div>
        <div className="flex items-center gap-1">
          {isGroup && (
            <>
              {(isCreator || !isInstitucional) && (
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onAddMembers}>
                  <UserPlus className="w-3.5 h-3.5" />Adicionar
                </Button>
              )}
              {isCreator && isInstitucional && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onGroupSettings}>
                  <Settings2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-2/3" />)}</div>}
        {!isLoading && mensagens.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-xs">Nenhuma mensagem ainda. Comece a conversa!</div>
        )}
        {mensagens.map(msg => <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === userId} />)}
      </div>

      {canSend ? (
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Popover open={showAttach} onOpenChange={setShowAttach}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0"><Paperclip className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="start">
                <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2" onClick={() => { fileInputRef.current?.click(); setShowAttach(false); }}>
                  <File className="w-3.5 h-3.5" />Enviar Arquivo
                </button>
                <button className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2" onClick={() => { setShowShareSheet(true); setShowAttach(false); }}>
                  <Scale className="w-3.5 h-3.5" />Compartilhar Processo/Negócio
                </button>
              </PopoverContent>
            </Popover>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
            <Input placeholder="Digite uma mensagem..." value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 text-sm" />
            <Button size="sm" className="h-9 w-9 p-0 shrink-0" onClick={handleSend} disabled={!text.trim() || sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border p-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            Apenas remetentes autorizados podem enviar mensagens neste canal
          </p>
        </div>
      )}

      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="right" className="w-[400px] sm:w-[440px]">
          <SheetHeader><SheetTitle>Compartilhar</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <Input placeholder="Buscar processo..." value={shareSearch} onChange={e => setShareSearch(e.target.value)} className="h-9 text-xs" />
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 py-1.5">Processos</p>
                {filteredProcessos.map(p => (
                  <button key={p.id} onClick={() => handleShareProcesso(p.id, p.numero_processo)} className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-mono">{p.numero_processo}</span>
                    <span className="text-muted-foreground truncate">{p.parte_autora}</span>
                  </button>
                ))}
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 py-1.5 mt-3">Negócios</p>
                {filteredNegocios.map(n => (
                  <button key={n.id} onClick={() => handleShareNegocio(n.id, n.tipo_servico)} className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{n.tipo_servico ?? "Sem tipo"}</span>
                    <Badge variant="secondary" className="text-[9px]">{n.negocio_status}</Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function MessageBubble({ msg, isOwn }: { msg: ChatMensagem; isOwn: boolean }) {
  const isFile = msg.tipo === "arquivo";
  const isProcesso = msg.tipo === "processo";
  const isNegocio = msg.tipo === "negocio";
  const fileExt = msg.arquivo_nome?.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt ?? "");

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
        isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
      )}>
        {msg.tipo === "texto" && <p className="whitespace-pre-wrap break-words">{msg.conteudo}</p>}
        {isFile && (
          <a href={msg.arquivo_url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80">
            {isImage ? (
              <div className="space-y-1.5">
                <img src={msg.arquivo_url ?? ""} alt={msg.arquivo_nome ?? ""} className="rounded-lg max-w-[250px] max-h-[200px] object-cover" />
                <p className="text-[10px] opacity-70">{msg.arquivo_nome}</p>
              </div>
            ) : (
              <><FileText className="w-4 h-4 shrink-0" /><span className="underline text-xs">{msg.arquivo_nome ?? "Arquivo"}</span></>
            )}
          </a>
        )}
        {isProcesso && (
          <a href={`/processos/${msg.referencia_id}`} className="flex items-center gap-2 hover:opacity-80">
            <Scale className="w-4 h-4 shrink-0" /><span className="text-xs font-medium">{msg.conteudo}</span>
          </a>
        )}
        {isNegocio && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 shrink-0" /><span className="text-xs font-medium">{msg.conteudo}</span>
          </div>
        )}
        <p className={cn("text-[9px] mt-1", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
          {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

function NewChatSheet({ open, onOpenChange, userId, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; userId: string; onCreated: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [nome, setNome] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; nome: string }[]>([]);
  const [institucional, setInstitucional] = useState(false);
  const [remetenteIds, setRemetenteIds] = useState<string[]>([]);
  const createConversa = useCreateConversa();

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-search", search],
    queryFn: async () => {
      let query = supabase.from("usuarios").select("id, nome, email");
      if (search) query = query.ilike("nome", `%${search}%`);
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleUser = (u: { id: string; nome: string }) => {
    setSelectedUsers(prev => {
      const next = prev.some(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : [...prev, u];
      // Remove from remetentes if removed from participants
      if (!next.some(s => s.id === u.id)) {
        setRemetenteIds(r => r.filter(id => id !== u.id));
      }
      return next;
    });
  };

  const toggleRemetente = (uid: string) => {
    setRemetenteIds(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const isGroup = selectedUsers.length > 1;

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    const allIds = [userId, ...selectedUsers.map(u => u.id)];
    const tipo = isGroup ? "grupo" : "direto";
    const conversaNome = isGroup
      ? nome || selectedUsers.map(u => u.nome).join(", ")
      : selectedUsers[0].nome;

    // For institutional groups, creator is always a remetente
    const finalRemetenteIds = institucional ? [userId, ...remetenteIds] : undefined;

    try {
      const conversa = await createConversa.mutateAsync({
        nome: conversaNome, tipo, participantIds: allIds,
        criadoPor: userId, institucional: institucional && isGroup,
        remetenteIds: finalRemetenteIds,
      });
      setSelectedUsers([]);
      setNome("");
      setSearch("");
      setInstitucional(false);
      setRemetenteIds([]);
      toast.success("Conversa criada!");
      onCreated(conversa.id);
    } catch {
      toast.error("Erro ao criar conversa");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] flex flex-col">
        <SheetHeader><SheetTitle>Nova Conversa</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-3 flex-1 flex flex-col min-h-0">
          {isGroup && (
            <>
              <Input placeholder="Nome do grupo..." value={nome} onChange={e => setNome(e.target.value)} className="h-9 text-xs" />
              <div className="flex items-center gap-3 py-1 px-1">
                <Switch id="institucional" checked={institucional} onCheckedChange={setInstitucional} />
                <Label htmlFor="institucional" className="text-xs flex items-center gap-1.5 cursor-pointer">
                  <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                  Grupo Institucional
                </Label>
              </div>
            </>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar pessoas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              {usuarios.map(u => {
                const isSelected = selectedUsers.some(s => s.id === u.id);
                const isRemetente = remetenteIds.includes(u.id);
                return (
                  <div key={u.id} className={cn(
                    "w-full text-left px-3 py-2.5 text-xs rounded-lg flex items-center gap-3 transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}>
                    <button className="flex items-center gap-3 flex-1 min-w-0" onClick={() => toggleUser({ id: u.id, nome: u.nome })}>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                        {u.nome[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{u.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                      {isSelected && <Badge variant="default" className="text-[9px]">✓</Badge>}
                    </button>
                    {institucional && isSelected && (
                      <button
                        onClick={e => { e.stopPropagation(); toggleRemetente(u.id); }}
                        className={cn(
                          "shrink-0 px-2 py-1 rounded text-[9px] font-medium border transition-colors",
                          isRemetente ? "bg-amber-500/10 border-amber-500/30 text-amber-600" : "border-border text-muted-foreground hover:border-amber-500/30"
                        )}
                        title={isRemetente ? "Remetente autorizado" : "Definir como remetente"}
                      >
                        <ShieldCheck className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
              {usuarios.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">Nenhuma pessoa encontrada</p>}
            </div>
          </ScrollArea>

          {institucional && isGroup && (
            <p className="text-[10px] text-muted-foreground px-1">
              <ShieldCheck className="w-3 h-3 inline mr-1 text-amber-600" />
              Clique no ícone de escudo para autorizar remetentes. Você (criador) já está autorizado.
            </p>
          )}

          <Button className="w-full" onClick={handleCreate} disabled={selectedUsers.length === 0 || createConversa.isPending}>
            {createConversa.isPending ? "Criando..." : isGroup
              ? institucional ? `Criar Canal Institucional (${selectedUsers.length})` : `Criar Grupo (${selectedUsers.length})`
              : "Iniciar Conversa"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GroupSettingsSheet({ open, onOpenChange, conversa, userId }: { open: boolean; onOpenChange: (v: boolean) => void; conversa?: ChatConversa; userId: string }) {
  const { data: participantes = [] } = useParticipantes(conversa?.id);
  const { data: remetentes = [] } = useRemetentes(conversa?.id);
  const addRemetente = useAddRemetente();
  const removeRemetente = useRemoveRemetente();
  const [search, setSearch] = useState("");

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-group-settings", search],
    queryFn: async () => {
      let query = supabase.from("usuarios").select("id, nome, email");
      if (search) query = query.ilike("nome", `%${search}%`);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: open,
  });

  const participantIds = participantes.map(p => p.user_id);
  const remetenteIds = remetentes.map(r => r.user_id);
  const participantUsers = usuarios.filter(u => participantIds.includes(u.id));

  const handleToggle = async (uid: string, nome: string) => {
    if (!conversa) return;
    const isRem = remetenteIds.includes(uid);
    try {
      if (isRem) {
        await removeRemetente.mutateAsync({ conversaId: conversa.id, userId: uid });
        toast.success(`${nome} removido dos remetentes`);
      } else {
        await addRemetente.mutateAsync({ conversaId: conversa.id, userId: uid });
        toast.success(`${nome} adicionado como remetente`);
      }
    } catch {
      toast.error("Erro ao atualizar remetentes");
    }
  };

  if (!conversa?.institucional) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] flex flex-col">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Settings2 className="w-4 h-4" />Configurações do Canal</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4 flex-1 flex flex-col min-h-0">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
            <Megaphone className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Apenas o criador e remetentes autorizados podem enviar mensagens neste canal institucional.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar membros..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Membros do grupo</p>
              {participantUsers.map(u => {
                const isCreator = u.id === conversa.criado_por;
                const isRem = remetenteIds.includes(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                      {u.nome[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium">{u.nome}</p>
                        {isCreator && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">Criador</Badge>}
                        {isRem && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-amber-500/30 text-amber-600">Remetente</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                    {!isCreator && (
                      <Button size="sm" variant={isRem ? "default" : "outline"} className="h-7 text-[10px] gap-1"
                        onClick={() => handleToggle(u.id, u.nome)} disabled={addRemetente.isPending || removeRemetente.isPending}>
                        <ShieldCheck className="w-3 h-3" />
                        {isRem ? "Remetente" : "Autorizar"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddMembersSheet({ open, onOpenChange, conversaId }: { open: boolean; onOpenChange: (v: boolean) => void; conversaId: string }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const queryClient = useQueryClient();
  const { data: participantes = [] } = useParticipantes(conversaId);

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-add-members", search],
    queryFn: async () => {
      let query = supabase.from("usuarios").select("id, nome, email");
      if (search) query = query.ilike("nome", `%${search}%`);
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const participantIds = participantes.map(p => p.user_id);
  const available = usuarios.filter(u => !participantIds.includes(u.id));

  const handleAdd = async (userId: string, nome: string) => {
    setAdding(true);
    try {
      await supabase.from("chat_participantes").insert({ conversa_id: conversaId, user_id: userId });
      queryClient.invalidateQueries({ queryKey: ["chat-participantes", conversaId] });
      toast.success(`${nome} adicionado ao grupo`);
    } catch {
      toast.error("Erro ao adicionar membro");
    }
    setAdding(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] flex flex-col">
        <SheetHeader><SheetTitle>Adicionar Membros</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-3 flex-1 flex flex-col min-h-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar pessoas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Disponíveis</p>
              {available.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                    {u.nome[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{u.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAdd(u.id, u.nome)} disabled={adding}>
                    <UserPlus className="w-3 h-3 mr-1" />Adicionar
                  </Button>
                </div>
              ))}
              {available.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">Todos já estão no grupo</p>}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
