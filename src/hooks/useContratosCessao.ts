import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContratoStatus = "minuta" | "assinado" | "registrado" | "homologado";

export type ContratoCessao = {
  id: string;
  negocio_id: string;
  processo_id: string | null;
  status: string;
  data_assinatura: string | null;
  data_registro: string | null;
  data_homologacao: string | null;
  valor_cessao: number | null;
  observacoes: string | null;
  arquivo_url: string | null;
  arquivo_nome: string | null;
  created_at: string;
  updated_at: string;
};

export function useContratosCessao(negocioId?: string) {
  return useQuery({
    queryKey: ["contratos-cessao", negocioId],
    enabled: !!negocioId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_cessao")
        .select("*")
        .eq("negocio_id", negocioId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContratoCessao[];
    },
  });
}

export function useCreateContrato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contrato: Omit<ContratoCessao, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("contratos_cessao")
        .insert(contrato)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contratos-cessao"] }),
  });
}

export function useUpdateContrato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContratoCessao> & { id: string }) => {
      const { data, error } = await supabase
        .from("contratos_cessao")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contratos-cessao"] }),
  });
}

export function useDeleteContrato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contratos_cessao").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contratos-cessao"] }),
  });
}
