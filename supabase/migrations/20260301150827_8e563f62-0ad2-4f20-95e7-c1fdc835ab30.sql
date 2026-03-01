
-- Create a function that ensures the default institutional group exists and has all users
CREATE OR REPLACE FUNCTION public.sync_grupo_institucional()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _conversa_id uuid;
  _user_record RECORD;
BEGIN
  -- Check if default institutional group exists
  SELECT id INTO _conversa_id
  FROM chat_conversas
  WHERE institucional = true AND nome = 'Comunicados da Empresa'
  AND deletado_em IS NULL
  LIMIT 1;

  -- Create if not exists
  IF _conversa_id IS NULL THEN
    _conversa_id := gen_random_uuid();
    INSERT INTO chat_conversas (id, nome, tipo, institucional, criado_por)
    VALUES (_conversa_id, 'Comunicados da Empresa', 'grupo', true, NULL);
  END IF;

  -- Add all active users that are not yet participants
  INSERT INTO chat_participantes (conversa_id, user_id)
  SELECT _conversa_id, u.id
  FROM usuarios u
  WHERE u.ativo = true
  AND NOT EXISTS (
    SELECT 1 FROM chat_participantes cp
    WHERE cp.conversa_id = _conversa_id AND cp.user_id = u.id
  );
END;
$$;

-- Run it now to create the default group
SELECT public.sync_grupo_institucional();

-- Create a trigger to auto-add new users to the institutional group
CREATE OR REPLACE FUNCTION public.auto_add_to_institucional()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _conversa_id uuid;
BEGIN
  -- Find the default institutional group
  SELECT id INTO _conversa_id
  FROM chat_conversas
  WHERE institucional = true AND nome = 'Comunicados da Empresa'
  AND deletado_em IS NULL
  LIMIT 1;

  IF _conversa_id IS NOT NULL THEN
    INSERT INTO chat_participantes (conversa_id, user_id)
    VALUES (_conversa_id, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_add_institucional
  AFTER INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_to_institucional();
