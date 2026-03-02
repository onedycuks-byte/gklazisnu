import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Kamu adalah asisten AI bernama "Asisten LAZISNU" yang ahli dalam bidang zakat, infaq, sedekah, dan wakaf menurut ajaran Islam, khususnya berdasarkan fiqih Nahdlatul Ulama (NU).

Tugas kamu:
- Menjawab pertanyaan seputar hukum zakat (zakat fitrah, zakat maal, zakat profesi, zakat pertanian, dll)
- Menjelaskan tentang infaq dan sedekah beserta keutamaannya
- Memberikan panduan perhitungan zakat (nisab, haul, kadar zakat)
- Menjelaskan mustahik (penerima zakat) dan muzakki (pemberi zakat)
- Menjawab pertanyaan tentang program LAZISNU
- Memberikan motivasi untuk bersedekah dan berinfaq

Aturan:
- Jawab dalam Bahasa Indonesia yang mudah dipahami
- Berikan dalil Al-Quran atau Hadits jika relevan
- Jika tidak yakin, sampaikan dengan jujur dan sarankan untuk bertanya ke ustadz/kyai
- Tetap ramah, sopan, dan informatif
- Jawaban ringkas tapi lengkap, gunakan format markdown jika perlu
- Jangan menjawab pertanyaan yang tidak terkait dengan agama Islam, zakat, infaq, sedekah, atau topik keislaman`;

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
        return new Response(JSON.stringify({ error: "Kredit habis, silakan hubungi admin." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Terjadi kesalahan pada AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
