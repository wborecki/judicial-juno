
-- Create acompanhamentos table
CREATE TABLE public.acompanhamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  cpf_cnpj text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  ultima_verificacao timestamptz,
  total_processos_encontrados integer NOT NULL DEFAULT 0,
  observacoes text,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create acompanhamento_resultados table
CREATE TABLE public.acompanhamento_resultados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acompanhamento_id uuid NOT NULL REFERENCES public.acompanhamentos(id) ON DELETE CASCADE,
  numero_processo text,
  tribunal text,
  dados_json jsonb DEFAULT '{}'::jsonb,
  vinculado boolean NOT NULL DEFAULT false,
  processo_id uuid REFERENCES public.processos(id) ON DELETE SET NULL,
  encontrado_em timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.acompanhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento_resultados ENABLE ROW LEVEL SECURITY;

-- RLS policies for acompanhamentos
CREATE POLICY "Authenticated users can manage acompanhamentos"
  ON public.acompanhamentos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- RLS policies for acompanhamento_resultados
CREATE POLICY "Authenticated users can manage acompanhamento_resultados"
  ON public.acompanhamento_resultados FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Updated_at trigger for acompanhamentos
CREATE TRIGGER update_acompanhamentos_updated_at
  BEFORE UPDATE ON public.acompanhamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
