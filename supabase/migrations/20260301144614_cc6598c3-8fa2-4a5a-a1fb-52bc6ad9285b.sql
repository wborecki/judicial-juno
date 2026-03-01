
-- Fix infinite recursion: create security definer function
CREATE OR REPLACE FUNCTION public.is_chat_participant(_conversa_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_participantes
    WHERE conversa_id = _conversa_id AND user_id = _user_id
  );
$$;

-- Drop old recursive policy
DROP POLICY IF EXISTS "chat_part_select" ON public.chat_participantes;

-- Recreate without recursion
CREATE POLICY "chat_part_select" ON public.chat_participantes
FOR SELECT USING (public.is_chat_participant(conversa_id, auth.uid()));

-- Also fix chat_conversas select to use the function
DROP POLICY IF EXISTS "chat_conv_select" ON public.chat_conversas;
CREATE POLICY "chat_conv_select" ON public.chat_conversas
FOR SELECT USING (public.is_chat_participant(id, auth.uid()));

DROP POLICY IF EXISTS "chat_conv_update" ON public.chat_conversas;
CREATE POLICY "chat_conv_update" ON public.chat_conversas
FOR UPDATE USING (public.is_chat_participant(id, auth.uid()));

-- Fix chat_mensagens policies too
DROP POLICY IF EXISTS "chat_msg_select" ON public.chat_mensagens;
CREATE POLICY "chat_msg_select" ON public.chat_mensagens
FOR SELECT USING (public.is_chat_participant(conversa_id, auth.uid()));

DROP POLICY IF EXISTS "chat_msg_insert" ON public.chat_mensagens;
CREATE POLICY "chat_msg_insert" ON public.chat_mensagens
FOR INSERT WITH CHECK (sender_id = auth.uid() AND public.is_chat_participant(conversa_id, auth.uid()));

-- Allow all authenticated users to see profiles (for chat search)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL);
