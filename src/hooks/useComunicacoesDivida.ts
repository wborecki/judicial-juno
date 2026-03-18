import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useComunicacoesDivida(acompanhamentoId: string | null) {
  return useQuery({
    queryKey: ["comunicacoes_divida", acompanhamentoId],
    enabled: !!acompanhamentoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comunicacoes_divida")
        .select("*")
        .eq("acompanhamento_id", acompanhamentoId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateComunicacaoDivida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      acompanhamento_id: string;
      pessoa_id?: string;
      numero_processo: string;
      tribunal?: string;
      valor_credito?: number;
      valor_divida?: number;
      dados_pessoa?: Record<string, string | null | undefined>;
      observacoes?: string;
      criado_por?: string;
    }) => {
      const { data, error } = await supabase
        .from("comunicacoes_divida")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["comunicacoes_divida", data.acompanhamento_id] });
    },
  });
}
