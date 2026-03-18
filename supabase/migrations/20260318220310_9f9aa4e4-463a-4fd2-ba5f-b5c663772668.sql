
CREATE TABLE public.processo_areas_trabalho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  area text NOT NULL,
  concluido boolean NOT NULL DEFAULT false,
  concluido_por uuid REFERENCES public.usuarios(id),
  concluido_em timestamptz,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (processo_id, area)
);

ALTER TABLE public.processo_areas_trabalho ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage processo_areas_trabalho"
  ON public.processo_areas_trabalho
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
