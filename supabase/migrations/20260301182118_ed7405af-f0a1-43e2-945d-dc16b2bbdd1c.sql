ALTER TABLE public.campos_analise ADD COLUMN entidade text NOT NULL DEFAULT 'processo';

-- Update existing records
UPDATE public.campos_analise SET entidade = 'processo' WHERE entidade = 'processo';

-- Index for filtering by entity
CREATE INDEX idx_campos_analise_entidade ON public.campos_analise (entidade);