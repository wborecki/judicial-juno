import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentoEnvioSignatario {
  id: string;
  envio_id: string;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  papel: string;
  clicksign_signer_key: string | null;
  status: string;
  assinado_em: string | null;
}

export interface DocumentoEnvio {
  id: string;
  modelo_id: string | null;
  negocio_id: string | null;
  processo_id: string | null;
  contrato_id: string | null;
  clicksign_envelope_id: string | null;
  clicksign_document_key: string | null;
  status: string;
  dados_variaveis: Record<string, any>;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
  documento_modelos?: { nome: string } | null;
  documento_envio_signatarios?: DocumentoEnvioSignatario[];
}

export function useDocumentoEnvios(negocioId?: string) {
  return useQuery({
    queryKey: ["documento-envios", negocioId],
    queryFn: async () => {
      let q = supabase
        .from("documento_envios")
        .select("*, documento_modelos(nome), documento_envio_signatarios(*)")
        .order("created_at", { ascending: false });
      if (negocioId) q = q.eq("negocio_id", negocioId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as DocumentoEnvio[];
    },
    enabled: !!negocioId,
  });
}

export function useCreateEnvio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (envio: {
      modelo_id?: string | null;
      negocio_id?: string | null;
      processo_id?: string | null;
      contrato_id?: string | null;
      clicksign_envelope_id?: string | null;
      clicksign_document_key?: string | null;
      status?: string;
      dados_variaveis?: Record<string, any>;
      criado_por?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("documento_envios")
        .insert(envio as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documento-envios"] }),
  });
}

export function useUpdateEnvio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("documento_envios")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documento-envios"] }),
  });
}

export function useCreateSignatario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sig: {
      envio_id: string;
      nome: string;
      email: string;
      cpf?: string | null;
      telefone?: string | null;
      papel?: string;
      clicksign_signer_key?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("documento_envio_signatarios")
        .insert(sig as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documento-envios"] }),
  });
}

export function useCallClickSign() {
  return useMutation({
    mutationFn: async (payload: { action: string; [key: string]: any }) => {
      const { data, error } = await supabase.functions.invoke("clicksign-api", {
        body: payload,
      });
      if (error) {
        // Parse the edge function error for a cleaner message
        const { parseClickSignError } = await import("@/lib/clicksign-errors");
        throw new Error(parseClickSignError(error));
      }
      if (data?.error) {
        const { parseClickSignError } = await import("@/lib/clicksign-errors");
        throw new Error(parseClickSignError(new Error(data.error)));
      }
      return data;
    },
  });
}
