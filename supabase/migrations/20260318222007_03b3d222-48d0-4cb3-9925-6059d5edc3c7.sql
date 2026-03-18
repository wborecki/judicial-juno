ALTER TABLE public.campos_analise 
  ADD COLUMN formula text DEFAULT NULL,
  ADD COLUMN formato_formula text DEFAULT 'numero';