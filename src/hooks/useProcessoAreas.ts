import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AREAS_TRABALHO = ["juridico", "financeiro", "documental", "compliance"] as const;
export type AreaTrabalho = typeof AREAS_TRABALHO[number];

export const AREA_LABELS: Record<AreaTrabalho, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  documental: "Documental",
  compliance: "Compliance",
};

export interface ProcessoArea {
  id: string;
  processo_id: string;
  area: AreaTrabalho;
  concluido: boolean;
  concluido_por: string | null;
  concluido_em: string | null;
  observacoes: string | null;
  created_at: string;
}

export function useProcessoAreas(processoId?: string) {
  return useQuery({
    queryKey: ["processo_areas", processoId],
    enabled: !!processoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processo_areas_trabalho")
        .select("*")
        .eq("processo_id", processoId!);
      if (error) throw error;
      return data as ProcessoArea[];
    },
  });
}

export function useEnsureProcessoAreas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (processoId: string) => {
      // Check existing
      const { data: existing } = await supabase
        .from("processo_areas_trabalho")
        .select("area")
        .eq("processo_id", processoId);

      const existingAreas = (existing ?? []).map((e: any) => e.area);
      const missing = AREAS_TRABALHO.filter(a => !existingAreas.includes(a));

      if (missing.length > 0) {
        const rows = missing.map(area => ({ processo_id: processoId, area }));
        const { error } = await supabase
          .from("processo_areas_trabalho")
          .insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, processoId) => {
      qc.invalidateQueries({ queryKey: ["processo_areas", processoId] });
    },
  });
}

export function useToggleAreaConcluida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, concluido, concluido_por }: { id: string; concluido: boolean; concluido_por?: string }) => {
      const { error } = await supabase
        .from("processo_areas_trabalho")
        .update({
          concluido,
          concluido_por: concluido ? concluido_por ?? null : null,
          concluido_em: concluido ? new Date().toISOString() : null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processo_areas"] });
    },
  });
}

export function useUpdateAreaObservacoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, observacoes }: { id: string; observacoes: string | null }) => {
      const { error } = await supabase
        .from("processo_areas_trabalho")
        .update({ observacoes } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processo_areas"] });
    },
  });
}

// Bulk fetch areas for multiple processos (for the list page)
export function useProcessosAreas(processoIds: string[]) {
  return useQuery({
    queryKey: ["processo_areas_bulk", processoIds.sort().join(",")],
    enabled: processoIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processo_areas_trabalho")
        .select("*")
        .in("processo_id", processoIds);
      if (error) throw error;
      return data as ProcessoArea[];
    },
  });
}
