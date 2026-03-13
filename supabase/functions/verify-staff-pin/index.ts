import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIN_ROLE_MAP: Record<string, string> = {
  "159357": "bendahara",
  "456123": "sekretaris",
  "654321": "dokumentasi",
  "123456": "admin",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();
    const role = PIN_ROLE_MAP[pin];

    if (!role) {
      return new Response(
        JSON.stringify({ error: "PIN tidak valid" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user with this role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", role)
      .limit(1)
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: `Tidak ada user dengan role ${role}. Pastikan admin sudah assign role tersebut.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(roleData.user_id);

    if (!userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "User tidak ditemukan" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate magic link token
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
    });

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: "Gagal membuat sesi login" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        email: userData.user.email,
        token_hash: linkData.properties?.hashed_token,
        role,
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
