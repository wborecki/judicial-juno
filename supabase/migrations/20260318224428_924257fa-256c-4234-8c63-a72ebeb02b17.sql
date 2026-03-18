
-- Add "Apto para Análise" gate fields to processos
ALTER TABLE public.processos
  ADD COLUMN IF NOT EXISTS apto_analise boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS apto_analise_por uuid,
  ADD COLUMN IF NOT EXISTS apto_analise_em timestamp with time zone;

-- Add equipe assignment to each area
ALTER TABLE public.processo_areas_trabalho
  ADD COLUMN IF NOT EXISTS equipe_id uuid REFERENCES public.equipes(id);
