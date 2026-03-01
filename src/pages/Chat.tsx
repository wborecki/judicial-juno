import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Send, Paperclip, Search, Plus, Scale, Briefcase,
  FileText, Image, File, X, Users, User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// We'll use profiles table for display names since we can't query auth.users
// For now, we show email/id and the current user's name

export default function Chat() {
  const { user } = useAuth();
  const { data: conversas = [], isLoading: loadingConversas } = useConversas();
  const [activeConversaId, setActiveConversaId] = useState<string | null>(null);
  const [searchConversas, setSearchConversas] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  // Auto-select first conversa
  useEffect(() => {
    if (!activeConversaId && conversas.length > 0) {
      setActiveConversaId(conversas[0].id);
    }
  }, [conversas, activeConversaId]);

  const filteredConversas = useMemo(() => {
    if (!searchConversas) return conversas;
    const q = searchConversas.toLowerCase();
    return conversas.filter(c => c.nome?.toLowerCase().includes(q) || c.tipo.includes(q));
  }, [conversas, searchConversas]);

  return (
    <div className="flex h-[calc(100vh-64px)] -m-8 animate-fade-in">
      {/* Left panel — Conversation list */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/10 shrink-0">
        {/* Header */}
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
            <Input
              placeholder="Buscar conversas..."
              value={searchConversas}
              onChange={e => setSearchConversas(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          {loadingConversas && (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          )}
          {!loadingConversas && filteredConversas.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          )}
          {filteredConversas.map(c => (
            <ConversaItem
              key={c.id}
              conversa={c}
              isActive={c.id === activeConversaId}
              onClick={() => setActiveConversaId(c.id)}
            />
          ))}
        </ScrollArea>
      </div>

      {/* Right panel — Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversaId ? (
          <MessagePanel conversaId={activeConversaId} userId={user?.id ?? ""} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageSquare className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm">Selecione ou crie uma conversa</p>
            </div>
          </div>
        )}
      </div>

      {/* New chat dialog */}
      {showNewChat && (
        <NewChatOverlay
          userId={user?.id ?? ""}
          onClose={() => setShowNewChat(false)}
          onCreated={(id) => { setActiveConversaId(id); setShowNewChat(false); }}
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

function MessagePanel({ conversaId, userId }: { conversaId: string; userId: string }) {
  const { data: mensagens = [], isLoading } = useMensagens(conversaId);
  const { data: participantes = [] } = useParticipantes(conversaId);
  const sendMessage = useSendMessage();
  const uploadFile = useUploadChatFile();
  const { data: processos = [] } = useProcessos();
  const { data: negocios = [] } = useNegocios();

  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareSearch, setShareSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setText("");
    await sendMessage.mutateAsync({
      conversa_id: conversaId,
      sender_id: userId,
      conteudo: text.trim(),
      tipo: "texto",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile.mutateAsync(file);
      await sendMessage.mutateAsync({
        conversa_id: conversaId,
        sender_id: userId,
        conteudo: result.name,
        tipo: "arquivo",
        arquivo_url: result.url,
        arquivo_nome: result.name,
      });
    } catch {
      // error handled by mutation
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleShareProcesso = async (processoId: string, numero: string) => {
    await sendMessage.mutateAsync({
      conversa_id: conversaId,
      sender_id: userId,
      conteudo: `📋 Processo: ${numero}`,
      tipo: "processo",
      referencia_id: processoId,
    });
    setShowShareMenu(false);
  };

  const handleShareNegocio = async (negocioId: string, tipo: string | null) => {
    await sendMessage.mutateAsync({
      conversa_id: conversaId,
      sender_id: userId,
      conteudo: `💼 Negócio: ${tipo ?? "Sem tipo"}`,
      tipo: "negocio",
      referencia_id: negocioId,
    });
    setShowShareMenu(false);
  };

  const filteredProcessos = useMemo(() => {
    if (!shareSearch) return processos.slice(0, 10);
    const q = shareSearch.toLowerCase();
    return processos.filter(p => p.numero_processo.toLowerCase().includes(q) || p.parte_autora.toLowerCase().includes(q)).slice(0, 10);
  }, [processos, shareSearch]);

  const filteredNegocios = useMemo(() => {
    return negocios.slice(0, 5);
  }, [negocios]);

  return (
    <>
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0">
        <p className="text-sm font-medium">Conversa</p>
        <Badge variant="secondary" className="text-[10px]">{participantes.length} participante{participantes.length !== 1 ? "s" : ""}</Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-2/3" />)}
          </div>
        )}
        {!isLoading && mensagens.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-xs">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        )}
        {mensagens.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === userId} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          {/* Attach button */}
          <Popover open={showAttach} onOpenChange={setShowAttach}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0">
                <Paperclip className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="start">
              <button
                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2"
                onClick={() => { fileInputRef.current?.click(); setShowAttach(false); }}
              >
                <File className="w-3.5 h-3.5" />Enviar Arquivo
              </button>
              <button
                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2"
                onClick={() => { setShowShareMenu(true); setShowAttach(false); }}
              >
                <Scale className="w-3.5 h-3.5" />Compartilhar Processo/Negócio
              </button>
            </PopoverContent>
          </Popover>

          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

          <Input
            placeholder="Digite uma mensagem..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm"
          />
          <Button
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Share process/negocio overlay */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowShareMenu(false)}>
          <div className="bg-background border border-border rounded-xl w-[420px] max-h-[500px] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Compartilhar</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowShareMenu(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-3">
              <Input
                placeholder="Buscar processo..."
                value={shareSearch}
                onChange={e => setShareSearch(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <ScrollArea className="flex-1 max-h-[350px]">
              <div className="px-3 pb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 py-1.5">Processos</p>
                {filteredProcessos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleShareProcesso(p.id, p.numero_processo)}
                    className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2"
                  >
                    <Scale className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-mono">{p.numero_processo}</span>
                    <span className="text-muted-foreground truncate">{p.parte_autora}</span>
                  </button>
                ))}
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 py-1.5 mt-2">Negócios</p>
                {filteredNegocios.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleShareNegocio(n.id, n.tipo_servico)}
                    className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted flex items-center gap-2"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{n.tipo_servico ?? "Sem tipo"}</span>
                    <Badge variant="secondary" className="text-[9px]">{n.negocio_status}</Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
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
        isOwn
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-muted rounded-bl-md"
      )}>
        {/* Text message */}
        {msg.tipo === "texto" && <p className="whitespace-pre-wrap break-words">{msg.conteudo}</p>}

        {/* File */}
        {isFile && (
          <a href={msg.arquivo_url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80">
            {isImage ? (
              <div className="space-y-1.5">
                <img src={msg.arquivo_url ?? ""} alt={msg.arquivo_nome ?? ""} className="rounded-lg max-w-[250px] max-h-[200px] object-cover" />
                <p className="text-[10px] opacity-70">{msg.arquivo_nome}</p>
              </div>
            ) : (
              <>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="underline text-xs">{msg.arquivo_nome ?? "Arquivo"}</span>
              </>
            )}
          </a>
        )}

        {/* Process share */}
        {isProcesso && (
          <a href={`/processos/${msg.referencia_id}`} className="flex items-center gap-2 hover:opacity-80">
            <Scale className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">{msg.conteudo}</span>
          </a>
        )}

        {/* Negocio share */}
        {isNegocio && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">{msg.conteudo}</span>
          </div>
        )}

        <p className={cn("text-[9px] mt-1", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
          {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

function NewChatOverlay({ userId, onClose, onCreated }: { userId: string; onClose: () => void; onCreated: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [nome, setNome] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; nome: string; email: string }[]>([]);
  const createConversa = useCreateConversa();

  // Get profiles for user search
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-search", search],
    queryFn: async () => {
      let query = supabase.from("profiles").select("user_id, nome");
      if (search) {
        query = query.ilike("nome", `%${search}%`);
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return (data ?? []).filter((p: any) => p.user_id !== userId);
    },
  });

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    const allIds = [userId, ...selectedUsers.map(u => u.id)];
    const tipo = allIds.length > 2 ? "grupo" : "direto";
    const conversaNome = tipo === "grupo"
      ? nome || selectedUsers.map(u => u.nome || "Usuário").join(", ")
      : selectedUsers[0]?.nome || "Conversa";

    try {
      const conversa = await createConversa.mutateAsync({
        nome: conversaNome,
        tipo,
        participantIds: allIds,
      });
      onCreated(conversa.id);
    } catch {
      // error
    }
  };

  const toggleUser = (profile: any) => {
    const exists = selectedUsers.find(u => u.id === profile.user_id);
    if (exists) {
      setSelectedUsers(prev => prev.filter(u => u.id !== profile.user_id));
    } else {
      setSelectedUsers(prev => [...prev, { id: profile.user_id, nome: profile.nome ?? "Usuário", email: "" }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl w-[400px] max-h-[500px] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Nova Conversa</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-3 space-y-2">
          {selectedUsers.length > 1 && (
            <Input
              placeholder="Nome do grupo..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="h-8 text-xs"
            />
          )}

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedUsers.map(u => (
                <Badge key={u.id} variant="secondary" className="text-[10px] gap-1">
                  {u.nome}
                  <button onClick={() => setSelectedUsers(prev => prev.filter(p => p.id !== u.id))}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[250px]">
          <div className="px-3 pb-3 space-y-0.5">
            {profiles.map((p: any) => {
              const isSelected = selectedUsers.some(u => u.id === p.user_id);
              return (
                <button
                  key={p.user_id}
                  onClick={() => toggleUser(p)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs rounded flex items-center gap-2 transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px] shrink-0">
                    {(p.nome ?? "?")[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium">{p.nome ?? "Usuário"}</span>
                </button>
              );
            })}
            {profiles.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">Nenhuma pessoa encontrada</p>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button
            className="w-full text-xs"
            size="sm"
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || createConversa.isPending}
          >
            {createConversa.isPending ? "Criando..." : `Iniciar Conversa (${selectedUsers.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
