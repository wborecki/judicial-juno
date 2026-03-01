
-- 1. Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'analista', 'usuario');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: only admins can manage roles, everyone can read their own
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Add peso (weight) to equipe_membros for weighted distribution
ALTER TABLE public.equipe_membros
ADD COLUMN peso INTEGER NOT NULL DEFAULT 100;

-- 4. Extend regras_roteamento for negocios
ALTER TABLE public.regras_roteamento
ADD COLUMN entidade TEXT NOT NULL DEFAULT 'processo',
ADD COLUMN criterio_tipo_servico JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN criterio_valor_min NUMERIC DEFAULT NULL,
ADD COLUMN criterio_valor_max NUMERIC DEFAULT NULL;

-- 5. Helper function to get user's analista_id (maps auth.uid to usuarios.id)
CREATE OR REPLACE FUNCTION public.get_usuario_id_for_auth(_auth_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.usuarios
  WHERE id = _auth_id
  LIMIT 1
$$;

-- 6. Update RLS on processos: admin sees all, analista sees own assigned
DROP POLICY IF EXISTS "Allow all access to processos" ON public.processos;

CREATE POLICY "Admin full access to processos"
ON public.processos FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analista can view own processos"
ON public.processos FOR SELECT
USING (
  analista_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Analista can update own processos"
ON public.processos FOR UPDATE
USING (
  analista_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 7. Update RLS on negocios: admin sees all, responsavel sees own
DROP POLICY IF EXISTS "Allow all access to negocios" ON public.negocios;

CREATE POLICY "Admin full access to negocios"
ON public.negocios FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Responsavel can view own negocios"
ON public.negocios FOR SELECT
USING (
  responsavel_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Responsavel can update own negocios"
ON public.negocios FOR UPDATE
USING (
  responsavel_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);
