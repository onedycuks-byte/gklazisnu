import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: hasRole } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!hasRole) throw new Error("Forbidden: Admin only");

    const { messages, action } = await req.json();

    // Fetch current data context for the AI
    const [programsRes, newsRes, settingsRes, donationsRes, expensesRes, regionsRes] = await Promise.all([
      supabase.from("programs").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("news").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("site_settings").select("*"),
      supabase.from("donations").select("*").order("date", { ascending: false }).limit(20),
      supabase.from("expenses").select("*").order("date", { ascending: false }).limit(20),
      supabase.from("regions").select("*"),
    ]);

    const dataContext = `
DATA SAAT INI DI SISTEM:

PROGRAM DONASI (${programsRes.data?.length || 0} program):
${JSON.stringify(programsRes.data?.map(p => ({ id: p.id, title: p.title, description: p.description, target: p.target_amount, collected: p.collected_amount, active: p.is_active })) || [], null, 2)}

BERITA (${newsRes.data?.length || 0} berita):
${JSON.stringify(newsRes.data?.map(n => ({ id: n.id, title: n.title, excerpt: n.excerpt, category: n.category, published: n.is_published })) || [], null, 2)}

WILAYAH (${regionsRes.data?.length || 0} wilayah):
${JSON.stringify(regionsRes.data?.map(r => ({ id: r.id, name: r.name, coordinator: r.coordinator })) || [], null, 2)}

PEMASUKAN TERAKHIR (${donationsRes.data?.length || 0}):
${JSON.stringify(donationsRes.data?.map(d => ({ amount: d.amount, date: d.date, category: d.category, notes: d.notes })) || [], null, 2)}

PENGELUARAN TERAKHIR (${expensesRes.data?.length || 0}):
${JSON.stringify(expensesRes.data?.map(e => ({ amount: e.amount, date: e.date, category: e.category, description: e.description })) || [], null, 2)}

PENGATURAN KONTAK:
${JSON.stringify(settingsRes.data?.map(s => ({ key: s.key, value: s.value })) || [], null, 2)}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Kamu adalah Asisten Admin LAZISNU Gendongkulon, sebuah AI yang membantu admin mengelola konten website/aplikasi LAZISNU.

KEMAMPUAN KAMU:
1. **Membuat konten berita** - Bantu tulis judul, ringkasan, dan isi berita kegiatan LAZISNU
2. **Membuat deskripsi program** - Bantu tulis deskripsi program donasi yang menarik
3. **Menganalisis data keuangan** - Berikan insight dari data pemasukan dan pengeluaran
4. **Menyusun laporan** - Bantu buat rangkuman keuangan bulanan/tahunan
5. **Menulis konten sosial media** - Bantu buat caption untuk promosi program
6. **Memberi saran** - Saran untuk meningkatkan donasi dan engagement

ATURAN:
- Jawab dalam Bahasa Indonesia yang profesional
- Gunakan format markdown untuk output yang rapi
- Jika diminta membuat konten berita, format dengan jelas: JUDUL, RINGKASAN, ISI LENGKAP
- Jika diminta membuat deskripsi program, buat yang emosional dan memotivasi
- Untuk analisis data, tampilkan angka dengan format Rupiah
- Berikan output yang siap di-copy paste ke form admin
- Jangan menjawab hal di luar konteks pengelolaan LAZISNU

${dataContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan, coba lagi nanti." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit habis." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("admin-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
