import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIN_ROLE_MAP: Record<string, { role: string; email: string; name: string }> = {
  "112233": { role: "ketua", email: "ketua@staff.internal", name: "Ketua" },
  "159357": { role: "admin", email: "admin@staff.internal", name: "Admin" },
  "321654": { role: "bendahara", email: "bendahara@staff.internal", name: "Bendahara" },
  "456123": { role: "sekretaris", email: "sekretaris@staff.internal", name: "Sekretaris" },
  "654321": { role: "dokumentasi", email: "dokumentasi@staff.internal", name: "Dokumentasi" },
  "789456": { role: "koordinator", email: "koordinator@staff.internal", name: "Koordinator" },
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

    // Find or create the staff user
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    let staffUser = userList?.users?.find((u) => u.email === staffInfo.email);

    if (!staffUser) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: staffInfo.email,
        password: crypto.randomUUID(),
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

    // Generate magic link token
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: staffInfo.email,
    });

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: "Gagal membuat sesi login" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        email: staffInfo.email,
        token_hash: linkData.properties?.hashed_token,
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
