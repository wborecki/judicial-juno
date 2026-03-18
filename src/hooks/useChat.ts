import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type ChatConversa = {
  id: string;
  nome: string | null;
  tipo: string;
  created_at: string;
  updated_at: string;
  deletado_em: string | null;
  deletado_por: string | null;
  fixado: boolean;
  fixado_em: string | null;
  ultima_mensagem: string | null;
  ultima_mensagem_em: string | null;
  criado_por: string | null;
  institucional: boolean;
};

export type ChatParticipante = {
  id: string;
  conversa_id: string;
  user_id: string;
  joined_at: string;
};

export type ChatMensagem = {
  id: string;
  conversa_id: string;
  sender_id: string;
  conteudo: string | null;
  tipo: string;
  referencia_id: string | null;
  arquivo_url: string | null;
  arquivo_nome: string | null;
  created_at: string;
};

export type ChatRemetente = {
  id: string;
  conversa_id: string;
  user_id: string;
  added_at: string;
};

export function useConversas() {
  return useQuery({
    queryKey: ["chat-conversas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversas")
        .select("*")
        .is("deletado_em", null)
        .order("fixado", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as ChatConversa[];
    },
  });
}

export function useParticipantes(conversaId?: string) {
  return useQuery({
    queryKey: ["chat-participantes", conversaId],
    queryFn: async () => {
      if (!conversaId) return [];
      const { data, error } = await supabase
        .from("chat_participantes")
        .select("*")
        .eq("conversa_id", conversaId);
      if (error) throw error;
      return data as ChatParticipante[];
    },
    enabled: !!conversaId,
  });
}

export function useRemetentes(conversaId?: string) {
  return useQuery({
    queryKey: ["chat-remetentes", conversaId],
    queryFn: async () => {
      if (!conversaId) return [];
      const { data, error } = await supabase
        .from("chat_remetentes")
        .select("*")
        .eq("conversa_id", conversaId);
      if (error) throw error;
      return data as ChatRemetente[];
    },
    enabled: !!conversaId,
  });
}

const MESSAGES_PAGE_SIZE = 50;

export function useMensagens(conversaId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversaId) return;
    const channel = supabase
      .channel(`chat-${conversaId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_mensagens", filter: `conversa_id=eq.${conversaId}` },
        (payload) => {
          queryClient.setQueryData(
            ["chat-mensagens", conversaId],
            (old: { pages: ChatMensagem[][]; pageParams: unknown[] } | undefined) => {
              if (!old) return old;
              const lastPageIndex = old.pages.length - 1;
              const newPages = [...old.pages];
              newPages[lastPageIndex] = [...newPages[lastPageIndex], payload.new as ChatMensagem];
              return { ...old, pages: newPages };
            }
          );
          queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversaId, queryClient]);

  const query = useInfiniteQuery({
    queryKey: ["chat-mensagens", conversaId],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      if (!conversaId) return [];
      let q = supabase
        .from("chat_mensagens")
        .select("*")
        .eq("conversa_id", conversaId)
        .order("created_at", { ascending: false })
        .limit(MESSAGES_PAGE_SIZE);

      if (pageParam) {
        q = q.lt("created_at", pageParam);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data as ChatMensagem[]).reverse();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < MESSAGES_PAGE_SIZE) return undefined;
      return lastPage[0]?.created_at ?? undefined;
    },
    enabled: !!conversaId,
  });

  const allMessages = query.data?.pages.flat() ?? [];

  return {
    ...query,
    data: allMessages,
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (msg: {
      conversa_id: string;
      sender_id: string;
      conteudo?: string;
      tipo?: string;
      referencia_id?: string;
      arquivo_url?: string;
      arquivo_nome?: string;
    }) => {
      const { data, error } = await supabase
        .from("chat_mensagens")
        .insert({
          conversa_id: msg.conversa_id,
          sender_id: msg.sender_id,
          conteudo: msg.conteudo ?? null,
          tipo: msg.tipo ?? "texto",
          referencia_id: msg.referencia_id ?? null,
          arquivo_url: msg.arquivo_url ?? null,
          arquivo_nome: msg.arquivo_nome ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("chat_conversas").update({
        updated_at: new Date().toISOString(),
        ultima_mensagem: msg.conteudo?.slice(0, 100) ?? (msg.tipo === "arquivo" ? "📎 Arquivo" : null),
        ultima_mensagem_em: new Date().toISOString(),
      }).eq("id", msg.conversa_id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
    },
  });
}

export function useCreateConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome, tipo, participantIds, criadoPor, institucional, remetenteIds }: {
      nome?: string; tipo: string; participantIds: string[]; criadoPor?: string; institucional?: boolean; remetenteIds?: string[];
    }) => {
      const conversaId = crypto.randomUUID();

      const { error } = await supabase
        .from("chat_conversas")
        .insert({ id: conversaId, nome: nome ?? null, tipo, criado_por: criadoPor ?? null, institucional: institucional ?? false });
      if (error) throw error;

      const participants = participantIds.map((uid) => ({
        conversa_id: conversaId,
        user_id: uid,
      }));
      const { error: pError } = await supabase.from("chat_participantes").insert(participants);
      if (pError) throw pError;

      // Add designated senders for institutional groups
      if (institucional && remetenteIds && remetenteIds.length > 0) {
        const remetentes = remetenteIds.map((uid) => ({
          conversa_id: conversaId,
          user_id: uid,
        }));
        await supabase.from("chat_remetentes").insert(remetentes);
      }

      return {
        id: conversaId,
        nome: nome ?? null,
        tipo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deletado_em: null,
        deletado_por: null,
        fixado: false,
        fixado_em: null,
        ultima_mensagem: null,
        ultima_mensagem_em: null,
        criado_por: criadoPor ?? null,
        institucional: institucional ?? false,
      } as ChatConversa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
    },
  });
}

export function useRenameConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversaId, nome }: { conversaId: string; nome: string }) => {
      const { error } = await supabase
        .from("chat_conversas")
        .update({ nome })
        .eq("id", conversaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
    },
  });
}

export function useDeleteConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversaId, userId }: { conversaId: string; userId: string }) => {
      const { error } = await supabase
        .from("chat_conversas")
        .update({ deletado_em: new Date().toISOString(), deletado_por: userId })
        .eq("id", conversaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
    },
  });
}

export function useToggleFixarConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversaId, fixado }: { conversaId: string; fixado: boolean }) => {
      const { error } = await supabase
        .from("chat_conversas")
        .update({
          fixado: !fixado,
          fixado_em: !fixado ? new Date().toISOString() : null,
        })
        .eq("id", conversaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
    },
  });
}

export function useUploadChatFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("chat-files").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(path);
      return { url: urlData.publicUrl, name: file.name };
    },
  });
}

export function useAddRemetente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversaId, userId }: { conversaId: string; userId: string }) => {
      const { error } = await supabase.from("chat_remetentes").insert({ conversa_id: conversaId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["chat-remetentes", vars.conversaId] });
    },
  });
}

export function useRemoveRemetente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversaId, userId }: { conversaId: string; userId: string }) => {
      const { error } = await supabase.from("chat_remetentes").delete().eq("conversa_id", conversaId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["chat-remetentes", vars.conversaId] });
    },
  });
}
