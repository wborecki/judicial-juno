
-- Add soft delete and pin columns to chat_conversas
ALTER TABLE public.chat_conversas
  ADD COLUMN IF NOT EXISTS deletado_em timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deletado_por uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fixado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fixado_em timestamp with time zone DEFAULT NULL;

-- Add last message preview columns for better UX
ALTER TABLE public.chat_conversas
  ADD COLUMN IF NOT EXISTS ultima_mensagem text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ultima_mensagem_em timestamp with time zone DEFAULT NULL;
