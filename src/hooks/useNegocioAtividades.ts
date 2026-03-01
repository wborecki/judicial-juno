import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NegocioAtividade = {
  id: string;
  negocio_id: string;
  tipo: string;
  descricao: string | null;
  criado_por: string | null;
  created_at: string;
};

export function useNegocioAtividades(negocioId?: string) {
  return useQuery({
    queryKey: ["negocio-atividades", negocioId],
    enabled: !!negocioId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("negocio_atividades")
        .select("*")
        .eq("negocio_id", negocioId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NegocioAtividade[];
    },
  });
}

export function useCreateNegocioAtividade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (atividade: { negocio_id: string; tipo: string; descricao?: string | null; criado_por?: string | null }) => {
      const { data, error } = await supabase
        .from("negocio_atividades")
        .insert(atividade)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["negocio-atividades", vars.negocio_id] }),
  });
}
