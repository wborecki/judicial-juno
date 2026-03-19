import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDispararWebhook } from "@/hooks/useN8nWebhooks";

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
  equipe_id: string | null;
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
    mutationFn: async ({ processoId }: { processoId: string }) => {
      // Check existing
      const { data: existing } = await supabase
        .from("processo_areas_trabalho")
        .select("area")
        .eq("processo_id", processoId);

      const existingAreas = (existing ?? []).map((e: any) => e.area);
      const missing = AREAS_TRABALHO.filter(a => !existingAreas.includes(a));

      if (missing.length > 0) {
        // Fetch global config for auto-assignment
        const { data: configs } = await supabase
          .from("config_areas_equipes")
          .select("area, equipe_id");

        const configMap = new Map<string, string | null>();
        (configs ?? []).forEach((c: any) => configMap.set(c.area, c.equipe_id));

        const rows = missing.map(area => ({
          processo_id: processoId,
          area,
          equipe_id: configMap.get(area) ?? null,
        }));
        const { error } = await supabase
          .from("processo_areas_trabalho")
          .insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, { processoId }) => {
      qc.invalidateQueries({ queryKey: ["processo_areas", processoId] });
    },
  });
}

export function useUpdateAreaEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, equipe_id }: { id: string; equipe_id: string | null }) => {
      const { error } = await supabase
        .from("processo_areas_trabalho")
        .update({ equipe_id } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processo_areas"] });
    },
  });
}

export function useToggleAreaConcluida() {
  const qc = useQueryClient();
  const disparar = useDispararWebhook();
  return useMutation({
    mutationFn: async ({ id, concluido, concluido_por, processo_id }: { id: string; concluido: boolean; concluido_por?: string; processo_id?: string }) => {
      const { error } = await supabase
        .from("processo_areas_trabalho")
        .update({
          concluido,
          concluido_por: concluido ? concluido_por ?? null : null,
          concluido_em: concluido ? new Date().toISOString() : null,
        } as any)
        .eq("id", id);
      if (error) throw error;
      return { concluido, processo_id };
    },
    onSuccess: async ({ concluido, processo_id }) => {
      qc.invalidateQueries({ queryKey: ["processo_areas"] });
      if (concluido && processo_id) {
        disparar.mutate({ evento: "area.concluida", dados: { processo_id } });
        const { data } = await supabase
          .from("processo_areas_trabalho")
          .select("concluido")
          .eq("processo_id", processo_id);
        if (data && data.length > 0 && data.every((a: any) => a.concluido)) {
          disparar.mutate({ evento: "areas.todas_concluidas", dados: { processo_id } });
        }
      }
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
