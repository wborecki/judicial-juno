import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EquipeDB = {
  id: string;
  nome: string;
  tipo: string;
  ativa: boolean;
  created_at: string;
};

export type UsuarioDB = {
  id: string;
  nome: string;
  email: string;
  equipe_id: string | null;
  cargo: string;
  avatar_url: string | null;
  ativo: boolean;
  created_at: string;
};

export function useEquipes() {
  return useQuery({
    queryKey: ["equipes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("equipes").select("*").order("nome");
      if (error) throw error;
      return data as EquipeDB[];
    },
  });
}

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usuarios").select("*").order("nome");
      if (error) throw error;
      return data as UsuarioDB[];
    },
  });
}

export function useEquipeMembros() {
  return useQuery({
    queryKey: ["equipe_membros"],
    queryFn: async () => {
      const { data, error } = await supabase.from("equipe_membros").select("*");
      if (error) throw error;
      return data as { id: string; equipe_id: string; usuario_id: string }[];
    },
  });
}
