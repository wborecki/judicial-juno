
-- Create table for internal notes on processes
CREATE TABLE public.processo_notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  criado_por UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processo_notas ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated access (matching existing pattern)
CREATE POLICY "Allow all access to processo_notas"
  ON public.processo_notas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_processo_notas_updated_at
  BEFORE UPDATE ON public.processo_notas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups by processo
CREATE INDEX idx_processo_notas_processo_id ON public.processo_notas(processo_id);
