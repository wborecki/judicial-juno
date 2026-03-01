import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContatoDB = {
  id: string;
  pessoa_id: string;
  tipo: string;
  valor: string;
  principal: boolean;
  observacoes: string | null;
  created_at: string;
};

export function useContatos(pessoaId?: string) {
  return useQuery({
    queryKey: ["contatos", pessoaId],
    queryFn: async () => {
      if (!pessoaId) return [];
      const { data, error } = await supabase
        .from("contatos")
        .select("*")
        .eq("pessoa_id", pessoaId)
        .order("principal", { ascending: false });
      if (error) throw error;
      return data as ContatoDB[];
    },
    enabled: !!pessoaId,
  });
}

export function useCreateContato() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contato: Omit<ContatoDB, "id" | "created_at">) => {
      const { data, error } = await supabase.from("contatos").insert(contato).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contatos", data.pessoa_id] });
    },
  });
}
