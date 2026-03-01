import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PipelineEtapa = {
  id: string;
  nome: string;
  cor: string;
};

export type NegocioPipeline = {
  id: string;
  nome: string;
  etapas: PipelineEtapa[];
  padrao: boolean;
  created_at: string;
};

export function useNegocioPipelines() {
  return useQuery({
    queryKey: ["negocio-pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("negocio_pipelines")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        etapas: (typeof p.etapas === "string" ? JSON.parse(p.etapas) : p.etapas) as PipelineEtapa[],
      })) as NegocioPipeline[];
    },
  });
}

export function useDefaultPipeline() {
  return useQuery({
    queryKey: ["negocio-pipeline-default"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("negocio_pipelines")
        .select("*")
        .eq("padrao", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        etapas: (typeof data.etapas === "string" ? JSON.parse(data.etapas) : data.etapas) as PipelineEtapa[],
      } as NegocioPipeline;
    },
  });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: { nome: string; etapas: PipelineEtapa[]; padrao?: boolean }) => {
      const { data, error } = await supabase
        .from("negocio_pipelines")
        .insert({ nome: pipeline.nome, etapas: pipeline.etapas as any, padrao: pipeline.padrao ?? false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["negocio-pipelines"] }),
  });
}

export function useUpdatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<{ nome: string; etapas: PipelineEtapa[]; padrao: boolean }> }) => {
      const { data, error } = await supabase
        .from("negocio_pipelines")
        .update({ ...updates, etapas: updates.etapas as any })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["negocio-pipelines"] });
      qc.invalidateQueries({ queryKey: ["negocio-pipeline-default"] });
    },
  });
}
