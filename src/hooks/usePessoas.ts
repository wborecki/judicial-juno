import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PessoaDB = {
  id: string;
  nome: string;
  cpf_cnpj: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  tipo: string;
  created_at: string;
};

export function usePessoas() {
  return useQuery({
    queryKey: ["pessoas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pessoas").select("*").order("nome");
      if (error) throw error;
      return data as PessoaDB[];
    },
  });
}

export function useCreatePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Omit<PessoaDB, "id" | "created_at">> & { nome: string; cpf_cnpj: string }) => {
      const { data, error } = await supabase.from("pessoas").insert(input).select().single();
      if (error) throw error;
      return data as PessoaDB;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pessoas"] });
    },
  });
}

export function useUpdatePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<PessoaDB, "id" | "created_at">> }) => {
      const { error } = await supabase.from("pessoas").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pessoas"] });
      qc.invalidateQueries({ queryKey: ["pessoa"] });
    },
  });
}

export function useDeletePessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete contatos first
      await supabase.from("contatos").delete().eq("pessoa_id", id);
      const { error } = await supabase.from("pessoas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pessoas"] });
    },
  });
}
