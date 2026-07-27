import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useOrphanRegistrations } from "@/hooks/useOrphanRegistrations";
import { useSantunanGallery } from "@/hooks/useSantunanGallery";
import { useSantunanDisbursements } from "@/hooks/useSantunanDisbursements";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTrackPageView } from "@/hooks/useAnalytics";
import {
  Heart, ArrowLeft, UserPlus, ChevronLeft, ChevronRight, ImageIcon, HandCoins,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SantunanRegisterForm, emptyForm } from "@/components/santunan/SantunanRegisterForm";

export default function Santunan() {
  useTrackPageView("/santunan");
  const navigate = useNavigate();
  const { register, isRegistering } = useOrphanRegistrations();
  const { images } = useSantunanGallery();
  const { disbursements, totalDisbursed } = useSantunanDisbursements();

  const [tab, setTab] = useState<"galeri" | "tersalurkan" | "daftar">("galeri");
  const [form, setForm] = useState(emptyForm);
  const [registered, setRegistered] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.child_name || !form.birth_date || !form.guardian_name || !form.guardian_phone || !form.address || !form.cause_of_orphan) {
      toast({ title: "Error", description: "Lengkapi semua data wajib", variant: "destructive" });
      return;
    }
    try {
      await register(form);
      setRegistered(true);
      toast({ title: "Berhasil!", description: "Pendaftaran berhasil dikirim. Tunggu persetujuan admin." });
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
            <p className="text-xs text-white/70">Program santunan anak yatim LAZISNU</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Tab Selector */}
        <div className="flex gap-2 bg-muted rounded-2xl p-1">
          <button
            onClick={() => setTab("galeri")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "galeri" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <ImageIcon className="h-4 w-4" /> Galeri
          </button>
          <button
            onClick={() => { setTab("daftar"); setRegistered(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "daftar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            <UserPlus className="h-4 w-4" /> Daftar Baru
          </button>
        </div>

        {/* Gallery Tab */}
        {tab === "galeri" && (
          <div className="space-y-4 animate-fade-in">
            {/* Slideshow */}
            {images.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-muted">
                <img
                  src={images[slideIndex]?.image_url}
                  alt={images[slideIndex]?.caption || "Galeri santunan"}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                {images[slideIndex]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                    <p className="text-white text-sm font-medium">{images[slideIndex].caption}</p>
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSlideIndex(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSlideIndex(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlideIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === slideIndex ? "bg-white w-4" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/50 border border-border/30 p-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada galeri santunan</p>
              </div>
            )}

            {/* Gallery grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSlideIndex(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      i === slideIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    }`}
                  >
                    <img src={img.image_url} alt={img.caption || ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Register Tab */}
        {tab === "daftar" && !registered && (
          <SantunanRegisterForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            isRegistering={isRegistering}
          />
        )}

        {tab === "daftar" && registered && (
          <div className="animate-scale-in space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 flex items-start gap-3 border border-emerald-200 dark:border-emerald-800">
              <Heart className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Pendaftaran Berhasil!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Data pendaftaran telah dikirim dan akan ditinjau oleh admin. Silakan tunggu konfirmasi dari pengurus LAZISNU.
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setRegistered(false); setForm(emptyForm); }}>
              Daftar Lagi
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
