import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConfigAreaEquipe {
  id: string;
  area: string;
  equipe_id: string | null;
  created_at: string;
}

export function useConfigAreasEquipes() {
  return useQuery({
    queryKey: ["config_areas_equipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_areas_equipes")
        .select("*")
        .order("area");
      if (error) throw error;
      return data as ConfigAreaEquipe[];
    },
  });
}

export function useUpdateConfigAreaEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, equipe_id }: { id: string; equipe_id: string | null }) => {
      const { error } = await supabase
        .from("config_areas_equipes")
        .update({ equipe_id } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["config_areas_equipes"] });
    },
  });
}
