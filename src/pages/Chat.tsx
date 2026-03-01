import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  useConversas, useMensagens, useParticipantes,
  useSendMessage, useCreateConversa, useUploadChatFile,
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Send, Paperclip, Search, Plus, Scale, Briefcase,
  FileText, File, X, Users, User, UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Chat() {
  const { user } = useAuth();
  const { data: conversas = [], isLoading: loadingConversas } = useConversas();
  const [activeConversaId, setActiveConversaId] = useState<string | null>(null);
  const [searchConversas, setSearchConversas] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  useEffect(() => {
    if (!activeConversaId && conversas.length > 0) {
      setActiveConversaId(conversas[0].id);
    }
  }, [conversas, activeConversaId]);

  const activeConversa = conversas.find(c => c.id === activeConversaId);

  const filteredConversas = useMemo(() => {
    if (!searchConversas) return conversas;
    const q = searchConversas.toLowerCase();
    return conversas.filter(c => c.nome?.toLowerCase().includes(q) || c.tipo.includes(q));
  }, [conversas, searchConversas]);

  return (
    <div className="flex h-[calc(100vh-64px)] -m-8 animate-fade-in">
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
          {filteredConversas.map(c => (
            <ConversaItem key={c.id} conversa={c} isActive={c.id === activeConversaId} onClick={() => setActiveConversaId(c.id)} />
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

      {/* New Chat Sheet */}
      <NewChatSheet
        open={showNewChat}
        onOpenChange={setShowNewChat}
        userId={user?.id ?? ""}
        onCreated={(id) => { setActiveConversaId(id); setShowNewChat(false); }}
      />

      {/* Add Members Sheet */}
      {activeConversaId && (
        <AddMembersSheet
          open={showAddMembers}
          onOpenChange={setShowAddMembers}
          conversaId={activeConversaId}
        />
      )}
    </div>
  );
}

function ConversaItem({ conversa, isActive, onClick }: { conversa: ChatConversa; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/30 transition-colors",
        isActive ? "bg-accent/10" : "hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          conversa.tipo === "grupo" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"
        )}>
          {conversa.tipo === "grupo" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{conversa.nome ?? "Conversa"}</p>
          <p className="text-[10px] text-muted-foreground">
            {format(new Date(conversa.updated_at), "dd/MM HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>
    </button>
  );
}

function MessagePanel({ conversaId, userId, conversa, onAddMembers }: { conversaId: string; userId: string; conversa?: ChatConversa; onAddMembers: () => void }) {
  const { data: mensagens = [], isLoading } = useMensagens(conversaId);
  const { data: participantes = [] } = useParticipantes(conversaId);
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

  const handleSend = async () => {
    if (!text.trim()) return;
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
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{conversa?.nome ?? "Conversa"}</p>
          <Badge variant="secondary" className="text-[10px]">{participantes.length} participante{participantes.length !== 1 ? "s" : ""}</Badge>
        </div>
        {isGroup && (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onAddMembers}>
            <UserPlus className="w-3.5 h-3.5" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-2/3" />)}</div>}
        {!isLoading && mensagens.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-xs">Nenhuma mensagem ainda. Comece a conversa!</div>
        )}
        {mensagens.map(msg => <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === userId} />)}
      </div>

      {/* Input */}
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

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="right" className="w-[400px] sm:w-[440px]">
          <SheetHeader>
            <SheetTitle>Compartilhar</SheetTitle>
          </SheetHeader>
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

/* ─── New Chat Sheet ─── */
function NewChatSheet({ open, onOpenChange, userId, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; userId: string; onCreated: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [nome, setNome] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; nome: string }[]>([]);
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
    setSelectedUsers(prev => prev.some(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : [...prev, u]);
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    const allIds = [userId, ...selectedUsers.map(u => u.id)];
    const tipo = selectedUsers.length > 1 ? "grupo" : "direto";
    const conversaNome = tipo === "grupo"
      ? nome || selectedUsers.map(u => u.nome).join(", ")
      : selectedUsers[0].nome;

    try {
      const conversa = await createConversa.mutateAsync({ nome: conversaNome, tipo, participantIds: allIds });
      setSelectedUsers([]);
      setNome("");
      setSearch("");
      onCreated(conversa.id);
    } catch {}
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Nova Conversa</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3 flex-1 flex flex-col min-h-0">
          {selectedUsers.length > 1 && (
            <Input placeholder="Nome do grupo..." value={nome} onChange={e => setNome(e.target.value)} className="h-9 text-xs" />
          )}

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedUsers.map(u => (
                <Badge key={u.id} variant="secondary" className="text-[10px] gap-1">
                  {u.nome}
                  <button onClick={() => setSelectedUsers(prev => prev.filter(p => p.id !== u.id))}><X className="w-2.5 h-2.5" /></button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar pessoas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              {usuarios.map(u => {
                const isSelected = selectedUsers.some(s => s.id === u.id);
                return (
                  <button key={u.id} onClick={() => toggleUser({ id: u.id, nome: u.nome })} className={cn(
                    "w-full text-left px-3 py-2.5 text-xs rounded-lg flex items-center gap-3 transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                      {u.nome[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{u.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                    {isSelected && <Badge variant="default" className="text-[9px]">✓</Badge>}
                  </button>
                );
              })}
              {usuarios.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">Nenhuma pessoa encontrada</p>}
            </div>
          </ScrollArea>

          <Button className="w-full" onClick={handleCreate} disabled={selectedUsers.length === 0 || createConversa.isPending}>
            {createConversa.isPending ? "Criando..." : selectedUsers.length > 1 ? `Criar Grupo (${selectedUsers.length})` : "Iniciar Conversa"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Add Members Sheet ─── */
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

  const handleAdd = async (userId: string) => {
    setAdding(true);
    try {
      await supabase.from("chat_participantes").insert({ conversa_id: conversaId, user_id: userId });
      queryClient.invalidateQueries({ queryKey: ["chat-participantes", conversaId] });
    } catch {}
    setAdding(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Adicionar Membros</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3 flex-1 flex flex-col min-h-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar pessoas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
          </div>

          {participantes.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Participantes atuais ({participantes.length})</p>
              <div className="flex flex-wrap gap-1">
                {participantes.map(p => (
                  <Badge key={p.id} variant="outline" className="text-[10px]">{p.user_id.slice(0, 8)}…</Badge>
                ))}
              </div>
            </div>
          )}

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
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAdd(u.id)} disabled={adding}>
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
