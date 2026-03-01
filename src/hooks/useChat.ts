import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export type ChatConversa = {
  id: string;
  nome: string | null;
  tipo: string;
  created_at: string;
  updated_at: string;
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

export function useConversas() {
  return useQuery({
    queryKey: ["chat-conversas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversas")
        .select("*")
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
          queryClient.setQueryData<ChatMensagem[]>(
            ["chat-mensagens", conversaId],
            (old) => [...(old ?? []), payload.new as ChatMensagem]
          );
          // Also update conversa list order
          queryClient.invalidateQueries({ queryKey: ["chat-conversas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversaId, queryClient]);

  return useQuery({
    queryKey: ["chat-mensagens", conversaId],
    queryFn: async () => {
      if (!conversaId) return [];
      const { data, error } = await supabase
        .from("chat_mensagens")
        .select("*")
        .eq("conversa_id", conversaId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMensagem[];
    },
    enabled: !!conversaId,
  });
}

export function useSendMessage() {
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
      // Update conversa timestamp
      await supabase.from("chat_conversas").update({ updated_at: new Date().toISOString() }).eq("id", msg.conversa_id);
      return data;
    },
  });
}

export function useCreateConversa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome, tipo, participantIds }: { nome?: string; tipo: string; participantIds: string[] }) => {
      const conversaId = crypto.randomUUID();

      const { error } = await supabase
        .from("chat_conversas")
        .insert({ id: conversaId, nome: nome ?? null, tipo });
      if (error) throw error;

      // Add participants (including current user)
      const participants = participantIds.map((uid) => ({
        conversa_id: conversaId,
        user_id: uid,
      }));
      const { error: pError } = await supabase.from("chat_participantes").insert(participants);
      if (pError) throw pError;

      return {
        id: conversaId,
        nome: nome ?? null,
        tipo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ChatConversa;
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
