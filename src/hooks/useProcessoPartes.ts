import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessoParte {
  id: string;
  processo_id: string;
  nome: string;
  cpf_cnpj: string | null;
  tipo: string;
  pessoa_id: string | null;
  advogado_oab: string | null;
  created_at: string;
}

export function useProcessoPartes(processoId: string | undefined) {
  return useQuery({
    queryKey: ["processo-partes", processoId],
    queryFn: async () => {
      if (!processoId) return [];
      const { data, error } = await supabase
        .from("processo_partes")
        .select("*")
        .eq("processo_id", processoId)
        .order("tipo", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ProcessoParte[];
    },
    enabled: !!processoId,
  });
}

export function useCreateProcessoParte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (parte: Omit<ProcessoParte, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("processo_partes")
        .insert(parte)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["processo-partes", vars.processo_id] });
    },
  });
}

export function useDeleteProcessoParte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, processoId }: { id: string; processoId: string }) => {
      const { error } = await supabase.from("processo_partes").delete().eq("id", id);
      if (error) throw error;
      return processoId;
    },
    onSuccess: (processoId) => {
      qc.invalidateQueries({ queryKey: ["processo-partes", processoId] });
    },
  });
}
