import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Processo = {
  id: string;
  numero_processo: string;
  tribunal: string;
  natureza: string;
  tipo_pagamento: string;
  status_processo: number;
  transito_julgado: boolean;
  parte_autora: string;
  parte_re: string;
  valor_estimado: number | null;
  data_distribuicao: string | null;
  data_captacao: string;
  triagem_resultado: string | null;
  triagem_observacoes: string | null;
  triagem_data: string | null;
  triagem_por: string | null;
  pipeline_status: string;
  pessoa_id: string | null;
  equipe_id: string | null;
  analista_id: string | null;
  distribuido_em: string | null;
  distribuido_por: string | null;
  valor_precificado: number | null;
  precificacao_data: string | null;
  precificado_por: string | null;
  tipo_servico: string | null;
  valor_proposta: number | null;
  valor_fechamento: number | null;
  data_fechamento: string | null;
  negocio_status: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export function useProcessos(pipelineStatus?: string) {
  return useQuery({
    queryKey: ["processos", pipelineStatus],
    queryFn: async () => {
      let query = supabase.from("processos").select("*").order("created_at", { ascending: false });
      if (pipelineStatus) {
        query = query.eq("pipeline_status", pipelineStatus);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Processo[];
    },
  });
}

export function useProcesso(id: string | undefined) {
  return useQuery({
    queryKey: ["processo", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const { data, error } = await supabase
        .from("processos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Processo | null;
    },
    enabled: !!id,
  });
}

export function useUpdateProcesso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Processo> }) => {
      const { data, error } = await supabase
        .from("processos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["processos"] });
      queryClient.setQueryData(["processo", data.id], data);
    },
  });
}
