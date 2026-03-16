import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAcompanhamentos() {
  return useQuery({
    queryKey: ["acompanhamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acompanhamentos")
        .select("*, pessoas(nome, cpf_cnpj, tipo)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAcompanhamentoResultados(acompanhamentoId: string | null) {
  return useQuery({
    queryKey: ["acompanhamento_resultados", acompanhamentoId],
    enabled: !!acompanhamentoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acompanhamento_resultados")
        .select("*")
        .eq("acompanhamento_id", acompanhamentoId!)
        .order("encontrado_em", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAcompanhamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { pessoa_id: string; cpf_cnpj: string; observacoes?: string; criado_por?: string }) => {
      const { data, error } = await supabase
        .from("acompanhamentos")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acompanhamentos"] }),
  });
}

export function useToggleAcompanhamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("acompanhamentos")
        .update({ ativo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acompanhamentos"] }),
  });
}

export function useDeleteAcompanhamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("acompanhamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acompanhamentos"] }),
  });
}
