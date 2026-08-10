import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TOPICS = [
  "keutamaan sedekah dalam Islam",
  "adab dan keutamaan menuntut ilmu",
  "hikmah shalat berjamaah",
  "akhlak mulia kepada tetangga",
  "keutamaan menyantuni anak yatim",
  "amalan sunnah harian Rasulullah SAW",
  "makna sabar dan syukur dalam kehidupan",
  "keutamaan membaca Al-Qur'an",
  "birrul walidain (berbakti kepada orang tua)",
  "hikmah zakat bagi kesejahteraan umat",
  "menjaga silaturahmi antar sesama muslim",
  "keutamaan dzikir dan istighfar",
  "adab bertetangga dan bermasyarakat menurut NU",
  "hikmah puasa sunnah Senin-Kamis",
  "amal jariyah dan wakaf produktif",
  "menjaga lisan dan menjauhi ghibah",
  "keutamaan shalawat kepada Nabi Muhammad SAW",
  "peran ulama dan kyai dalam menjaga tradisi Islam Nusantara",
  "etos kerja dan mencari rezeki yang halal",
  "tawakal setelah berikhtiar",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Guard: only one auto article per day
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { data: existing } = await supabase
      .from("news")
      .select("id, title")
      .eq("category", "Kajian Islam")
      .gte("published_at", startOfDay.toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Artikel harian sudah dibuat", id: existing[0].id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Avoid repeating recent topics
    const { data: recent } = await supabase
      .from("news")
      .select("title")
      .eq("category", "Kajian Islam")
      .order("published_at", { ascending: false })
      .limit(10);
    const recentTitles = (recent ?? []).map((r: { title: string }) => r.title).join("; ");

    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const systemPrompt = `Kamu adalah penulis artikel keislaman untuk website LAZISNU (Lembaga Amil Zakat Infaq Shadaqah Nahdlatul Ulama).
Tulis artikel harian dalam Bahasa Indonesia yang santun, moderat (ahlussunnah wal jamaah an-nahdliyah), mudah dipahami masyarakat umum.
Sertakan dalil Al-Qur'an atau Hadits yang shahih/masyhur beserta terjemahannya bila relevan.
Hindari isu politik, khilafiyah tajam, dan ujaran yang memecah belah.
Balas HANYA dengan JSON valid tanpa markdown code fence, format:
{"title": "...", "excerpt": "...", "content": "..."}
- title: maksimal 70 karakter, menarik.
- excerpt: 1-2 kalimat ringkasan (maks 180 karakter).
- content: artikel 500-700 kata, terstruktur dengan paragraf, boleh memakai sub-judul teks biasa, diakhiri ajakan berbuat baik/bersedekah melalui LAZISNU.`;

    const userPrompt = `Tulis artikel hari ini dengan tema: ${topic}.
Judul jangan mirip dengan judul berikut: ${recentTitles || "(belum ada)"}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const body = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, body);
      const msg = aiRes.status === 429
        ? "Terlalu banyak permintaan AI, coba lagi nanti."
        : aiRes.status === 402
        ? "Kredit AI habis, silakan tambah kredit workspace."
        : "Gagal membuat artikel.";
      return new Response(JSON.stringify({ error: msg, status: aiRes.status, details: body }), {
        status: aiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let article: { title?: string; excerpt?: string; content?: string };
    try {
      article = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI output:", raw.slice(0, 500));
      return new Response(JSON.stringify({ error: "Format artikel tidak valid" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!article.title || !article.content) {
      return new Response(JSON.stringify({ error: "Artikel tidak lengkap" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate an illustration for the article
    let imageUrl: string | null = null;
    try {
      const imgPrompt = `Ilustrasi islami yang indah dan sopan untuk artikel berjudul "${article.title}" dengan tema ${topic}. Gaya: ilustrasi digital modern, warna hijau zamrud dan emas lembut, ornamen geometris arabesque, suasana tenang dan penuh kedamaian. TANPA teks, TANPA tulisan, TANPA kaligrafi, TANPA wajah manusia yang detail.`;
      const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-image-2",
          prompt: imgPrompt,
          size: "1024x1024",
          quality: "low",
          n: 1,
        }),
      });

      if (!imgRes.ok) {
        console.error("Image gateway error:", imgRes.status, await imgRes.text());
      } else {
        const imgJson = await imgRes.json();
        const b64: string | undefined = imgJson?.data?.[0]?.b64_json;
        if (b64) {
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const path = `news/kajian-${crypto.randomUUID()}.png`;
          const { error: upErr } = await supabase.storage
            .from("program-images")
            .upload(path, bytes, { contentType: "image/png", upsert: false });
          if (upErr) {
            console.error("Image upload error:", upErr);
          } else {
            imageUrl = supabase.storage.from("program-images").getPublicUrl(path).data.publicUrl;
          }
        } else {
          console.error("No image data returned");
        }
      }
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr);
    }

    const { data: inserted, error } = await supabase
      .from("news")
      .insert({
        title: article.title.slice(0, 200),
        excerpt: article.excerpt?.slice(0, 300) ?? null,
        content: article.content,
        category: "Kajian Islam",
        image_url: imageUrl,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select("id, title")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, article: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
