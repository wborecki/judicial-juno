
CREATE TABLE public.comunicacoes_divida (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acompanhamento_id uuid NOT NULL REFERENCES public.acompanhamentos(id) ON DELETE CASCADE,
  pessoa_id uuid REFERENCES public.pessoas(id),
  numero_processo text NOT NULL,
  tribunal text,
  valor_credito numeric,
  valor_divida numeric,
  dados_pessoa jsonb DEFAULT '{}'::jsonb,
  observacoes text,
  status text NOT NULL DEFAULT 'pendente'::text,
  enviado_em timestamptz,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comunicacoes_divida ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage comunicacoes_divida"
  ON public.comunicacoes_divida
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
