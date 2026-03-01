
-- Add anexos (attachments) column to processo_notas
ALTER TABLE public.processo_notas
ADD COLUMN anexos jsonb DEFAULT '[]'::jsonb;

-- Create processo_historico table for tracking all actions
CREATE TABLE public.processo_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id),
  usuario_nome TEXT,
  tipo TEXT NOT NULL DEFAULT 'alteracao',
  descricao TEXT NOT NULL,
  campo TEXT,
  valor_anterior TEXT,
  valor_novo TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processo_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to processo_historico"
ON public.processo_historico
FOR ALL
USING (true)
WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_processo_historico_processo_id ON public.processo_historico(processo_id);
CREATE INDEX idx_processo_historico_created_at ON public.processo_historico(created_at DESC);

-- Enable realtime for historico
ALTER PUBLICATION supabase_realtime ADD TABLE public.processo_historico;
