
ALTER TABLE public.processos ADD COLUMN natureza_credito TEXT NULL DEFAULT NULL;
COMMENT ON COLUMN public.processos.natureza_credito IS 'Natureza do crédito: alimentar ou comum';
