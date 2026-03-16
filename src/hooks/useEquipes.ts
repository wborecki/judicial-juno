import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export type EquipeMembroDB = {
  id: string;
  equipe_id: string;
  usuario_id: string;
  peso: number;
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
      return data as EquipeMembroDB[];
    },
  });
}

export function useUserRole() {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.role as string | null;
    },
  });
}

// --- Mutations ---

export function useCreateEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string; tipo: string }) => {
      const { data, error } = await supabase.from("equipes").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipes"] }),
  });
}

export function useUpdateEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<EquipeDB, "nome" | "tipo" | "ativa">> }) => {
      const { error } = await supabase.from("equipes").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipes"] }),
  });
}

export function useDeleteEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete members first
      await supabase.from("equipe_membros").delete().eq("equipe_id", id);
      const { error } = await supabase.from("equipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipes"] });
      qc.invalidateQueries({ queryKey: ["equipe_membros"] });
    },
  });
}

export function useAddEquipeMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { equipe_id: string; usuario_id: string; peso?: number }) => {
      const { data, error } = await supabase.from("equipe_membros").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipe_membros"] }),
  });
}

export function useUpdateEquipeMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, peso }: { id: string; peso: number }) => {
      const { error } = await supabase.from("equipe_membros").update({ peso }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipe_membros"] }),
  });
}

export function useRemoveEquipeMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipe_membros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipe_membros"] }),
  });
}
