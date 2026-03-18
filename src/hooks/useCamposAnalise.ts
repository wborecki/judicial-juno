import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CampoAnalise {
  id: string;
  nome: string;
  tipo: string;
  grupo: string;
  opcoes: string[] | null;
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
  entidade: string;
  created_at: string;
  formula: string | null;
  formato_formula: string | null;
}

export function useCamposAnalise(entidade: string = "processo") {
  return useQuery({
    queryKey: ["campos_analise", entidade],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campos_analise")
        .select("*")
        .eq("ativo", true)
        .eq("entidade", entidade)
        .order("grupo")
        .order("ordem");
      if (error) throw error;
      return data as CampoAnalise[];
    },
  });
}

export function useAllCamposAnalise(entidade: string = "processo") {
  return useQuery({
    queryKey: ["campos_analise", "all", entidade],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campos_analise")
        .select("*")
        .eq("entidade", entidade)
        .order("grupo")
        .order("ordem");
      if (error) throw error;
      return data as CampoAnalise[];
    },
  });
}

export function useCreateCampoAnalise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campo: Omit<CampoAnalise, "id" | "created_at"> & { entidade?: string }) => {
      const { data, error } = await supabase
        .from("campos_analise")
        .insert(campo as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campos_analise"] }),
  });
}

export function useUpdateCampoAnalise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CampoAnalise> }) => {
      const { data, error } = await supabase
        .from("campos_analise")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campos_analise"] }),
  });
}

export function useDeleteCampoAnalise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campos_analise")
        .update({ ativo: false } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campos_analise"] }),
  });
}
