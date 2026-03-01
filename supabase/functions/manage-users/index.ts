import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client for the calling user (to verify admin role)
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Apenas administradores podem gerenciar usuários" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...payload } = await req.json();

    // INVITE USER
    if (action === "invite") {
      const { email, nome, cargo, role, equipe_id } = payload;

      // Create auth user with invite
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { full_name: nome },
        redirectTo: `${req.headers.get("origin") || supabaseUrl}`,
      });
      if (inviteError) {
        return new Response(JSON.stringify({ error: inviteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = inviteData.user.id;

      // Create usuario record
      await adminClient.from("usuarios").insert({
        id: userId,
        email,
        nome: nome || email,
        cargo: cargo || "",
        equipe_id: equipe_id || null,
      });

      // Assign role
      if (role) {
        await adminClient.from("user_roles").insert({
          user_id: userId,
          role,
        });
      }

      return new Response(JSON.stringify({ success: true, user_id: userId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE USER
    if (action === "update") {
      const { user_id, nome, cargo, ativo, equipe_id, role } = payload;

      // Update usuario record
      const updateData: Record<string, unknown> = {};
      if (nome !== undefined) updateData.nome = nome;
      if (cargo !== undefined) updateData.cargo = cargo;
      if (ativo !== undefined) updateData.ativo = ativo;
      if (equipe_id !== undefined) updateData.equipe_id = equipe_id;

      if (Object.keys(updateData).length > 0) {
        const { error } = await adminClient.from("usuarios").update(updateData).eq("id", user_id);
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Update role if provided
      if (role !== undefined) {
        // Delete existing roles and insert new one
        await adminClient.from("user_roles").delete().eq("user_id", user_id);
        if (role) {
          await adminClient.from("user_roles").insert({ user_id, role });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LIST USERS WITH ROLES
    if (action === "list") {
      const { data: usuarios } = await adminClient.from("usuarios").select("*").order("nome");
      const { data: roles } = await adminClient.from("user_roles").select("*");

      const enriched = (usuarios || []).map((u: Record<string, unknown>) => ({
        ...u,
        role: (roles || []).find((r: Record<string, unknown>) => r.user_id === u.id)?.role || null,
      }));

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
