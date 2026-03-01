import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessoDocumento {
  id: string;
  processo_id: string;
  nome: string;
  arquivo_url: string;
  arquivo_nome: string;
  tamanho: number | null;
  tipo_documento: string;
  criado_por: string | null;
  created_at: string;
}

export function useProcessoDocumentos(processoId: string | undefined) {
  return useQuery({
    queryKey: ["processo-documentos", processoId],
    queryFn: async () => {
      if (!processoId) return [];
      const { data, error } = await supabase
        .from("processo_documentos")
        .select("*")
        .eq("processo_id", processoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProcessoDocumento[];
    },
    enabled: !!processoId,
  });
}

export function useCreateProcessoDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Omit<ProcessoDocumento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("processo_documentos")
        .insert(doc)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["processo-documentos", vars.processo_id] });
    },
  });
}

export function useDeleteProcessoDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, processoId, arquivoUrl }: { id: string; processoId: string; arquivoUrl: string }) => {
      // Extract path from URL to delete from storage
      const url = new URL(arquivoUrl);
      const pathParts = url.pathname.split("/storage/v1/object/public/processo-documentos/");
      if (pathParts[1]) {
        await supabase.storage.from("processo-documentos").remove([pathParts[1]]);
      }
      const { error } = await supabase.from("processo_documentos").delete().eq("id", id);
      if (error) throw error;
      return processoId;
    },
    onSuccess: (processoId) => {
      qc.invalidateQueries({ queryKey: ["processo-documentos", processoId] });
    },
  });
}

export async function uploadProcessoDocumento(processoId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${processoId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("processo-documentos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("processo-documentos").getPublicUrl(path);
  return { url: data.publicUrl, path };
}
