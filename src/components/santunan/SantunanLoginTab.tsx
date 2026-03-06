import { useState } from "react";
import { OrphanCard } from "@/components/OrphanCard";
import { OrphanRegistration } from "@/hooks/useOrphanRegistrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  KeyRound, Loader2, ShieldCheck, CreditCard, LogIn, LogOut, Eye, EyeOff,
} from "lucide-react";

interface Props {
  lookupByCode: (code: string) => Promise<OrphanRegistration | null>;
}

export function SantunanLoginTab({ lookupByCode }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState<OrphanRegistration | null>(null);
  const [showCode, setShowCode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({ title: "Error", description: "Masukkan kode kartu Anda", variant: "destructive" });
      return;
    }
    setLoading(true);
    const data = await lookupByCode(code.toUpperCase().trim());
    setLoading(false);

    if (!data) {
      toast({ title: "Login Gagal", description: "Kode kartu tidak ditemukan. Periksa kembali kode Anda.", variant: "destructive" });
      return;
    }

    setLoggedIn(data);
    toast({ title: "Login Berhasil!", description: `Selamat datang, ${data.child_name}` });
  };

  const handleLogout = () => {
    setLoggedIn(null);
    setCode("");
    toast({ title: "Logout", description: "Anda telah keluar dari kartu santunan." });
  };

  if (loggedIn) {
    return (
      <div className="space-y-4 animate-scale-in">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Login Berhasil</p>
              <p className="text-xs text-white/80">Halo, {loggedIn.child_name}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </div>
        </div>

        {/* Status info */}
        <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
          loggedIn.status === "approved"
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            : loggedIn.status === "rejected"
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
        }`}>
          <CreditCard className={`h-5 w-5 shrink-0 mt-0.5 ${
            loggedIn.status === "approved" ? "text-emerald-500" :
            loggedIn.status === "rejected" ? "text-red-500" : "text-amber-500"
          }`} />
          <div>
            <p className={`text-sm font-bold ${
              loggedIn.status === "approved" ? "text-emerald-700 dark:text-emerald-300" :
              loggedIn.status === "rejected" ? "text-red-700 dark:text-red-300" :
              "text-amber-700 dark:text-amber-300"
            }`}>
              {loggedIn.status === "approved" ? "Kartu Aktif & Terverifikasi" :
               loggedIn.status === "rejected" ? "Pendaftaran Ditolak" :
               "Menunggu Persetujuan Admin"}
            </p>
            <p className={`text-xs mt-0.5 ${
              loggedIn.status === "approved" ? "text-emerald-600 dark:text-emerald-400" :
              loggedIn.status === "rejected" ? "text-red-600 dark:text-red-400" :
              "text-amber-600 dark:text-amber-400"
            }`}>
              {loggedIn.status === "approved"
                ? "Kartu santunan Anda sudah aktif dan dapat digunakan."
                : loggedIn.status === "rejected"
                ? `Alasan: ${loggedIn.admin_notes || "Tidak ada catatan"}`
                : "Pendaftaran Anda sedang ditinjau oleh admin."}
            </p>
          </div>
        </div>

        {/* Card */}
        <OrphanCard registration={loggedIn} showDownload />
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border/30 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="font-bold text-foreground">Login Kartu Santunan</h2>
          <p className="text-xs text-muted-foreground">
            Masukkan kode unik kartu Anda untuk mengakses informasi santunan
          </p>
        </div>

        {/* Code input */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> Kode Kartu (Password)
          </Label>
          <div className="relative">
            <Input
              type={showCode ? "text" : "password"}
              placeholder="SYP-XXXXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              className="font-mono text-lg tracking-widest pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Kode ini diberikan saat pendaftaran. Format: SYP-XXXXXX
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 border-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Memverifikasi..." : "Login"}
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-muted/50 rounded-2xl p-4 border border-border/20">
        <p className="text-xs text-muted-foreground text-center">
          Belum punya kartu? Klik tab <span className="font-semibold text-foreground">"Daftar Baru"</span> untuk mendaftarkan anak yatim piatu.
        </p>
      </div>
    </form>
  );
}
