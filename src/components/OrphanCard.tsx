import { useRef } from "react";
import { OrphanRegistration } from "@/hooks/useOrphanRegistrations";
import { Download, Heart, CreditCard, User, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrphanCardProps {
  registration: OrphanRegistration;
  showDownload?: boolean;
}

export function OrphanCard({ registration, showDownload = true }: OrphanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 800, h = 480;
    canvas.width = w;
    canvas.height = h;

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#065f46");
    grad.addColorStop(1, "#047857");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 24);
    ctx.fill();

    // Decorative circle
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.arc(w - 80, 80, 160, 0, Math.PI * 2);
    ctx.fill();

    // Header band
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(0, 0, w, 72);
    
    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("KARTU SANTUNAN YATIM PIATU", 32, 46);

    // Org
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("LAZISNU Gendongkulon", w - 200, 46);

    // Code
    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(registration.unique_code, 32, 130);

    // Status badge
    const statusText = registration.status === "approved" ? "✓ TERVERIFIKASI" : "MENUNGGU";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    const stw = ctx.measureText(statusText).width;
    ctx.fillStyle = registration.status === "approved" ? "rgba(16,185,129,0.3)" : "rgba(251,191,36,0.3)";
    ctx.beginPath();
    ctx.roundRect(32, 148, stw + 24, 28, 14);
    ctx.fill();
    ctx.fillStyle = registration.status === "approved" ? "#6ee7b7" : "#fde68a";
    ctx.fillText(statusText, 44, 167);

    // Info section
    const drawLabel = (label: string, value: string, y: number) => {
      ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(label, 32, y);
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(value, 32, y + 22);
    };

    drawLabel("NAMA ANAK YATIM", registration.child_name, 210);
    drawLabel("WALI / PENANGGUNG JAWAB", registration.guardian_name, 270);
    
    // Right column
    const drawLabelR = (label: string, value: string, y: number) => {
      ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(label, w / 2 + 20, y);
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(value, w / 2 + 20, y + 22);
    };

    drawLabelR("TANGGAL LAHIR", new Date(registration.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), 210);
    drawLabelR("NO. TELEPON WALI", registration.guardian_phone, 270);

    // Address
    drawLabel("ALAMAT", registration.address.substring(0, 60), 330);

    // Footer
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(0, h - 56, w, 56);
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`Terdaftar: ${new Date(registration.created_at).toLocaleDateString("id-ID")}`, 32, h - 24);

    // Heart icon area
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(w - 50, h - 28, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#f87171";
    ctx.fillText("♥", w - 57, h - 22);

    // Download
    const link = document.createElement("a");
    link.download = `kartu-santunan-${registration.unique_code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-3">
      {/* Preview card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-600 text-white p-5 shadow-elevated"
      >
        {/* Decorative */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-full h-14 bg-black/10" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-300" />
            <span className="text-xs font-bold tracking-wider uppercase opacity-80">Kartu Santunan Yatim Piatu</span>
          </div>
          <span className="text-[10px] opacity-50">LAZISNU</span>
        </div>

        {/* Code */}
        <p className="text-2xl font-mono font-bold tracking-widest text-amber-300 mb-2">
          {registration.unique_code}
        </p>

        {/* Status */}
        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 ${
          registration.status === "approved" 
            ? "bg-emerald-400/20 text-emerald-200" 
            : "bg-amber-400/20 text-amber-200"
        }`}>
          {registration.status === "approved" ? "✓ Terverifikasi" : "Menunggu Persetujuan"}
        </span>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-xs relative z-10">
          <div>
            <div className="flex items-center gap-1 opacity-50 mb-0.5">
              <User className="h-3 w-3" /> Nama Anak
            </div>
            <p className="font-semibold text-sm">{registration.child_name}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 opacity-50 mb-0.5">
              <Calendar className="h-3 w-3" /> Tgl Lahir
            </div>
            <p className="font-semibold text-sm">
              {new Date(registration.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 opacity-50 mb-0.5">
              <User className="h-3 w-3" /> Wali
            </div>
            <p className="font-semibold text-sm">{registration.guardian_name}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 opacity-50 mb-0.5">
              <Phone className="h-3 w-3" /> Telepon
            </div>
            <p className="font-semibold text-sm">{registration.guardian_phone}</p>
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-1 opacity-50 mb-0.5">
              <MapPin className="h-3 w-3" /> Alamat
            </div>
            <p className="font-semibold text-sm">{registration.address}</p>
          </div>
        </div>
      </div>

      {showDownload && (
        <Button onClick={handleDownload} className="w-full gap-2" variant="default">
          <Download className="h-4 w-4" />
          Download Kartu
        </Button>
      )}
    </div>
  );
}
