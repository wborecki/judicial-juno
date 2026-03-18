import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDispararWebhook } from "@/hooks/useN8nWebhooks";

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
  triagem_motivo_inaptidao: string | null;
  pipeline_status: string;
  pessoa_id: string | null;
  equipe_id: string | null;
  analista_id: string | null;
  distribuido_em: string | null;
  distribuido_por: string | null;
  valor_precificado: number | null;
  precificacao_data: string | null;
  precificado_por: string | null;
  observacoes: string | null;
  vara_comarca: string | null;
  classe_fase: string | null;
  natureza_credito: string | null;
  created_at: string;
  updated_at: string;
};

export type ProcessoFilters = {
  search?: string;
  tribunal?: string;
  natureza?: string;
  tipoPagamento?: string;
  triagem?: string;
  transito?: string;
  dateFrom?: string;
  dateTo?: string;
  classeFase?: string;
  valorMin?: number;
  valorMax?: number;
};

export type PaginatedResult = {
  data: Processo[];
  count: number;
};

export function useProcessosPaginated(
  page: number,
  pageSize: number,
  filters: ProcessoFilters
) {
  return useQuery({
    queryKey: ["processos-paginated", page, pageSize, filters],
    queryFn: async (): Promise<PaginatedResult> => {
      let query = supabase
        .from("processos")
        .select("*", { count: "exact" })
        .order("data_captacao", { ascending: false });

      if (filters.search) {
        const q = `%${filters.search}%`;
        query = query.or(
          `numero_processo.ilike.${q},parte_autora.ilike.${q},parte_re.ilike.${q}`
        );
      }
      if (filters.tribunal && filters.tribunal !== "all")
        query = query.eq("tribunal", filters.tribunal);
      if (filters.natureza && filters.natureza !== "all")
        query = query.eq("natureza", filters.natureza);
      if (filters.tipoPagamento && filters.tipoPagamento !== "all")
        query = query.eq("tipo_pagamento", filters.tipoPagamento);
      if (filters.triagem && filters.triagem !== "all")
        query = query.eq("triagem_resultado", filters.triagem);
      if (filters.transito && filters.transito !== "all")
        query = query.eq("transito_julgado", filters.transito === "sim");
      if (filters.classeFase && filters.classeFase !== "all")
        query = query.eq("classe_fase", filters.classeFase);
      if (filters.valorMin != null)
        query = query.gte("valor_estimado", filters.valorMin);
      if (filters.valorMax != null)
        query = query.lte("valor_estimado", filters.valorMax);
      if (filters.dateFrom)
        query = query.gte("data_captacao", filters.dateFrom);
      if (filters.dateTo)
        query = query.lte("data_captacao", filters.dateTo + "T23:59:59");

      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data ?? []) as Processo[], count: count ?? 0 };
    },
    placeholderData: keepPreviousData,
  });
}

export function useProcessosStats() {
  return useQuery({
    queryKey: ["processos-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("triagem_resultado");
      if (error) throw error;
      const total = data.length;
      const pendente = data.filter(p => !p.triagem_resultado || p.triagem_resultado === "pendente").length;
      const convertido = data.filter(p => p.triagem_resultado === "convertido").length;
      const descartado = data.filter(p => p.triagem_resultado === "descartado").length;
      return { total, pendente, convertido, descartado };
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["processos-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["processos-stats"] });
      queryClient.setQueryData(["processo", data.id], data);
    },
  });
}
