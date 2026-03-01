import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NegocioCampoValor {
  id: string;
  negocio_id: string;
  campo_id: string;
  valor: string | null;
  created_at: string;
  updated_at: string;
}

export function useNegocioCamposValores(negocioId?: string) {
  return useQuery({
    queryKey: ["negocio_campos_valores", negocioId],
    enabled: !!negocioId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("negocio_campos_valores")
        .select("*")
        .eq("negocio_id", negocioId!);
      if (error) throw error;
      return data as NegocioCampoValor[];
    },
  });
}

export function useSaveNegocioCampoValor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ negocio_id, campo_id, valor }: { negocio_id: string; campo_id: string; valor: string | null }) => {
      const { data, error } = await supabase
        .from("negocio_campos_valores")
        .upsert({ negocio_id, campo_id, valor } as any, { onConflict: "negocio_id,campo_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["negocio_campos_valores", vars.negocio_id] }),
  });
}
