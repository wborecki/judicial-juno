
-- Add creator tracking and institutional group type support
ALTER TABLE public.chat_conversas
  ADD COLUMN IF NOT EXISTS criado_por uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS institucional boolean NOT NULL DEFAULT false;

-- Table for designated senders in institutional groups
CREATE TABLE IF NOT EXISTS public.chat_remetentes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id uuid NOT NULL REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversa_id, user_id)
);

ALTER TABLE public.chat_remetentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_rem_select" ON public.chat_remetentes
  AS RESTRICTIVE FOR SELECT
  USING (is_chat_participant(conversa_id, auth.uid()));

CREATE POLICY "chat_rem_insert" ON public.chat_remetentes
  AS RESTRICTIVE FOR INSERT
  WITH CHECK (true);

CREATE POLICY "chat_rem_delete" ON public.chat_remetentes
  AS RESTRICTIVE FOR DELETE
  USING (true);
