
-- Tabela tipos_atividade
CREATE TABLE public.tipos_atividade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL,
  icone text NOT NULL DEFAULT 'StickyNote',
  cor text NOT NULL DEFAULT '#3b82f6',
  entidade text NOT NULL DEFAULT 'agenda',
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.tipos_atividade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tipos_atividade"
  ON public.tipos_atividade FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage tipos_atividade"
  ON public.tipos_atividade FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed: Agenda
INSERT INTO public.tipos_atividade (nome, slug, icone, cor, entidade, ordem) VALUES
  ('Tarefa', 'tarefa', 'CheckSquare', '#3b82f6', 'agenda', 1),
  ('Reunião', 'reuniao', 'Users', '#8b5cf6', 'agenda', 2),
  ('Contato com Credor', 'contato_credor', 'Phone', '#10b981', 'agenda', 3),
  ('Follow-up', 'followup', 'RefreshCw', '#f59e0b', 'agenda', 4),
  ('Análise de Processo', 'analise_processo', 'FileSearch', '#6366f1', 'agenda', 5),
  ('Assinatura/Contrato', 'assinatura_contrato', 'FileSignature', '#ec4899', 'agenda', 6);

-- Seed: Negócio
INSERT INTO public.tipos_atividade (nome, slug, icone, cor, entidade, ordem) VALUES
  ('Nota', 'nota', 'StickyNote', '#f59e0b', 'negocio', 1),
  ('Ligação', 'ligacao', 'Phone', '#3b82f6', 'negocio', 2),
  ('E-mail', 'email', 'Mail', '#8b5cf6', 'negocio', 3),
  ('Reunião', 'reuniao', 'Users', '#10b981', 'negocio', 4),
  ('Tarefa', 'tarefa', 'CheckSquare', '#6366f1', 'negocio', 5),
  ('Proposta Enviada', 'proposta_enviada', 'Send', '#ec4899', 'negocio', 6),
  ('Contrato', 'contrato', 'FileText', '#14b8a6', 'negocio', 7);

-- Adicionar google_event_id na agenda_eventos
ALTER TABLE public.agenda_eventos ADD COLUMN IF NOT EXISTS google_event_id text;

-- Tabela google_tokens
CREATE TABLE public.google_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  calendar_id text DEFAULT 'primary',
  sync_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own google_tokens"
  ON public.google_tokens FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
