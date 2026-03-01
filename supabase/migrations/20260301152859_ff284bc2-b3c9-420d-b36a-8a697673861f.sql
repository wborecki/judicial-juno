
-- Add new columns to processos
ALTER TABLE public.processos
  ADD COLUMN IF NOT EXISTS vara_comarca text,
  ADD COLUMN IF NOT EXISTS classe_fase text,
  ADD COLUMN IF NOT EXISTS triagem_motivo_inaptidao text;

-- Add advogado_oab to processo_partes
ALTER TABLE public.processo_partes
  ADD COLUMN IF NOT EXISTS advogado_oab text;

-- Add documento_id and resumo to processo_andamentos
ALTER TABLE public.processo_andamentos
  ADD COLUMN IF NOT EXISTS documento_id uuid REFERENCES public.processo_documentos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resumo text;
