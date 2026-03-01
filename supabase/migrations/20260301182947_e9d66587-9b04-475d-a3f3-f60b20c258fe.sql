
-- Sprint 1: Adicionar colunas à tabela negocios
ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS pipeline_etapa text NOT NULL DEFAULT 'qualificacao',
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS motivo_perda text,
  ADD COLUMN IF NOT EXISTS prioridade text NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS ordem_kanban integer NOT NULL DEFAULT 0;

-- Criar tabela negocio_pipelines
CREATE TABLE public.negocio_pipelines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  etapas jsonb NOT NULL DEFAULT '[]'::jsonb,
  padrao boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.negocio_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to negocio_pipelines"
  ON public.negocio_pipelines FOR ALL
  USING (true) WITH CHECK (true);

-- Criar tabela negocio_atividades
CREATE TABLE public.negocio_atividades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id uuid NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'nota',
  descricao text,
  criado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.negocio_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to negocio_atividades"
  ON public.negocio_atividades FOR ALL
  USING (true) WITH CHECK (true);

-- Seed pipeline padrão
INSERT INTO public.negocio_pipelines (nome, etapas, padrao) VALUES (
  'Pipeline Padrão',
  '[
    {"id": "qualificacao", "nome": "Qualificação", "cor": "#3b82f6"},
    {"id": "proposta", "nome": "Proposta", "cor": "#f59e0b"},
    {"id": "negociacao", "nome": "Negociação", "cor": "#8b5cf6"},
    {"id": "fechamento", "nome": "Fechamento", "cor": "#10b981"}
  ]'::jsonb,
  true
);
