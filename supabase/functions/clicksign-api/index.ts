import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLICKSIGN_BASE = "https://app.clicksign.com/api/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLICKSIGN_TOKEN = Deno.env.get("CLICKSIGN_ACCESS_TOKEN");
    if (!CLICKSIGN_TOKEN) {
      return new Response(
        JSON.stringify({ error: "CLICKSIGN_ACCESS_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...params } = await req.json();

    const headers = {
      Authorization: `Bearer ${CLICKSIGN_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let result: any;

    switch (action) {
      case "test-connection": {
        const res = await fetch(`${CLICKSIGN_BASE}/envelopes?page_size=1`, { headers });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`ClickSign API error [${res.status}]: ${body}`);
        }
        result = { connected: true };
        break;
      }

      case "create-envelope": {
        const res = await fetch(`${CLICKSIGN_BASE}/envelopes`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            envelope: {
              name: params.name || "Envelope",
              locale: "pt-BR",
              auto_close: true,
              block_after_refusal: true,
            },
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Create envelope failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "upload-document": {
        const res = await fetch(
          `${CLICKSIGN_BASE}/envelopes/${params.envelope_id}/documents`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              document: {
                filename: params.filename || "documento.pdf",
                content_base64: params.content_base64,
              },
            }),
          }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Upload document failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "create-from-template": {
        const res = await fetch(
          `${CLICKSIGN_BASE}/envelopes/${params.envelope_id}/documents`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              document: {
                template_key: params.template_key,
                template_data: params.template_data || {},
              },
            }),
          }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Create from template failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "add-signer": {
        const res = await fetch(
          `${CLICKSIGN_BASE}/envelopes/${params.envelope_id}/signers`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              signer: {
                name: params.name,
                email: params.email,
                cpf: params.cpf || undefined,
                phone: params.phone || undefined,
                refusable: true,
                group: 0,
                communicate_events: ["signed", "refused"],
                signature_type: params.papel === "witness" ? "witness" : params.papel === "approve" ? "approval" : "signature",
              },
            }),
          }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Add signer failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "activate-envelope": {
        const res = await fetch(
          `${CLICKSIGN_BASE}/envelopes/${params.envelope_id}/activate`,
          {
            method: "PATCH",
            headers,
          }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Activate envelope failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "get-envelope-status": {
        const res = await fetch(
          `${CLICKSIGN_BASE}/envelopes/${params.envelope_id}`,
          { headers }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Get envelope status failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "cancel-envelope": {
        const res = await fetch(
          `${CLICKSIGN_BASE}/envelopes/${params.envelope_id}/cancel`,
          {
            method: "PATCH",
            headers,
          }
        );
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Cancel envelope failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      case "list-templates": {
        const res = await fetch(`${CLICKSIGN_BASE}/templates`, { headers });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`List templates failed [${res.status}]: ${body}`);
        }
        result = await res.json();
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("ClickSign API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
