import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { OrphanCard } from "@/components/OrphanCard";
import { useOrphanRegistrations, OrphanRegistration } from "@/hooks/useOrphanRegistrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTrackPageView } from "@/hooks/useAnalytics";
import {
  Heart, ArrowLeft, UserPlus, Search, Baby, User, Phone, MapPin, Calendar, CreditCard, Loader2, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Santunan() {
  useTrackPageView("/santunan");
  const navigate = useNavigate();
  const { register, isRegistering, lookupByCode } = useOrphanRegistrations();
  
  const [tab, setTab] = useState<"daftar" | "cek">("daftar");
  const [form, setForm] = useState({
    child_name: "", birth_date: "", guardian_name: "", guardian_phone: "", address: "",
  });
  const [result, setResult] = useState<OrphanRegistration | null>(null);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<OrphanRegistration | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.child_name || !form.birth_date || !form.guardian_name || !form.guardian_phone || !form.address) {
      toast({ title: "Error", description: "Lengkapi semua data", variant: "destructive" });
      return;
    }
    try {
      const data = await register(form);
      setResult(data);
      toast({ title: "Berhasil!", description: "Pendaftaran berhasil dikirim. Simpan kode kartu Anda." });
    } catch {
      toast({ title: "Gagal", description: "Terjadi kesalahan, coba lagi.", variant: "destructive" });
    }
  };

  const handleLookup = async () => {
    if (!lookupCode.trim()) return;
    setLookupLoading(true);
    const data = await lookupByCode(lookupCode);
    setLookupResult(data);
    setLookupLoading(false);
    if (!data) toast({ title: "Tidak ditemukan", description: "Kode kartu tidak ditemukan", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white px-4 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Santunan Yatim Piatu</h1>
            <p className="text-xs text-white/70">Daftarkan anak yatim untuk mendapatkan kartu santunan</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Tab Selector */}
        <div className="flex gap-2 bg-muted rounded-2xl p-1">
          <button
            onClick={() => { setTab("daftar"); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "daftar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <UserPlus className="h-4 w-4" /> Daftar
          </button>
          <button
            onClick={() => { setTab("cek"); setLookupResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "cek" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <Search className="h-4 w-4" /> Cek Kartu
          </button>
        </div>

        {tab === "daftar" && !result && (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 shadow-card border border-border/30 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-foreground mb-1">
              <Baby className="h-5 w-5 text-rose-500" />
              <h2 className="font-bold text-sm">Form Pendaftaran</h2>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Anak Yatim
              </Label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={form.child_name}
                onChange={e => setForm(f => ({ ...f, child_name: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Tanggal Lahir
              </Label>
              <Input
                type="date"
                value={form.birth_date}
                onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Wali / Penanggung Jawab
              </Label>
              <Input
                placeholder="Masukkan nama wali"
                value={form.guardian_name}
                onChange={e => setForm(f => ({ ...f, guardian_name: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> No. Telepon Wali
              </Label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={form.guardian_phone}
                onChange={e => setForm(f => ({ ...f, guardian_phone: e.target.value }))}
                maxLength={15}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Alamat
              </Label>
              <Textarea
                placeholder="Masukkan alamat lengkap"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                maxLength={300}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isRegistering} className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 border-0">
              {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isRegistering ? "Mendaftar..." : "Daftar Sekarang"}
            </Button>
          </form>
        )}

        {tab === "daftar" && result && (
          <div className="animate-scale-in space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 flex items-start gap-3 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Pendaftaran Berhasil!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Simpan kode kartu <span className="font-mono font-bold">{result.unique_code}</span>. Kartu akan aktif setelah disetujui admin.
                </p>
              </div>
            </div>

            <OrphanCard registration={result} showDownload />

            <Button variant="outline" className="w-full" onClick={() => { setResult(null); setForm({ child_name: "", birth_date: "", guardian_name: "", guardian_phone: "", address: "" }); }}>
              Daftar Lagi
            </Button>
          </div>
        )}

        {tab === "cek" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border/30 space-y-4">
              <div className="flex items-center gap-2 text-foreground mb-1">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-sm">Cek Status Kartu</h2>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode kartu (SYP-XXXXXX)"
                  value={lookupCode}
                  onChange={e => setLookupCode(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="font-mono"
                />
                <Button onClick={handleLookup} disabled={lookupLoading} className="shrink-0">
                  {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {lookupResult && (
              <div className="animate-scale-in">
                <OrphanCard registration={lookupResult} showDownload />
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
