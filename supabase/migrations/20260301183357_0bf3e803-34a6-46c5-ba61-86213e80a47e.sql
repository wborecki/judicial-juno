
-- Tabela de campos personalizados para negócios (mesma estrutura de processo_campos_valores)
CREATE TABLE public.negocio_campos_valores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id uuid NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  campo_id uuid NOT NULL REFERENCES public.campos_analise(id) ON DELETE CASCADE,
  valor text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(negocio_id, campo_id)
);

ALTER TABLE public.negocio_campos_valores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to negocio_campos_valores"
  ON public.negocio_campos_valores FOR ALL
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_negocio_campos_valores_updated_at
  BEFORE UPDATE ON public.negocio_campos_valores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
