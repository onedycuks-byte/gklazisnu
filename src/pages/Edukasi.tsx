import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, CalendarDays, BookOpen, ExternalLink, Coins, Wallet, Sparkles } from "lucide-react";
import { useTrackPageView } from "@/hooks/useAnalytics";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Math.max(0, Math.round(n)));

// ---------- Zakat Calculator ----------
function ZakatCalculator() {
  const [goldPrice, setGoldPrice] = useState(1350000); // per gram IDR (default)
  const NISAB_GRAM = 85;
  const nisab = goldPrice * NISAB_GRAM;

  // Maal
  const [tabungan, setTabungan] = useState(0);
  const [emasGram, setEmasGram] = useState(0);
  const [piutang, setPiutang] = useState(0);
  const [hutang, setHutang] = useState(0);
  const hartaTotal = tabungan + emasGram * goldPrice + piutang - hutang;
  const zakatMaal = hartaTotal >= nisab ? hartaTotal * 0.025 : 0;

  // Penghasilan
  const [gaji, setGaji] = useState(0);
  const [pendapatanLain, setPendapatanLain] = useState(0);
  const [kebutuhan, setKebutuhan] = useState(0);
  const penghasilanBersih = gaji + pendapatanLain - kebutuhan;
  const nisabBulanan = nisab / 12;
  const zakatPenghasilan = penghasilanBersih >= nisabBulanan ? penghasilanBersih * 0.025 : 0;

  // Fitrah
  const [hargaBeras, setHargaBeras] = useState(15000);
  const [jiwa, setJiwa] = useState(1);
  const zakatFitrah = hargaBeras * 2.5 * jiwa;

  const Field = ({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-10"
        placeholder="0"
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );

  return (
    <Tabs defaultValue="maal" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-10">
        <TabsTrigger value="maal" className="text-xs">Maal</TabsTrigger>
        <TabsTrigger value="penghasilan" className="text-xs">Penghasilan</TabsTrigger>
        <TabsTrigger value="fitrah" className="text-xs">Fitrah</TabsTrigger>
      </TabsList>

      <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/50">
        <Label className="text-xs font-semibold">Harga Emas / gram (Rp)</Label>
        <Input
          type="number"
          value={goldPrice || ""}
          onChange={(e) => setGoldPrice(Number(e.target.value) || 0)}
          className="h-9 mt-1.5"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Nisab (85 gram emas): <span className="font-semibold text-foreground">{formatIDR(nisab)}</span>
        </p>
      </div>

      <TabsContent value="maal" className="space-y-3 mt-4">
        <Field label="Tabungan / Kas (Rp)" value={tabungan} onChange={setTabungan} />
        <Field label="Emas (gram)" value={emasGram} onChange={setEmasGram} hint={emasGram > 0 ? `Setara ${formatIDR(emasGram * goldPrice)}` : undefined} />
        <Field label="Piutang dapat ditagih (Rp)" value={piutang} onChange={setPiutang} />
        <Field label="Hutang jatuh tempo (Rp)" value={hutang} onChange={setHutang} />
        <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground p-4">
          <p className="text-[11px] opacity-90">Total Harta</p>
          <p className="text-base font-semibold">{formatIDR(hartaTotal)}</p>
          <div className="border-t border-white/20 my-2" />
          <p className="text-[11px] opacity-90">Zakat Wajib (2,5%)</p>
          <p className="text-2xl font-bold">{formatIDR(zakatMaal)}</p>
          {hartaTotal < nisab && (
            <p className="text-[11px] mt-2 opacity-90">Belum mencapai nisab — belum wajib zakat.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="penghasilan" className="space-y-3 mt-4">
        <Field label="Gaji per bulan (Rp)" value={gaji} onChange={setGaji} />
        <Field label="Pendapatan lain (Rp)" value={pendapatanLain} onChange={setPendapatanLain} />
        <Field label="Kebutuhan pokok (Rp)" value={kebutuhan} onChange={setKebutuhan} />
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4">
          <p className="text-[11px] opacity-90">Penghasilan Bersih / bulan</p>
          <p className="text-base font-semibold">{formatIDR(penghasilanBersih)}</p>
          <div className="border-t border-white/20 my-2" />
          <p className="text-[11px] opacity-90">Zakat Penghasilan (2,5%)</p>
          <p className="text-2xl font-bold">{formatIDR(zakatPenghasilan)}</p>
          <p className="text-[11px] mt-2 opacity-90">Nisab bulanan: {formatIDR(nisabBulanan)}</p>
        </div>
      </TabsContent>

      <TabsContent value="fitrah" className="space-y-3 mt-4">
        <Field label="Harga beras / kg (Rp)" value={hargaBeras} onChange={setHargaBeras} />
        <Field label="Jumlah jiwa" value={jiwa} onChange={setJiwa} hint="Termasuk diri sendiri & keluarga yang dinafkahi" />
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white p-4">
          <p className="text-[11px] opacity-90">Zakat Fitrah (2,5 kg × {jiwa} jiwa)</p>
          <p className="text-2xl font-bold">{formatIDR(zakatFitrah)}</p>
          <p className="text-[11px] mt-2 opacity-90">Dapat ditunaikan berupa beras atau uang setara.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// ---------- Kalender Jawa Islam ----------
const HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
const WETON_NEPTU_HARI: Record<string, number> = { Ahad: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9 };
const WETON_NEPTU_PASARAN: Record<string, number> = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 };

function getJavaneseDate(date: Date) {
  // Reference: 1 Jan 1970 (Thursday) = Wage (index 3)
  const epochDays = Math.floor(date.getTime() / 86400000);
  const pasaranIdx = ((epochDays + 3) % 5 + 5) % 5;
  return PASARAN[pasaranIdx];
}

function getHijri(date: Date) {
  try {
    const fmt = new Intl.DateTimeFormat("en-TN-u-ca-islamic-umalqura", {
      day: "numeric", month: "long", year: "numeric"
    });
    return fmt.format(date);
  } catch {
    return "-";
  }
}

function KalenderJawa() {
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10));
  const date = useMemo(() => new Date(selected + "T12:00:00"), [selected]);
  const hari = HARI[date.getDay()];
  const pasaran = getJavaneseDate(date);
  const hijri = getHijri(date);
  const neptu = WETON_NEPTU_HARI[hari] + WETON_NEPTU_PASARAN[pasaran];
  const gregorianStr = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold">Pilih Tanggal</Label>
        <Input type="date" value={selected} onChange={(e) => setSelected(e.target.value)} className="h-10 mt-1.5" />
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary via-emerald-600 to-teal-700 text-primary-foreground p-5 shadow-elevated">
        <p className="text-[11px] opacity-90 uppercase tracking-wide">Masehi</p>
        <p className="text-lg font-bold leading-tight">{gregorianStr}</p>
        <div className="border-t border-white/20 my-3" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] opacity-80 uppercase">Hijriyah</p>
            <p className="text-sm font-semibold">{hijri}</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 uppercase">Weton Jawa</p>
            <p className="text-sm font-semibold">{hari} {pasaran}</p>
            <p className="text-[10px] opacity-80 mt-0.5">Neptu: {neptu}</p>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Tentang Penanggalan</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p><b className="text-foreground">Kalender Jawa-Islam</b> diperkenalkan Sultan Agung Mataram tahun 1633 M, memadukan kalender Saka & Hijriyah.</p>
          <p><b className="text-foreground">Pasaran</b> adalah siklus 5 hari pasar Jawa: Legi, Pahing, Pon, Wage, Kliwon.</p>
          <p><b className="text-foreground">Neptu</b> adalah nilai gabungan hari & pasaran, sering digunakan dalam tradisi Jawa.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Buku ----------
type Book = { title: string; author: string; desc: string; category: string; url: string };
const BOOKS: Book[] = [
  {
    title: "Fiqih Zakat",
    author: "Dr. Yusuf Al-Qaradhawi",
    desc: "Kitab rujukan utama tentang hukum, hikmah, jenis harta, dan distribusi zakat secara komprehensif.",
    category: "Zakat",
    url: "https://www.google.com/search?q=Fiqih+Zakat+Yusuf+Qaradhawi+pdf",
  },
  {
    title: "Panduan Zakat Praktis",
    author: "BAZNAS RI",
    desc: "Buku saku menghitung & menunaikan zakat maal, penghasilan, perdagangan, pertanian, dan fitrah.",
    category: "Zakat",
    url: "https://baznas.go.id/zakat",
  },
  {
    title: "Risalah Zakat, Infaq & Shadaqah",
    author: "LAZISNU PBNU",
    desc: "Panduan resmi LAZISNU mengenai pengelolaan ZIS sesuai manhaj Ahlussunnah wal Jamaah.",
    category: "ZIS",
    url: "https://nucare.id/publikasi",
  },
  {
    title: "Keajaiban Sedekah",
    author: "Yusuf Mansur",
    desc: "Motivasi & kisah inspiratif tentang keberkahan sedekah dalam kehidupan sehari-hari.",
    category: "Shadaqah",
    url: "https://www.google.com/search?q=Keajaiban+Sedekah+Yusuf+Mansur",
  },
  {
    title: "Infaq di Jalan Allah",
    author: "Sayyid Sabiq (Fiqih Sunnah)",
    desc: "Pembahasan infaq, sedekah sunnah & wajib dari kitab Fiqih Sunnah klasik.",
    category: "Infaq",
    url: "https://www.google.com/search?q=Fiqih+Sunnah+Sayyid+Sabiq+infaq",
  },
  {
    title: "Indahnya Berbagi: Filosofi Sedekah",
    author: "Dr. KH. Said Aqil Siroj",
    desc: "Telaah spiritual & sosial tentang sedekah dalam tradisi NU dan masyarakat Indonesia.",
    category: "Shadaqah",
    url: "https://www.google.com/search?q=Said+Aqil+Siroj+sedekah",
  },
  {
    title: "Manajemen Zakat Modern",
    author: "Prof. Dr. Didin Hafidhuddin",
    desc: "Tata kelola zakat profesional, transparansi, dan kontribusi zakat terhadap ekonomi umat.",
    category: "Zakat",
    url: "https://www.google.com/search?q=Manajemen+Zakat+Didin+Hafidhuddin",
  },
  {
    title: "Zakat Profesi & Penghasilan",
    author: "Forum Zakat",
    desc: "Pembahasan kontemporer tentang zakat penghasilan, nisab, kadar, dan waktu penunaiannya.",
    category: "Zakat",
    url: "https://www.google.com/search?q=zakat+profesi+forum+zakat+pdf",
  },
];

function BukuList() {
  const [filter, setFilter] = useState<string>("Semua");
  const categories = ["Semua", "Zakat", "Infaq", "Shadaqah", "ZIS"];
  const filtered = filter === "Semua" ? BOOKS : BOOKS.filter((b) => b.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === c ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((b, i) => (
          <Card key={i} className="border-border/50 hover:shadow-elevated transition-all animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm leading-snug">{b.title}</h3>
                    <Badge variant="secondary" className="text-[9px] shrink-0">{b.category}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mb-1.5">{b.author}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{b.desc}</p>
                  <a href={b.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                      Cari / Unduh <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function Edukasi() {
  useTrackPageView("/edukasi");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold leading-tight">Edukasi & Kalkulator</h1>
            <p className="text-[10px] text-muted-foreground">Zakat • Kalender Jawa-Islam • Buku ZIS</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <Tabs defaultValue="zakat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="zakat" className="text-xs gap-1.5"><Calculator className="h-3.5 w-3.5" /> Zakat</TabsTrigger>
            <TabsTrigger value="kalender" className="text-xs gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Kalender</TabsTrigger>
            <TabsTrigger value="buku" className="text-xs gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Buku</TabsTrigger>
          </TabsList>

          <TabsContent value="zakat" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Coins className="h-4 w-4 text-primary" /> Kalkulator Zakat</CardTitle>
                <CardDescription className="text-xs">Hitung zakat maal, penghasilan, dan fitrah sesuai syariat.</CardDescription>
              </CardHeader>
              <CardContent>
                <ZakatCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kalender" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Kalender Jawa-Islam</CardTitle>
                <CardDescription className="text-xs">Konversi Masehi, Hijriyah, dan Weton Jawa.</CardDescription>
              </CardHeader>
              <CardContent>
                <KalenderJawa />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buku" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Buku Zakat, Infaq & Shadaqah</CardTitle>
                <CardDescription className="text-xs">Referensi bacaan & panduan ZIS terpercaya.</CardDescription>
              </CardHeader>
              <CardContent>
                <BukuList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
