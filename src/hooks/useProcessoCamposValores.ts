import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessoCampoValor {
  id: string;
  processo_id: string;
  campo_id: string;
  valor: string | null;
  created_at: string;
  updated_at: string;
}

export function useProcessoCamposValores(processoId?: string) {
  return useQuery({
    queryKey: ["processo_campos_valores", processoId],
    enabled: !!processoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processo_campos_valores")
        .select("*")
        .eq("processo_id", processoId!);
      if (error) throw error;
      return data as ProcessoCampoValor[];
    },
  });
}

export function useSaveProcessoCampoValor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ processo_id, campo_id, valor }: { processo_id: string; campo_id: string; valor: string | null }) => {
      const { data, error } = await supabase
        .from("processo_campos_valores")
        .upsert({ processo_id, campo_id, valor } as any, { onConflict: "processo_id,campo_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["processo_campos_valores", vars.processo_id] }),
  });
}
