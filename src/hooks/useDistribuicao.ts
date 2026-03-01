import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Processo } from "./useProcessos";

export type RegraRoteamento = {
  id: string;
  nome: string;
  equipe_id: string;
  criterio_tribunal: string[];
  criterio_natureza: string[];
  criterio_tipo_pagamento: string[];
  ativa: boolean;
  prioridade: number;
  created_at: string;
};

// Processos aptos sem analista
export function useProcessosFila() {
  return useQuery({
    queryKey: ["processos-fila"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*")
        .eq("triagem_resultado", "apto")
        .is("analista_id", null)
        .order("data_captacao", { ascending: false });
      if (error) throw error;
      return data as Processo[];
    },
  });
}

// Processos em análise
export function useProcessosEmAnalise() {
  return useQuery({
    queryKey: ["processos-em-analise"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*")
        .not("analista_id", "is", null)
        .in("pipeline_status", ["distribuido", "em_analise"])
        .order("distribuido_em", { ascending: false });
      if (error) throw error;
      return data as Processo[];
    },
  });
}

// Distribuir processos em lote
export function useDistribuirProcessos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, analista_id, equipe_id }: { ids: string[]; analista_id: string; equipe_id: string }) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("processos")
        .update({
          analista_id,
          equipe_id,
          distribuido_em: now,
          pipeline_status: "distribuido",
        })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processos-fila"] });
      qc.invalidateQueries({ queryKey: ["processos-em-analise"] });
      qc.invalidateQueries({ queryKey: ["processos"] });
      qc.invalidateQueries({ queryKey: ["processos-paginated"] });
    },
  });
}

// Trocar analista
export function useTrocarAnalista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, analista_id }: { id: string; analista_id: string }) => {
      const { error } = await supabase
        .from("processos")
        .update({ analista_id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processos-em-analise"] });
      qc.invalidateQueries({ queryKey: ["processos"] });
      qc.invalidateQueries({ queryKey: ["processos-paginated"] });
      qc.invalidateQueries({ queryKey: ["processo"] });
    },
  });
}

// CRUD regras de roteamento
export function useRegrasRoteamento() {
  return useQuery({
    queryKey: ["regras-roteamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regras_roteamento")
        .select("*")
        .order("prioridade", { ascending: true });
      if (error) throw error;
      return data as RegraRoteamento[];
    },
  });
}

export function useCreateRegra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (regra: Omit<RegraRoteamento, "id" | "created_at">) => {
      const { error } = await supabase.from("regras_roteamento").insert(regra);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regras-roteamento"] }),
  });
}

export function useUpdateRegra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RegraRoteamento> }) => {
      const { error } = await supabase.from("regras_roteamento").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regras-roteamento"] }),
  });
}

export function useDeleteRegra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("regras_roteamento").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regras-roteamento"] }),
  });
}

// Distribuição automática
export function useDistribuicaoAutomatica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ processos, regras, membros }: {
      processos: Processo[];
      regras: RegraRoteamento[];
      membros: { equipe_id: string; usuario_id: string }[];
    }) => {
      const counters: Record<string, number> = {};
      const updates: { id: string; analista_id: string; equipe_id: string }[] = [];

      for (const p of processos) {
        const regra = regras
          .filter(r => r.ativa)
          .sort((a, b) => a.prioridade - b.prioridade)
          .find(r => {
            const matchTribunal = r.criterio_tribunal.length === 0 || r.criterio_tribunal.includes(p.tribunal);
            const matchNatureza = r.criterio_natureza.length === 0 || r.criterio_natureza.includes(p.natureza);
            const matchTipo = r.criterio_tipo_pagamento.length === 0 || r.criterio_tipo_pagamento.includes(p.tipo_pagamento);
            return matchTribunal && matchNatureza && matchTipo;
          });

        if (!regra) continue;

        const equipeMembros = membros.filter(m => m.equipe_id === regra.equipe_id);
        if (equipeMembros.length === 0) continue;

        const key = regra.equipe_id;
        counters[key] = (counters[key] ?? 0);
        const idx = counters[key] % equipeMembros.length;
        counters[key]++;

        updates.push({
          id: p.id,
          analista_id: equipeMembros[idx].usuario_id,
          equipe_id: regra.equipe_id,
        });
      }

      const now = new Date().toISOString();
      for (const u of updates) {
        const { error } = await supabase
          .from("processos")
          .update({
            analista_id: u.analista_id,
            equipe_id: u.equipe_id,
            distribuido_em: now,
            pipeline_status: "distribuido",
          })
          .eq("id", u.id);
        if (error) throw error;
      }

      return updates.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processos-fila"] });
      qc.invalidateQueries({ queryKey: ["processos-em-analise"] });
      qc.invalidateQueries({ queryKey: ["processos"] });
      qc.invalidateQueries({ queryKey: ["processos-paginated"] });
    },
  });
}
