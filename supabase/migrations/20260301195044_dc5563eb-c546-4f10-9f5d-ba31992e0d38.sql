
-- Junction table: multiple teams per routing rule with weights
CREATE TABLE public.regra_equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id UUID NOT NULL REFERENCES public.regras_roteamento(id) ON DELETE CASCADE,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  peso INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(regra_id, equipe_id)
);

-- Enable RLS
ALTER TABLE public.regra_equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to regra_equipes"
ON public.regra_equipes
FOR ALL
USING (true)
WITH CHECK (true);

-- Migrate existing data: copy equipe_id from regras_roteamento into the new table
INSERT INTO public.regra_equipes (regra_id, equipe_id, peso)
SELECT id, equipe_id, 100
FROM public.regras_roteamento
WHERE equipe_id IS NOT NULL;
