import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Failed to refresh token");
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's token
    const { data: tokenRow, error: tokenError } = await adminClient
      .from("google_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenRow) {
      return new Response(JSON.stringify({ error: "Google Calendar não conectado" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh token if expired
    let accessToken = tokenRow.access_token;
    if (new Date(tokenRow.expires_at) <= new Date()) {
      const refreshed = await refreshAccessToken(tokenRow.refresh_token);
      accessToken = refreshed.access_token;
      await adminClient.from("google_tokens").update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", tokenRow.id);
    }

    // Get local events without google_event_id (to push)
    const { data: localEvents } = await adminClient
      .from("agenda_eventos")
      .select("*")
      .or(`criado_por.eq.${user.id},responsavel_id.eq.${user.id}`)
      .is("google_event_id", null);

    let pushed = 0;
    const calendarId = tokenRow.calendar_id || "primary";

    for (const ev of (localEvents ?? [])) {
      const googleEvent = {
        summary: ev.titulo,
        description: ev.descricao || "",
        location: ev.local || "",
        start: ev.dia_inteiro
          ? { date: ev.data_inicio.split("T")[0] }
          : { dateTime: ev.data_inicio, timeZone: "America/Sao_Paulo" },
        end: ev.data_fim
          ? (ev.dia_inteiro
            ? { date: ev.data_fim.split("T")[0] }
            : { dateTime: ev.data_fim, timeZone: "America/Sao_Paulo" })
          : (ev.dia_inteiro
            ? { date: ev.data_inicio.split("T")[0] }
            : { dateTime: ev.data_inicio, timeZone: "America/Sao_Paulo" }),
      };

      const gRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleEvent),
        }
      );

      if (gRes.ok) {
        const created = await gRes.json();
        await adminClient
          .from("agenda_eventos")
          .update({ google_event_id: created.id })
          .eq("id", ev.id);
        pushed++;
      }
    }

    return new Response(JSON.stringify({ success: true, pushed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
