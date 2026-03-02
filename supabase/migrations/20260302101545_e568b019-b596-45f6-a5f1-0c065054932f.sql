
-- Create agenda_eventos table
CREATE TABLE public.agenda_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'tarefa', -- reuniao, audiencia, prazo, tarefa
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  dia_inteiro BOOLEAN NOT NULL DEFAULT false,
  local TEXT,
  cor TEXT DEFAULT '#3b82f6',
  prioridade TEXT NOT NULL DEFAULT 'media', -- baixa, media, alta, urgente
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, concluido, cancelado
  processo_id UUID REFERENCES public.processos(id) ON DELETE SET NULL,
  negocio_id UUID REFERENCES public.negocios(id) ON DELETE SET NULL,
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow all access to agenda_eventos"
ON public.agenda_eventos
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_agenda_eventos_updated_at
BEFORE UPDATE ON public.agenda_eventos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for date queries
CREATE INDEX idx_agenda_eventos_data_inicio ON public.agenda_eventos(data_inicio);
CREATE INDEX idx_agenda_eventos_responsavel ON public.agenda_eventos(responsavel_id);
CREATE INDEX idx_agenda_eventos_processo ON public.agenda_eventos(processo_id);
CREATE INDEX idx_agenda_eventos_negocio ON public.agenda_eventos(negocio_id);
