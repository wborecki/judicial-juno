import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MotivoDescarte {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
}

export function useMotivosDescarte() {
  return useQuery({
    queryKey: ["motivos-descarte"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motivos_descarte")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as MotivoDescarte[];
    },
  });
}

export function useAllMotivosDescarte() {
  return useQuery({
    queryKey: ["motivos-descarte-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motivos_descarte")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as MotivoDescarte[];
    },
  });
}

export function useCreateMotivoDescarte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (motivo: { nome: string; descricao?: string }) => {
      const { data, error } = await supabase
        .from("motivos_descarte")
        .insert(motivo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["motivos-descarte"] });
      qc.invalidateQueries({ queryKey: ["motivos-descarte-all"] });
    },
  });
}

export function useUpdateMotivoDescarte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MotivoDescarte> }) => {
      const { data, error } = await supabase
        .from("motivos_descarte")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["motivos-descarte"] });
      qc.invalidateQueries({ queryKey: ["motivos-descarte-all"] });
    },
  });
}
