
-- =============================================
-- Etapa 1: Criar tabela negocios
-- =============================================
CREATE TABLE public.negocios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
  tipo_servico TEXT,
  negocio_status TEXT NOT NULL DEFAULT 'em_andamento',
  valor_proposta NUMERIC,
  valor_fechamento NUMERIC,
  data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to negocios"
  ON public.negocios FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_negocios_updated_at
  BEFORE UPDATE ON public.negocios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrar dados existentes de processos para negocios
INSERT INTO public.negocios (processo_id, pessoa_id, tipo_servico, negocio_status, valor_proposta, valor_fechamento, data_fechamento, data_abertura)
SELECT
  id,
  pessoa_id,
  tipo_servico,
  negocio_status,
  valor_proposta,
  valor_fechamento,
  data_fechamento,
  COALESCE(data_fechamento, created_at)
FROM public.processos
WHERE negocio_status IS NOT NULL;

-- Remover colunas de negócio da tabela processos
ALTER TABLE public.processos DROP COLUMN negocio_status;
ALTER TABLE public.processos DROP COLUMN valor_proposta;
ALTER TABLE public.processos DROP COLUMN valor_fechamento;
ALTER TABLE public.processos DROP COLUMN data_fechamento;
ALTER TABLE public.processos DROP COLUMN tipo_servico;

-- =============================================
-- Etapa 2: Criar tabela contatos
-- =============================================
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'telefone',
  valor TEXT NOT NULL,
  principal BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to contatos"
  ON public.contatos FOR ALL
  USING (true)
  WITH CHECK (true);
