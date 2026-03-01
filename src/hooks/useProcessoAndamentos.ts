import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessoAndamento {
  id: string;
  processo_id: string;
  data_andamento: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  criado_por: string | null;
  created_at: string;
}

export function useProcessoAndamentos(processoId: string | undefined) {
  return useQuery({
    queryKey: ["processo-andamentos", processoId],
    queryFn: async () => {
      if (!processoId) return [];
      const { data, error } = await supabase
        .from("processo_andamentos")
        .select("*")
        .eq("processo_id", processoId)
        .order("data_andamento", { ascending: false });
      if (error) throw error;
      return data as ProcessoAndamento[];
    },
    enabled: !!processoId,
  });
}

export function useCreateProcessoAndamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (andamento: Omit<ProcessoAndamento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("processo_andamentos")
        .insert(andamento)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["processo-andamentos", vars.processo_id] });
    },
  });
}

export function useDeleteProcessoAndamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, processoId }: { id: string; processoId: string }) => {
      const { error } = await supabase.from("processo_andamentos").delete().eq("id", id);
      if (error) throw error;
      return processoId;
    },
    onSuccess: (processoId) => {
      qc.invalidateQueries({ queryKey: ["processo-andamentos", processoId] });
    },
  });
}
