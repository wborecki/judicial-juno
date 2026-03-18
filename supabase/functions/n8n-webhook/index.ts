import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user is authenticated
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { evento, dados } = await req.json();
    if (!evento) {
      return new Response(JSON.stringify({ error: "Evento obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to read webhooks (bypass RLS for efficiency)
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Find active webhooks that listen to this event
    const { data: webhooks, error: wErr } = await adminClient
      .from("n8n_webhooks")
      .select("*")
      .eq("ativo", true);

    if (wErr) throw wErr;

    const matching = (webhooks ?? []).filter((w: any) => {
      const eventos = w.eventos as string[];
      return Array.isArray(eventos) && eventos.includes(evento);
    });

    const payload = {
      evento,
      timestamp: new Date().toISOString(),
      dados: dados ?? {},
    };

    const results: any[] = [];

    for (const webhook of matching) {
      let statusCode: number | null = null;
      let resposta = "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(webhook.headers_custom ?? {}),
      };

      // Try up to 2 times (1 retry)
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(webhook.url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });
          statusCode = res.status;
          resposta = await res.text();
          if (res.ok) break;
        } catch (e: any) {
          statusCode = 0;
          resposta = e.message ?? "Network error";
        }
      }

      // Log the dispatch
      await adminClient.from("n8n_webhook_logs").insert({
        webhook_id: webhook.id,
        evento,
        payload,
        status_code: statusCode,
        resposta: resposta.substring(0, 2000),
      });

      results.push({
        webhook_id: webhook.id,
        nome: webhook.nome,
        status_code: statusCode,
        success: statusCode !== null && statusCode >= 200 && statusCode < 300,
      });
    }

    return new Response(
      JSON.stringify({ dispatched: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("n8n-webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
