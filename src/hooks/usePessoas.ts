import { useQuery } from "@tanstack/react-query";
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
