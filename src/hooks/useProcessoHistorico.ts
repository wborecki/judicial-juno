import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessoHistorico {
  id: string;
  processo_id: string;
  usuario_id: string | null;
  usuario_nome: string | null;
  tipo: string;
  descricao: string;
  campo: string | null;
  valor_anterior: string | null;
  valor_novo: string | null;
  metadata: any;
  created_at: string;
}

export function useProcessoHistorico(processoId?: string) {
  return useQuery({
    queryKey: ["processo-historico", processoId],
    enabled: !!processoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processo_historico" as any)
        .select("*")
        .eq("processo_id", processoId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProcessoHistorico[];
    },
  });
}

export function useCreateProcessoHistorico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<ProcessoHistorico, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("processo_historico" as any)
        .insert(entry as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["processo-historico", vars.processo_id] });
    },
  });
}
