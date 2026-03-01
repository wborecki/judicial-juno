-- Tabela de motivos de descarte (like CRM lost reasons)
CREATE TABLE public.motivos_descarte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.motivos_descarte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to motivos_descarte"
  ON public.motivos_descarte
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add motivo_descarte_id to processos for structured reference
ALTER TABLE public.processos ADD COLUMN motivo_descarte_id UUID REFERENCES public.motivos_descarte(id);

-- Seed initial motivos
INSERT INTO public.motivos_descarte (nome, descricao) VALUES
  ('Sem trânsito em julgado', 'Processo ainda não transitou em julgado'),
  ('Valor abaixo do mínimo', 'Valor estimado abaixo do mínimo operacional'),
  ('Processo suspenso', 'Processo com andamento suspenso ou paralisado'),
  ('Parte não localizada', 'Não foi possível localizar a parte autora'),
  ('Documentação insuficiente', 'Faltam documentos essenciais para análise'),
  ('Risco jurídico alto', 'Análise indica risco jurídico elevado'),
  ('Duplicidade', 'Processo já captado ou duplicado no sistema'),
  ('Outro', 'Motivo não listado');