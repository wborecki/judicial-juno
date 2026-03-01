
-- The chat_conv_insert and chat_part_insert are RESTRICTIVE policies.
-- We need at least one PERMISSIVE policy for them to work.
-- Drop and recreate as PERMISSIVE.

DROP POLICY IF EXISTS "chat_conv_insert" ON public.chat_conversas;
CREATE POLICY "chat_conv_insert" ON public.chat_conversas
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "chat_part_insert" ON public.chat_participantes;
CREATE POLICY "chat_part_insert" ON public.chat_participantes
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "chat_msg_insert" ON public.chat_mensagens;
CREATE POLICY "chat_msg_insert" ON public.chat_mensagens
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND public.is_chat_participant(conversa_id, auth.uid()));

-- Also make select policies permissive
DROP POLICY IF EXISTS "chat_conv_select" ON public.chat_conversas;
CREATE POLICY "chat_conv_select" ON public.chat_conversas
FOR SELECT TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

DROP POLICY IF EXISTS "chat_conv_update" ON public.chat_conversas;
CREATE POLICY "chat_conv_update" ON public.chat_conversas
FOR UPDATE TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

DROP POLICY IF EXISTS "chat_part_select" ON public.chat_participantes;
CREATE POLICY "chat_part_select" ON public.chat_participantes
FOR SELECT TO authenticated
USING (public.is_chat_participant(conversa_id, auth.uid()));

DROP POLICY IF EXISTS "chat_part_delete" ON public.chat_participantes;
CREATE POLICY "chat_part_delete" ON public.chat_participantes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_msg_select" ON public.chat_mensagens;
CREATE POLICY "chat_msg_select" ON public.chat_mensagens
FOR SELECT TO authenticated
USING (public.is_chat_participant(conversa_id, auth.uid()));
