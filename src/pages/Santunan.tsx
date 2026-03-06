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
  Heart, ArrowLeft, UserPlus, Search, Baby, User, Phone, MapPin, Calendar,
  CreditCard, Loader2, CheckCircle2, LogIn, KeyRound, ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SantunanLoginTab } from "@/components/santunan/SantunanLoginTab";
import { SantunanRegisterForm } from "@/components/santunan/SantunanRegisterForm";

export default function Santunan() {
  useTrackPageView("/santunan");
  const navigate = useNavigate();
  const { register, isRegistering, lookupByCode } = useOrphanRegistrations();

  const [tab, setTab] = useState<"login" | "daftar">("login");
  const [result, setResult] = useState<OrphanRegistration | null>(null);
  const [form, setForm] = useState({
    child_name: "", birth_date: "", guardian_name: "", guardian_phone: "", address: "",
  });

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
            onClick={() => { setTab("login"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <LogIn className="h-4 w-4" /> Login Kartu
          </button>
          <button
            onClick={() => { setTab("daftar"); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "daftar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <UserPlus className="h-4 w-4" /> Daftar Baru
          </button>
        </div>

        {tab === "login" && (
          <SantunanLoginTab lookupByCode={lookupByCode} />
        )}

        {tab === "daftar" && !result && (
          <SantunanRegisterForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            isRegistering={isRegistering}
          />
        )}

        {tab === "daftar" && result && (
          <div className="animate-scale-in space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 flex items-start gap-3 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Pendaftaran Berhasil!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Simpan kode kartu sebagai password login Anda:
                </p>
                <p className="font-mono font-bold text-lg text-emerald-700 dark:text-emerald-200 mt-1">{result.unique_code}</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 flex items-start gap-3 border border-amber-200 dark:border-amber-800">
              <KeyRound className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Cara Login</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Gunakan kode <span className="font-mono font-bold">{result.unique_code}</span> sebagai password di tab "Login Kartu" untuk mengakses kartu santunan Anda.
                </p>
              </div>
            </div>

            <OrphanCard registration={result} showDownload />

            <Button variant="outline" className="w-full" onClick={() => { setResult(null); setForm({ child_name: "", birth_date: "", guardian_name: "", guardian_phone: "", address: "" }); }}>
              Daftar Lagi
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
