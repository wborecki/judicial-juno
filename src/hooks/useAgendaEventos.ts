import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AgendaEvento = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  data_inicio: string;
  data_fim: string | null;
  dia_inteiro: boolean;
  local: string | null;
  cor: string | null;
  prioridade: string;
  status: string;
  processo_id: string | null;
  negocio_id: string | null;
  pessoa_id: string | null;
  responsavel_id: string | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
};

export function useAgendaEventos(start?: string, end?: string) {
  return useQuery({
    queryKey: ["agenda-eventos", start, end],
    queryFn: async () => {
      let q = supabase
        .from("agenda_eventos")
        .select("*")
        .order("data_inicio", { ascending: true });

      if (start) q = q.gte("data_inicio", start);
      if (end) q = q.lte("data_inicio", end);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AgendaEvento[];
    },
  });
}

export function useCreateAgendaEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (evento: Omit<AgendaEvento, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("agenda_eventos")
        .insert(evento)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-eventos"] }),
  });
}

export function useUpdateAgendaEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaEvento> & { id: string }) => {
      const { data, error } = await supabase
        .from("agenda_eventos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-eventos"] }),
  });
}

export function useDeleteAgendaEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_eventos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-eventos"] }),
  });
}
