import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIN_ROLE_MAP: Record<string, { role: string; email: string; name: string; password: string }> = {
  "112233": { role: "ketua", email: "ketua@staff.internal", name: "Ketua", password: "staff-ketua-secure-2026!" },
  "159357": { role: "admin", email: "admin@staff.internal", name: "Admin", password: "staff-admin-secure-2026!" },
  "321654": { role: "bendahara", email: "bendahara@staff.internal", name: "Bendahara", password: "staff-bendahara-secure-2026!" },
  "456123": { role: "sekretaris", email: "sekretaris@staff.internal", name: "Sekretaris", password: "staff-sekretaris-secure-2026!" },
  "654321": { role: "dokumentasi", email: "dokumentasi@staff.internal", name: "Dokumentasi", password: "staff-dokumentasi-secure-2026!" },
  "789456": { role: "koordinator", email: "koordinator@staff.internal", name: "Koordinator", password: "staff-koordinator-secure-2026!" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();
    const staffInfo = PIN_ROLE_MAP[pin];

    if (!staffInfo) {
      return new Response(
        JSON.stringify({ error: "PIN tidak valid" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find staff user by email directly (more efficient than listing all)
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    
    // Search for user by email
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    let staffUser = allUsers?.users?.find((u) => u.email === staffInfo.email);

    if (!staffUser) {
      // Create the staff user for the first time
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: staffInfo.email,
        password: staffInfo.password,
        email_confirm: true,
        user_metadata: { full_name: staffInfo.name, is_staff: true },
      });

      if (createErr || !created?.user) {
        return new Response(
          JSON.stringify({ error: "Gagal membuat akun staff" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      staffUser = created.user;

      await supabaseAdmin.from("user_roles").insert({
        user_id: staffUser.id,
        role: staffInfo.role,
      });
    }
    // NOTE: No password update here - keeps existing sessions valid on other devices

    // Ensure role exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", staffUser.id)
      .eq("role", staffInfo.role)
      .maybeSingle();

    if (!existingRole) {
      await supabaseAdmin.from("user_roles").insert({
        user_id: staffUser.id,
        role: staffInfo.role,
      });
    }

    // Return credentials for client-side signInWithPassword
    return new Response(
      JSON.stringify({
        email: staffInfo.email,
        password: staffInfo.password,
        role: staffInfo.role,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
