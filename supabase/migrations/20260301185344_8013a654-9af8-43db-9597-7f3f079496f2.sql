
CREATE TABLE public.regras_roteamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id),
  criterio_tribunal JSONB NOT NULL DEFAULT '[]'::jsonb,
  criterio_natureza JSONB NOT NULL DEFAULT '[]'::jsonb,
  criterio_tipo_pagamento JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativa BOOLEAN NOT NULL DEFAULT true,
  prioridade INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.regras_roteamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to regras_roteamento"
ON public.regras_roteamento
FOR ALL
USING (true)
WITH CHECK (true);
