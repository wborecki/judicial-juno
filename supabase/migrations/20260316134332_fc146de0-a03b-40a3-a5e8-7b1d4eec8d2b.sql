
-- Campos financeiros em negocios
ALTER TABLE public.negocios ADD COLUMN IF NOT EXISTS valor_face numeric;
ALTER TABLE public.negocios ADD COLUMN IF NOT EXISTS desagio_percentual numeric;
ALTER TABLE public.negocios ADD COLUMN IF NOT EXISTS prazo_estimado_recebimento integer;
ALTER TABLE public.negocios ADD COLUMN IF NOT EXISTS score_risco text DEFAULT 'medio';
ALTER TABLE public.negocios ADD COLUMN IF NOT EXISTS status_carteira text DEFAULT null;

-- Tabela contratos_cessao
CREATE TABLE public.contratos_cessao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id uuid NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  processo_id uuid REFERENCES public.processos(id),
  status text NOT NULL DEFAULT 'minuta',
  data_assinatura date,
  data_registro date,
  data_homologacao date,
  valor_cessao numeric,
  observacoes text,
  arquivo_url text,
  arquivo_nome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contratos_cessao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage contratos_cessao"
  ON public.contratos_cessao FOR ALL TO authenticated USING (true) WITH CHECK (true);
