
-- Table: campos_analise (configurable analysis fields)
CREATE TABLE public.campos_analise (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  grupo TEXT NOT NULL DEFAULT 'Geral',
  opcoes JSONB DEFAULT '[]'::jsonb,
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campos_analise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to campos_analise" ON public.campos_analise FOR ALL USING (true) WITH CHECK (true);

-- Table: processo_campos_valores (field values per process)
CREATE TABLE public.processo_campos_valores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  campo_id UUID NOT NULL REFERENCES public.campos_analise(id) ON DELETE CASCADE,
  valor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(processo_id, campo_id)
);

ALTER TABLE public.processo_campos_valores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to processo_campos_valores" ON public.processo_campos_valores FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_processo_campos_valores_processo ON public.processo_campos_valores(processo_id);
CREATE INDEX idx_processo_campos_valores_campo ON public.processo_campos_valores(campo_id);
CREATE INDEX idx_campos_analise_ativo_ordem ON public.campos_analise(ativo, ordem);

-- Trigger for updated_at
CREATE TRIGGER update_processo_campos_valores_updated_at
  BEFORE UPDATE ON public.processo_campos_valores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
