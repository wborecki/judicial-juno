
CREATE TABLE public.config_areas_equipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL UNIQUE,
  equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.config_areas_equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage config_areas_equipes"
  ON public.config_areas_equipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.config_areas_equipes (area) VALUES
  ('juridico'),
  ('financeiro'),
  ('documental'),
  ('compliance');
