
-- Modelos de documentos reutilizáveis
CREATE TABLE public.documento_modelos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  clicksign_template_key text,
  arquivo_url text,
  variaveis jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documento_modelos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage documento_modelos"
  ON public.documento_modelos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Envios de documentos para assinatura
CREATE TABLE public.documento_envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id uuid REFERENCES public.documento_modelos(id),
  negocio_id uuid REFERENCES public.negocios(id),
  processo_id uuid REFERENCES public.processos(id),
  contrato_id uuid REFERENCES public.contratos_cessao(id),
  clicksign_envelope_id text,
  clicksign_document_key text,
  status text NOT NULL DEFAULT 'rascunho',
  dados_variaveis jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documento_envios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage documento_envios"
  ON public.documento_envios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Signatários de cada envio
CREATE TABLE public.documento_envio_signatarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envio_id uuid NOT NULL REFERENCES public.documento_envios(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL,
  cpf text,
  telefone text,
  papel text NOT NULL DEFAULT 'sign',
  clicksign_signer_key text,
  status text NOT NULL DEFAULT 'pendente',
  assinado_em timestamptz
);

ALTER TABLE public.documento_envio_signatarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage documento_envio_signatarios"
  ON public.documento_envio_signatarios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
