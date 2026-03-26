
-- Add comprovante columns to comunicacoes_divida
ALTER TABLE public.comunicacoes_divida
  ADD COLUMN IF NOT EXISTS comprovante_url text,
  ADD COLUMN IF NOT EXISTS comprovante_nome text;

-- Create storage bucket for comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-divida', 'comprovantes-divida', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload comprovantes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'comprovantes-divida');

-- Storage RLS: public read
CREATE POLICY "Public read comprovantes"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'comprovantes-divida');

-- Storage RLS: authenticated users can delete own uploads
CREATE POLICY "Authenticated users can delete comprovantes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'comprovantes-divida');
