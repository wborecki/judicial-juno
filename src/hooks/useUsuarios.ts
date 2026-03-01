import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UsuarioComRole = {
  id: string;
  nome: string;
  email: string;
  equipe_id: string | null;
  cargo: string;
  avatar_url: string | null;
  ativo: boolean;
  created_at: string;
  role: "admin" | "analista" | "usuario" | null;
};

async function callManageUsers(action: string, payload: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("manage-users", {
    body: { action, ...payload },
  });
  if (res.error) throw new Error(res.error.message || "Erro ao gerenciar usuários");
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

export function useUsuariosComRoles() {
  return useQuery({
    queryKey: ["usuarios-com-roles"],
    queryFn: () => callManageUsers("list") as Promise<UsuarioComRole[]>,
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; nome: string; cargo?: string; role?: string; equipe_id?: string | null }) =>
      callManageUsers("invite", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios-com-roles"] }),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      user_id: string;
      nome?: string;
      cargo?: string;
      ativo?: boolean;
      equipe_id?: string | null;
      role?: string;
    }) => callManageUsers("update", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios-com-roles"] }),
  });
}
