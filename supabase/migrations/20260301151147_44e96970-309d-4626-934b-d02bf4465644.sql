
-- Table: processo_partes
CREATE TABLE public.processo_partes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cpf_cnpj text,
  tipo text NOT NULL DEFAULT 'autor',
  pessoa_id uuid REFERENCES public.pessoas(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processo_partes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to processo_partes" ON public.processo_partes FOR ALL USING (true) WITH CHECK (true);

-- Table: processo_andamentos
CREATE TABLE public.processo_andamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  data_andamento timestamptz NOT NULL DEFAULT now(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'outros',
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processo_andamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to processo_andamentos" ON public.processo_andamentos FOR ALL USING (true) WITH CHECK (true);

-- Table: processo_documentos
CREATE TABLE public.processo_documentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  arquivo_url text NOT NULL,
  arquivo_nome text NOT NULL,
  tamanho bigint,
  tipo_documento text NOT NULL DEFAULT 'outros',
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processo_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to processo_documentos" ON public.processo_documentos FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('processo-documentos', 'processo-documentos', true);

CREATE POLICY "Allow public read processo-documentos" ON storage.objects FOR SELECT USING (bucket_id = 'processo-documentos');
CREATE POLICY "Allow authenticated upload processo-documentos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'processo-documentos');
CREATE POLICY "Allow authenticated delete processo-documentos" ON storage.objects FOR DELETE USING (bucket_id = 'processo-documentos');
