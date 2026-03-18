import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDispararWebhook } from "@/hooks/useN8nWebhooks";

export type NegocioWithRelations = {
  id: string;
  processo_id: string | null;
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
  pipeline_etapa: string;
  titulo: string | null;
  motivo_perda: string | null;
  prioridade: string;
  ordem_kanban: number;
  processos: { numero_processo: string } | null;
  pessoas: { nome: string; cpf_cnpj: string } | null;
  usuarios: { nome: string } | null;
};

export type NegocioInsert = {
  processo_id?: string | null;
  pessoa_id?: string | null;
  tipo_servico?: string | null;
  negocio_status?: string;
  valor_proposta?: number | null;
  valor_fechamento?: number | null;
  data_abertura?: string;
  data_fechamento?: string | null;
  responsavel_id?: string | null;
  observacoes?: string | null;
  pipeline_etapa?: string;
  titulo?: string | null;
  motivo_perda?: string | null;
  prioridade?: string;
  ordem_kanban?: number;
};

export function useNegocios(processoId?: string) {
  return useQuery({
    queryKey: ["negocios", processoId],
    queryFn: async () => {
      let query = supabase
        .from("negocios")
        .select("*, processos(numero_processo), pessoas(nome, cpf_cnpj), usuarios!negocios_responsavel_id_fkey(nome)")
        .order("created_at", { ascending: false });
      if (processoId) {
        query = query.eq("processo_id", processoId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as NegocioWithRelations[];
    },
  });
}

export function useNegocio(id: string | undefined) {
  return useQuery({
    queryKey: ["negocio", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const { data, error } = await supabase
        .from("negocios")
        .select("*, processos(numero_processo), pessoas(nome, cpf_cnpj), usuarios!negocios_responsavel_id_fkey(nome)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as NegocioWithRelations | null;
    },
    enabled: !!id,
  });
}

export function useCreateNegocio() {
  const queryClient = useQueryClient();
  const disparar = useDispararWebhook();
  return useMutation({
    mutationFn: async (negocio: NegocioInsert) => {
      const { data, error } = await supabase.from("negocios").insert(negocio).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["negocios"] });
      disparar.mutate({ evento: "negocio.criado", dados: { negocio_id: data.id, titulo: data.titulo } });
    },
  });
}

export function useUpdateNegocio() {
  const queryClient = useQueryClient();
  const disparar = useDispararWebhook();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NegocioInsert> }) => {
      const { data, error } = await supabase.from("negocios").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return { data, updates };
    },
    onSuccess: ({ data, updates }) => {
      queryClient.invalidateQueries({ queryKey: ["negocios"] });
      queryClient.invalidateQueries({ queryKey: ["negocio", data.id] });
      if (updates.negocio_status === "ganho") {
        disparar.mutate({ evento: "negocio.ganho", dados: { negocio_id: data.id } });
      } else if (updates.negocio_status === "perdido") {
        disparar.mutate({ evento: "negocio.perdido", dados: { negocio_id: data.id } });
      }
    },
  });
}
