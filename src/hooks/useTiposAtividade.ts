import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TipoAtividade = {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
  entidade: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
};

export function useTiposAtividade(entidade?: "agenda" | "negocio") {
  return useQuery({
    queryKey: ["tipos-atividade", entidade],
    queryFn: async () => {
      let q = supabase
        .from("tipos_atividade")
        .select("*")
        .order("ordem", { ascending: true });

      if (entidade) {
        q = q.or(`entidade.eq.${entidade},entidade.eq.ambos`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as TipoAtividade[];
    },
  });
}

export function useCreateTipoAtividade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tipo: Omit<TipoAtividade, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("tipos_atividade")
        .insert(tipo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tipos-atividade"] }),
  });
}

export function useUpdateTipoAtividade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TipoAtividade> & { id: string }) => {
      const { data, error } = await supabase
        .from("tipos_atividade")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tipos-atividade"] }),
  });
}

export function useDeleteTipoAtividade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tipos_atividade").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tipos-atividade"] }),
  });
}
