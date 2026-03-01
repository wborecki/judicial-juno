
-- Step 1: Create all tables
CREATE TABLE public.chat_conversas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT,
  tipo TEXT NOT NULL DEFAULT 'direto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_participantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID NOT NULL REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversa_id, user_id)
);

CREATE TABLE public.chat_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID NOT NULL REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  conteudo TEXT,
  tipo TEXT NOT NULL DEFAULT 'texto',
  referencia_id UUID,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Enable RLS on all tables
ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

-- Step 3: Policies for chat_participantes
CREATE POLICY "chat_part_select" ON public.chat_participantes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participantes cp2 WHERE cp2.conversa_id = chat_participantes.conversa_id AND cp2.user_id = auth.uid())
  );

CREATE POLICY "chat_part_insert" ON public.chat_participantes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chat_part_delete" ON public.chat_participantes
  FOR DELETE USING (user_id = auth.uid());

-- Step 4: Policies for chat_conversas
CREATE POLICY "chat_conv_select" ON public.chat_conversas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = chat_conversas.id AND cp.user_id = auth.uid())
  );

CREATE POLICY "chat_conv_insert" ON public.chat_conversas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chat_conv_update" ON public.chat_conversas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = chat_conversas.id AND cp.user_id = auth.uid())
  );

-- Step 5: Policies for chat_mensagens
CREATE POLICY "chat_msg_select" ON public.chat_mensagens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = chat_mensagens.conversa_id AND cp.user_id = auth.uid())
  );

CREATE POLICY "chat_msg_insert" ON public.chat_mensagens
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.chat_participantes cp WHERE cp.conversa_id = chat_mensagens.conversa_id AND cp.user_id = auth.uid())
  );

-- Step 6: Trigger
CREATE TRIGGER update_chat_conversas_updated_at
  BEFORE UPDATE ON public.chat_conversas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_mensagens;

-- Step 8: Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "chat_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "chat_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');
