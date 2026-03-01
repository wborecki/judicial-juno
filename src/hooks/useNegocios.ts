import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NegocioDB = {
  id: string;
  processo_id: string;
  pessoa_id: string | null;
  tipo_servico: string | null;
  negocio_status: string;
  valor_proposta: number | null;
  valor_fechamento: number | null;
  data_abertura: string;
  data_fechamento: string | null;
  responsavel_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export function useNegocios(processoId?: string) {
  return useQuery({
    queryKey: ["negocios", processoId],
    queryFn: async () => {
      let query = supabase.from("negocios").select("*").order("created_at", { ascending: false });
      if (processoId) {
        query = query.eq("processo_id", processoId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as NegocioDB[];
    },
  });
}

export function useCreateNegocio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (negocio: Omit<NegocioDB, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("negocios").insert(negocio).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocios"] });
    },
  });
}

export function useUpdateNegocio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NegocioDB> }) => {
      const { data, error } = await supabase.from("negocios").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negocios"] });
    },
  });
}
