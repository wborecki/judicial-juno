import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentoModelo {
  id: string;
  nome: string;
  descricao: string | null;
  clicksign_template_key: string | null;
  arquivo_url: string | null;
  variaveis: { nome: string; tipo: string }[];
  ativo: boolean;
  created_at: string;
}

export function useDocumentoModelos() {
  return useQuery({
    queryKey: ["documento-modelos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documento_modelos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DocumentoModelo[];
    },
  });
}

export function useCreateModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (modelo: Omit<DocumentoModelo, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("documento_modelos")
        .insert(modelo as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documento-modelos"] }),
  });
}

export function useUpdateModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocumentoModelo> & { id: string }) => {
      const { error } = await supabase
        .from("documento_modelos")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documento-modelos"] }),
  });
}

export function useDeleteModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("documento_modelos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documento-modelos"] }),
  });
}
