import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`<html><body><h2>Erro: ${error}</h2><script>window.close();</script></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (!code || !stateParam) {
      return new Response(`<html><body><h2>Parâmetros inválidos</h2><script>window.close();</script></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    const { user_id } = JSON.parse(atob(stateParam));

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-calendar-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return new Response(`<html><body><h2>Erro ao obter token: ${tokenData.error_description || tokenData.error}</h2><script>setTimeout(()=>window.close(),3000);</script></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Upsert token
    const { error: dbError } = await supabase
      .from("google_tokens")
      .upsert({
        user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        calendar_id: "primary",
        sync_enabled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (dbError) {
      return new Response(`<html><body><h2>Erro ao salvar: ${dbError.message}</h2><script>setTimeout(()=>window.close(),3000);</script></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(`
      <html>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <h2 style="color:#10b981;">✓ Google Calendar conectado!</h2>
            <p>Você pode fechar esta janela.</p>
            <script>
              if (window.opener) { window.opener.postMessage('google-calendar-connected', '*'); }
              setTimeout(() => window.close(), 2000);
            </script>
          </div>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    return new Response(`<html><body><h2>Erro: ${err.message}</h2><script>setTimeout(()=>window.close(),3000);</script></body></html>`, {
      headers: { "Content-Type": "text/html" },
    });
  }
});
