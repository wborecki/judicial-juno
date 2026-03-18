import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const EVENTOS_DISPONIVEIS = [
  { slug: "negocio.criado", label: "Negócio criado" },
  { slug: "negocio.ganho", label: "Negócio ganho" },
  { slug: "negocio.perdido", label: "Negócio perdido" },
  { slug: "area.concluida", label: "Área concluída" },
  { slug: "areas.todas_concluidas", label: "Todas áreas concluídas" },
  { slug: "processo.distribuido", label: "Processo distribuído" },
  { slug: "processo.descartado", label: "Processo descartado" },
  { slug: "contrato.assinado", label: "Contrato assinado" },
] as const;

export type N8nWebhook = {
  id: string;
  nome: string;
  url: string;
  eventos: string[];
  ativo: boolean;
  headers_custom: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

export type N8nWebhookLog = {
  id: string;
  webhook_id: string;
  evento: string;
  payload: any;
  status_code: number | null;
  resposta: string | null;
  created_at: string;
};

export function useN8nWebhooks() {
  return useQuery({
    queryKey: ["n8n-webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("n8n_webhooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as N8nWebhook[];
    },
  });
}

export function useN8nWebhookLogs(webhookId?: string) {
  return useQuery({
    queryKey: ["n8n-webhook-logs", webhookId],
    enabled: !!webhookId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("n8n_webhook_logs")
        .select("*")
        .eq("webhook_id", webhookId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as unknown as N8nWebhookLog[];
    },
  });
}

export function useCreateN8nWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (webhook: { nome: string; url: string; eventos: string[]; headers_custom?: Record<string, string> }) => {
      const { data, error } = await supabase
        .from("n8n_webhooks")
        .insert(webhook as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["n8n-webhooks"] }),
  });
}

export function useUpdateN8nWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<N8nWebhook> }) => {
      const { error } = await supabase
        .from("n8n_webhooks")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["n8n-webhooks"] }),
  });
}

export function useDeleteN8nWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("n8n_webhook_logs")
        .delete()
        .eq("webhook_id", id);
      if (error) throw error;
      const { error: e2 } = await supabase
        .from("n8n_webhooks")
        .delete()
        .eq("id", id);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["n8n-webhooks"] }),
  });
}

export function useDispararWebhook() {
  return useMutation({
    mutationFn: async ({ evento, dados }: { evento: string; dados?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke("n8n-webhook", {
        body: { evento, dados },
      });
      if (error) throw error;
      return data;
    },
  });
}
