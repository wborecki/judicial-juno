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
  entidade: string; // 'processo' | 'negocio'
  criterio_tipo_servico: string[];
  criterio_valor_min: number | null;
  criterio_valor_max: number | null;
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
export function useRegrasRoteamento(entidade?: string) {
  return useQuery({
    queryKey: ["regras-roteamento", entidade],
    queryFn: async () => {
      let query = supabase
        .from("regras_roteamento")
        .select("*")
        .order("prioridade", { ascending: true });
      if (entidade) {
        query = query.eq("entidade", entidade);
      }
      const { data, error } = await query;
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

type MembroComPeso = { equipe_id: string; usuario_id: string; peso: number };

// Distribuição automática com pesos
export function useDistribuicaoAutomatica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ processos, regras, membros }: {
      processos: Processo[];
      regras: RegraRoteamento[];
      membros: MembroComPeso[];
    }) => {
      // Track current workload per analyst
      const { data: currentProcessos } = await supabase
        .from("processos")
        .select("analista_id")
        .not("analista_id", "is", null)
        .in("pipeline_status", ["distribuido", "em_analise"]);

      const workload: Record<string, number> = {};
      (currentProcessos ?? []).forEach(p => {
        if (p.analista_id) workload[p.analista_id] = (workload[p.analista_id] ?? 0) + 1;
      });

      const updates: { id: string; analista_id: string; equipe_id: string }[] = [];

      // Check for conflicting rules (same criteria matching multiple rules)
      const activeRegras = regras.filter(r => r.ativa && r.entidade === "processo").sort((a, b) => a.prioridade - b.prioridade);

      for (const p of processos) {
        // Find first matching rule (by priority)
        const regra = activeRegras.find(r => {
          const matchTribunal = r.criterio_tribunal.length === 0 || r.criterio_tribunal.includes(p.tribunal);
          const matchNatureza = r.criterio_natureza.length === 0 || r.criterio_natureza.includes(p.natureza);
          const matchTipo = r.criterio_tipo_pagamento.length === 0 || r.criterio_tipo_pagamento.includes(p.tipo_pagamento);
          return matchTribunal && matchNatureza && matchTipo;
        });

        if (!regra) continue;

        const equipeMembros = membros.filter(m => m.equipe_id === regra.equipe_id);
        if (equipeMembros.length === 0) continue;

        // Weighted distribution: pick member with lowest (workload / peso)
        // Lower ratio = should receive more work
        let bestMember = equipeMembros[0];
        let bestScore = Infinity;

        for (const m of equipeMembros) {
          const load = workload[m.usuario_id] ?? 0;
          const peso = m.peso || 100;
          const score = load / (peso / 100); // normalized: more peso = lower score
          if (score < bestScore) {
            bestScore = score;
            bestMember = m;
          }
        }

        updates.push({
          id: p.id,
          analista_id: bestMember.usuario_id,
          equipe_id: regra.equipe_id,
        });

        // Update local workload tracker
        workload[bestMember.usuario_id] = (workload[bestMember.usuario_id] ?? 0) + 1;
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

// Check for conflicting routing rules
export function useCheckConflicts(regras: RegraRoteamento[] | undefined) {
  if (!regras) return [];
  const active = regras.filter(r => r.ativa);
  const conflicts: { ruleA: string; ruleB: string; overlap: string }[] = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a.entidade !== b.entidade) continue;

      const overlapTrib = a.criterio_tribunal.length === 0 || b.criterio_tribunal.length === 0 ||
        a.criterio_tribunal.some(t => b.criterio_tribunal.includes(t));
      const overlapNat = a.criterio_natureza.length === 0 || b.criterio_natureza.length === 0 ||
        a.criterio_natureza.some(n => b.criterio_natureza.includes(n));
      const overlapTipo = a.criterio_tipo_pagamento.length === 0 || b.criterio_tipo_pagamento.length === 0 ||
        a.criterio_tipo_pagamento.some(t => b.criterio_tipo_pagamento.includes(t));

      if (overlapTrib && overlapNat && overlapTipo) {
        const overlaps: string[] = [];
        if (a.criterio_tribunal.length > 0 && b.criterio_tribunal.length > 0)
          overlaps.push("tribunal: " + a.criterio_tribunal.filter(t => b.criterio_tribunal.includes(t)).join(", "));
        if (a.criterio_natureza.length > 0 && b.criterio_natureza.length > 0)
          overlaps.push("natureza: " + a.criterio_natureza.filter(n => b.criterio_natureza.includes(n)).join(", "));
        conflicts.push({ ruleA: a.nome, ruleB: b.nome, overlap: overlaps.join("; ") || "critérios amplos" });
      }
    }
  }
  return conflicts;
}
