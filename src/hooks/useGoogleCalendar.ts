import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GoogleToken = {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id: string | null;
  sync_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export function useGoogleToken() {
  return useQuery({
    queryKey: ["google-token"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("google_tokens")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as GoogleToken | null;
    },
  });
}

export function useDisconnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("google_tokens")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["google-token"] }),
  });
}

export function useToggleGoogleSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sync_enabled }: { id: string; sync_enabled: boolean }) => {
      const { error } = await supabase
        .from("google_tokens")
        .update({ sync_enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["google-token"] }),
  });
}

export function useGoogleCalendarAuth() {
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/google-calendar-auth`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao iniciar autenticação");
      }
      
      const { url: authUrl } = await res.json();
      return authUrl as string;
    },
  });
}

export function useGoogleCalendarSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/google-calendar-sync`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao sincronizar");
      }
      
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-eventos"] });
    },
  });
}
