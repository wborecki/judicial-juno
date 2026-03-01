import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessoNota {
  id: string;
  processo_id: string;
  conteudo: string;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
  anexos: any[] | null;
}

export function useProcessoNotas(processoId?: string) {
  return useQuery({
    queryKey: ["processo_notas", processoId],
    enabled: !!processoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processo_notas" as any)
        .select("*")
        .eq("processo_id", processoId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProcessoNota[];
    },
  });
}

export function useCreateProcessoNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nota: { processo_id: string; conteudo: string; anexos?: any[] }) => {
      const { data, error } = await supabase
        .from("processo_notas" as any)
        .insert(nota as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ProcessoNota;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["processo_notas", vars.processo_id] });
    },
  });
}

export function useDeleteProcessoNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, processoId }: { id: string; processoId: string }) => {
      const { error } = await supabase
        .from("processo_notas" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return processoId;
    },
    onSuccess: (processoId) => {
      qc.invalidateQueries({ queryKey: ["processo_notas", processoId] });
    },
  });
}
