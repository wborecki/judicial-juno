
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Allow all access to processos" ON public.processos;
DROP POLICY IF EXISTS "Allow all access to pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Allow all access to equipes" ON public.equipes;
DROP POLICY IF EXISTS "Allow all access to usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Allow all access to equipe_membros" ON public.equipe_membros;

CREATE POLICY "Allow all access to processos" ON public.processos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to pessoas" ON public.pessoas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to equipes" ON public.equipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to equipe_membros" ON public.equipe_membros FOR ALL USING (true) WITH CHECK (true);
