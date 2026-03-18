
-- n8n webhooks configuration
CREATE TABLE public.n8n_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  url text NOT NULL,
  eventos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  headers_custom jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage n8n_webhooks"
  ON public.n8n_webhooks FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- n8n webhook dispatch logs
CREATE TABLE public.n8n_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.n8n_webhooks(id) ON DELETE CASCADE NOT NULL,
  evento text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status_code integer,
  resposta text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.n8n_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage n8n_webhook_logs"
  ON public.n8n_webhook_logs FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);
