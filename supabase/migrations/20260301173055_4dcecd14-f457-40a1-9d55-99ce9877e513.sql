
ALTER TABLE public.processo_partes
ADD COLUMN representado_id uuid REFERENCES public.processo_partes(id) ON DELETE SET NULL;
