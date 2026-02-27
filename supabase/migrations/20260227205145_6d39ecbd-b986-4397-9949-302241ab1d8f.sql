
-- =============================================
-- TABELA: pessoas
-- =============================================
CREATE TABLE public.pessoas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  uf TEXT,
  tipo TEXT NOT NULL DEFAULT 'autor' CHECK (tipo IN ('autor', 'reu', 'advogado', 'terceiro')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to pessoas" ON public.pessoas FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TABELA: equipes
-- =============================================
CREATE TABLE public.equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('analise_rpv', 'analise_precatorio', 'financeiro', 'comercial', 'juridico')),
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to equipes" ON public.equipes FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TABELA: usuarios
-- =============================================
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  equipe_id UUID REFERENCES public.equipes(id),
  cargo TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TABELA: equipe_membros (N:N)
-- =============================================
CREATE TABLE public.equipe_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  UNIQUE(equipe_id, usuario_id)
);

ALTER TABLE public.equipe_membros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to equipe_membros" ON public.equipe_membros FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TABELA: processos (unificada - lead + negócio)
-- =============================================
CREATE TABLE public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo TEXT NOT NULL,
  tribunal TEXT NOT NULL,
  natureza TEXT NOT NULL CHECK (natureza IN ('Cível', 'Trabalhista', 'Federal', 'Previdenciário', 'Tributário')),
  tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('RPV', 'Precatório')),
  status_processo INTEGER NOT NULL DEFAULT 1 CHECK (status_processo BETWEEN 1 AND 4),
  transito_julgado BOOLEAN NOT NULL DEFAULT false,
  parte_autora TEXT NOT NULL,
  parte_re TEXT NOT NULL,
  valor_estimado NUMERIC,
  data_distribuicao DATE,
  data_captacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  triagem_resultado TEXT DEFAULT 'pendente' CHECK (triagem_resultado IN ('pendente', 'apto', 'descartado', 'reanálise')),
  triagem_observacoes TEXT,
  triagem_data TIMESTAMP WITH TIME ZONE,
  triagem_por UUID REFERENCES public.usuarios(id),
  pipeline_status TEXT NOT NULL DEFAULT 'captado' CHECK (pipeline_status IN ('captado', 'triagem', 'distribuido', 'em_analise', 'precificado', 'comercial', 'ganho', 'perdido')),
  pessoa_id UUID REFERENCES public.pessoas(id),
  equipe_id UUID REFERENCES public.equipes(id),
  analista_id UUID REFERENCES public.usuarios(id),
  distribuido_em TIMESTAMP WITH TIME ZONE,
  distribuido_por UUID REFERENCES public.usuarios(id),
  valor_precificado NUMERIC,
  precificacao_data TIMESTAMP WITH TIME ZONE,
  precificado_por UUID REFERENCES public.usuarios(id),
  tipo_servico TEXT CHECK (tipo_servico IN ('compra_credito', 'compensacao_tributaria', 'honorarios', 'cessao_direitos')),
  valor_proposta NUMERIC,
  valor_fechamento NUMERIC,
  data_fechamento TIMESTAMP WITH TIME ZONE,
  negocio_status TEXT CHECK (negocio_status IN ('em_andamento', 'ganho', 'perdido')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to processos" ON public.processos FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_processos_updated_at
BEFORE UPDATE ON public.processos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO public.pessoas (id, nome, cpf_cnpj, email, telefone, endereco, cidade, uf, tipo) VALUES
  ('a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'Maria Silva Santos', '123.456.789-00', 'maria@email.com', '(11) 99999-0001', 'Rua das Flores, 123', 'São Paulo', 'SP', 'autor'),
  ('b2c3d4e5-f6a7-4901-bcde-f12345678901', 'João Pedro Oliveira', '234.567.890-11', 'joao@email.com', '(21) 98888-0002', 'Av. Brasil, 456', 'Rio de Janeiro', 'RJ', 'autor'),
  ('c3d4e5f6-a7b8-4012-cdef-123456789012', 'Ana Carolina Lima', '345.678.901-22', 'ana@email.com', '(31) 97777-0003', 'Rua Minas, 789', 'Belo Horizonte', 'MG', 'autor'),
  ('d4e5f6a7-b8c9-4123-defa-234567890123', 'Carlos Eduardo Souza', '456.789.012-33', 'carlos@email.com', '(41) 96666-0004', 'Rua Paraná, 321', 'Curitiba', 'PR', 'autor'),
  ('e5f6a7b8-c9d0-4234-efab-345678901234', 'Fernanda Costa Reis', '567.890.123-44', 'fernanda@email.com', '(51) 95555-0005', 'Av. Farroupilha, 654', 'Porto Alegre', 'RS', 'autor'),
  ('f6a7b8c9-d0e1-4345-fabc-456789012345', 'INSS', '00.000.000/0001-91', NULL, NULL, NULL, 'Brasília', 'DF', 'reu'),
  ('a7b8c9d0-e1f2-4456-abcd-567890123456', 'União Federal', '00.394.411/0001-09', NULL, NULL, NULL, 'Brasília', 'DF', 'reu');

INSERT INTO public.equipes (id, nome, tipo, ativa) VALUES
  ('e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6', 'Análise RPV', 'analise_rpv', true),
  ('e2b3c4d5-e6f7-48b9-c0d1-e2f3a4b5c6d7', 'Análise Precatório', 'analise_precatorio', true),
  ('e3c4d5e6-f7a8-49c0-d1e2-f3a4b5c6d7e8', 'Financeiro', 'financeiro', true),
  ('e4d5e6f7-a8b9-40d1-e2f3-a4b5c6d7e8f9', 'Comercial', 'comercial', true),
  ('e5e6f7a8-b9c0-41e2-f3a4-b5c6d7e8f9a0', 'Jurídico', 'juridico', true);

INSERT INTO public.usuarios (id, nome, email, equipe_id, cargo, ativo) VALUES
  ('11111111-1111-4111-b111-111111111111', 'Ricardo Mendes', 'ricardo@megatec.com', 'e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6', 'Analista RPV', true),
  ('22222222-2222-4222-b222-222222222222', 'Patrícia Alves', 'patricia@megatec.com', 'e2b3c4d5-e6f7-48b9-c0d1-e2f3a4b5c6d7', 'Analista Precatório', true),
  ('33333333-3333-4333-b333-333333333333', 'Lucas Ferreira', 'lucas@megatec.com', 'e3c4d5e6-f7a8-49c0-d1e2-f3a4b5c6d7e8', 'Analista Financeiro', true),
  ('44444444-4444-4444-b444-444444444444', 'Juliana Costa', 'juliana@megatec.com', 'e4d5e6f7-a8b9-40d1-e2f3-a4b5c6d7e8f9', 'Consultora Comercial', true),
  ('55555555-5555-4555-b555-555555555555', 'André Barbosa', 'andre@megatec.com', 'e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6', 'Analista RPV Sênior', true);

INSERT INTO public.equipe_membros (equipe_id, usuario_id) VALUES
  ('e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6', '11111111-1111-4111-b111-111111111111'),
  ('e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6', '55555555-5555-4555-b555-555555555555'),
  ('e2b3c4d5-e6f7-48b9-c0d1-e2f3a4b5c6d7', '22222222-2222-4222-b222-222222222222'),
  ('e3c4d5e6-f7a8-49c0-d1e2-f3a4b5c6d7e8', '33333333-3333-4333-b333-333333333333'),
  ('e4d5e6f7-a8b9-40d1-e2f3-a4b5c6d7e8f9', '44444444-4444-4444-b444-444444444444');

INSERT INTO public.processos (id, numero_processo, tribunal, natureza, tipo_pagamento, status_processo, transito_julgado, parte_autora, parte_re, valor_estimado, data_distribuicao, pipeline_status, triagem_resultado, pessoa_id, observacoes) VALUES
  ('10000001-0000-4000-b000-000000000001', '0001234-56.2024.8.26.0100', 'TJSP', 'Cível', 'Precatório', 3, true, 'Maria Silva Santos', 'INSS', 85000.00, '2024-03-15', 'triagem', 'pendente', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', NULL),
  ('10000001-0000-4000-b000-000000000002', '0002345-67.2024.5.01.0001', 'TRT1', 'Trabalhista', 'RPV', 4, true, 'João Pedro Oliveira', 'União Federal', 42000.00, '2024-01-20', 'triagem', 'pendente', 'b2c3d4e5-f6a7-4901-bcde-f12345678901', NULL),
  ('10000001-0000-4000-b000-000000000003', '0003456-78.2023.4.01.3400', 'TRF1', 'Federal', 'Precatório', 3, true, 'Ana Carolina Lima', 'União Federal', 120000.00, '2023-08-10', 'triagem', 'apto', 'c3d4e5f6-a7b8-4012-cdef-123456789012', 'Processo com bom potencial'),
  ('10000001-0000-4000-b000-000000000004', '0004567-89.2024.8.16.0001', 'TJPR', 'Previdenciário', 'RPV', 2, false, 'Carlos Eduardo Souza', 'INSS', 28000.00, '2024-06-05', 'triagem', 'pendente', 'd4e5f6a7-b8c9-4123-defa-234567890123', NULL),
  ('10000001-0000-4000-b000-000000000005', '0005678-90.2023.8.21.0001', 'TJRS', 'Tributário', 'Precatório', 4, true, 'Fernanda Costa Reis', 'União Federal', 250000.00, '2023-02-14', 'distribuido', 'apto', 'e5f6a7b8-c9d0-4234-efab-345678901234', 'Distribuído para equipe de análise'),
  ('10000001-0000-4000-b000-000000000006', '0006789-01.2024.4.03.6100', 'TRF3', 'Federal', 'RPV', 3, true, 'Maria Silva Santos', 'INSS', 55000.00, '2024-04-22', 'em_analise', 'apto', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'Em análise pela equipe RPV'),
  ('10000001-0000-4000-b000-000000000007', '0007890-12.2023.8.26.0100', 'TJSP', 'Cível', 'Precatório', 4, true, 'João Pedro Oliveira', 'INSS', 180000.00, '2023-11-30', 'precificado', 'apto', 'b2c3d4e5-f6a7-4901-bcde-f12345678901', 'Precificado em R$ 135.000'),
  ('10000001-0000-4000-b000-000000000008', '0008901-23.2024.5.02.0001', 'TRT2', 'Trabalhista', 'RPV', 4, true, 'Ana Carolina Lima', 'União Federal', 38000.00, '2024-02-18', 'comercial', 'apto', 'c3d4e5f6-a7b8-4012-cdef-123456789012', 'Em negociação comercial'),
  ('10000001-0000-4000-b000-000000000009', '0009012-34.2023.4.04.7100', 'TRF4', 'Previdenciário', 'Precatório', 4, true, 'Carlos Eduardo Souza', 'INSS', 95000.00, '2023-05-08', 'ganho', 'apto', 'd4e5f6a7-b8c9-4123-defa-234567890123', 'Negócio fechado com sucesso'),
  ('10000001-0000-4000-b000-000000000010', '0010123-45.2024.8.19.0001', 'TJRJ', 'Cível', 'RPV', 1, false, 'Fernanda Costa Reis', 'INSS', 15000.00, '2024-07-01', 'captado', 'pendente', 'e5f6a7b8-c9d0-4234-efab-345678901234', NULL),
  ('10000001-0000-4000-b000-000000000011', '0011234-56.2024.8.13.0001', 'TJMG', 'Previdenciário', 'RPV', 3, true, 'Maria Silva Santos', 'INSS', 32000.00, '2024-05-12', 'triagem', 'reanálise', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'Necessita revisão de documentos'),
  ('10000001-0000-4000-b000-000000000012', '0012345-67.2023.4.05.8300', 'TRF5', 'Federal', 'Precatório', 3, true, 'João Pedro Oliveira', 'União Federal', 75000.00, '2023-09-25', 'triagem', 'descartado', 'b2c3d4e5-f6a7-4901-bcde-f12345678901', 'Processo sem viabilidade econômica');

UPDATE public.processos SET
  equipe_id = 'e2b3c4d5-e6f7-48b9-c0d1-e2f3a4b5c6d7',
  analista_id = '22222222-2222-4222-b222-222222222222',
  distribuido_em = '2024-01-15 10:00:00+00'
WHERE id = '10000001-0000-4000-b000-000000000005';

UPDATE public.processos SET
  equipe_id = 'e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6',
  analista_id = '11111111-1111-4111-b111-111111111111',
  distribuido_em = '2024-05-01 09:00:00+00'
WHERE id = '10000001-0000-4000-b000-000000000006';

UPDATE public.processos SET
  equipe_id = 'e2b3c4d5-e6f7-48b9-c0d1-e2f3a4b5c6d7',
  analista_id = '22222222-2222-4222-b222-222222222222',
  distribuido_em = '2024-01-10 08:00:00+00',
  valor_precificado = 135000.00,
  precificacao_data = '2024-02-01 14:00:00+00',
  precificado_por = '33333333-3333-4333-b333-333333333333'
WHERE id = '10000001-0000-4000-b000-000000000007';

UPDATE public.processos SET
  equipe_id = 'e1a2b3c4-d5e6-47a8-b9c0-d1e2f3a4b5c6',
  analista_id = '11111111-1111-4111-b111-111111111111',
  distribuido_em = '2024-03-01 10:00:00+00',
  valor_precificado = 28500.00,
  precificacao_data = '2024-03-15 11:00:00+00',
  precificado_por = '33333333-3333-4333-b333-333333333333',
  tipo_servico = 'compra_credito',
  valor_proposta = 28500.00,
  negocio_status = 'em_andamento'
WHERE id = '10000001-0000-4000-b000-000000000008';

UPDATE public.processos SET
  equipe_id = 'e2b3c4d5-e6f7-48b9-c0d1-e2f3a4b5c6d7',
  analista_id = '22222222-2222-4222-b222-222222222222',
  distribuido_em = '2023-06-01 09:00:00+00',
  valor_precificado = 71000.00,
  precificacao_data = '2023-07-01 14:00:00+00',
  precificado_por = '33333333-3333-4333-b333-333333333333',
  tipo_servico = 'compra_credito',
  valor_proposta = 71000.00,
  valor_fechamento = 68000.00,
  data_fechamento = '2023-08-15 16:00:00+00',
  negocio_status = 'ganho'
WHERE id = '10000001-0000-4000-b000-000000000009';
