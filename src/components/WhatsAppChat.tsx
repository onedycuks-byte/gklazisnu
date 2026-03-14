import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Send, MessageCircle, Calendar, Copy, Check, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WhatsAppTarget {
  label: string;
  number: string;
}

interface MessageTemplate {
  id: string;
  label: string;
  template: string;
  hasDate: boolean;
}

const KOORDINATOR_TEMPLATES: MessageTemplate[] = [
  {
    id: "laporan-koin",
    label: "📦 Laporan Pengambilan Koin",
    template: "Assalamu'alaikum Pak/Bu Bendahara,\n\nSaya Koordinator wilayah ingin melaporkan hasil pengambilan kaleng koin.\n\nWilayah: {wilayah}\nJumlah: Rp {jumlah}\nKeterangan: {keterangan}\n\nMohon konfirmasinya. Jazakallahu khairan.",
    hasDate: false,
  },
  {
    id: "konfirmasi-setoran",
    label: "✅ Konfirmasi Setoran",
    template: "Assalamu'alaikum Pak/Bu Bendahara,\n\nSaya ingin mengkonfirmasi bahwa setoran dari wilayah {wilayah} sebesar Rp {jumlah} telah dikirimkan pada tanggal {tanggal}.\n\nMohon dicek dan dikonfirmasi. Terima kasih.",
    hasDate: true,
  },
  {
    id: "tanya-jadwal",
    label: "📅 Tanya Jadwal Pengambilan",
    template: "Assalamu'alaikum Pak/Bu Bendahara,\n\nMohon informasi jadwal pengambilan kaleng koin untuk wilayah {wilayah}.\n\nTerima kasih atas informasinya.",
    hasDate: false,
  },
];

const KETUA_BENDAHARA_TEMPLATES: MessageTemplate[] = [
  {
    id: "instruksi-laporan",
    label: "📊 Instruksi Laporan Keuangan",
    template: "Assalamu'alaikum Bendahara,\n\nMohon segera disiapkan laporan keuangan {periode}.\n\nDetail yang diperlukan:\n- Rekap pemasukan\n- Rekap pengeluaran\n- Saldo akhir\n\nMohon diselesaikan sebelum tanggal {tanggal}. Jazakallahu khairan.",
    hasDate: true,
  },
  {
    id: "instruksi-pencairan",
    label: "💰 Instruksi Pencairan Dana",
    template: "Assalamu'alaikum Bendahara,\n\nMohon untuk segera memproses pencairan dana sebagai berikut:\n\nKeperluan: {keperluan}\nNominal: Rp {jumlah}\n\nMohon segera diproses. Terima kasih.",
    hasDate: false,
  },
  {
    id: "reminder-setoran",
    label: "🔔 Reminder Setoran Koordinator",
    template: "Assalamu'alaikum Bendahara,\n\nMohon ditindaklanjuti setoran dari koordinator wilayah yang belum dikonfirmasi.\n\nMohon dicek di sistem dan segera dikonfirmasi. Terima kasih.",
    hasDate: false,
  },
  {
    id: "instruksi-custom",
    label: "📝 Instruksi Khusus",
    template: "Assalamu'alaikum Bendahara,\n\n{pesan}\n\nMohon segera ditindaklanjuti. Jazakallahu khairan.",
    hasDate: false,
  },
];

const KETUA_SEKRETARIS_TEMPLATES: MessageTemplate[] = [
  {
    id: "instruksi-surat",
    label: "📄 Instruksi Pembuatan Surat",
    template: "Assalamu'alaikum Sekretaris,\n\nMohon segera dibuatkan surat {jenis_surat} untuk keperluan {keperluan}.\n\nDetail:\n{detail}\n\nMohon diselesaikan sebelum tanggal {tanggal}. Terima kasih.",
    hasDate: true,
  },
  {
    id: "instruksi-undangan",
    label: "📨 Instruksi Undangan Rapat",
    template: "Assalamu'alaikum Sekretaris,\n\nMohon disiapkan undangan rapat dengan detail:\n\nAgenda: {agenda}\nHari/Tanggal: {tanggal}\nWaktu: {waktu}\nTempat: {tempat}\n\nMohon segera disebarkan ke semua pengurus. Terima kasih.",
    hasDate: true,
  },
  {
    id: "instruksi-data",
    label: "📋 Instruksi Update Data",
    template: "Assalamu'alaikum Sekretaris,\n\nMohon segera diupdate data {jenis_data} di sistem.\n\nKeterangan: {keterangan}\n\nTerima kasih atas kerjasamanya.",
    hasDate: false,
  },
  {
    id: "instruksi-custom-sek",
    label: "📝 Instruksi Khusus",
    template: "Assalamu'alaikum Sekretaris,\n\n{pesan}\n\nMohon segera ditindaklanjuti. Jazakallahu khairan.",
    hasDate: false,
  },
];

const SEKRETARIS_KOORDINATOR_TEMPLATES: MessageTemplate[] = [
  {
    id: "info-jadwal",
    label: "📅 Info Jadwal Pengambilan",
    template: "Assalamu'alaikum Pak/Bu Koordinator,\n\nDiinformasikan jadwal pengambilan kaleng koin untuk wilayah Anda:\n\nHari/Tanggal: {tanggal}\nWaktu: {waktu}\nTempat: {tempat}\n\nMohon dipersiapkan. Terima kasih.",
    hasDate: true,
  },
  {
    id: "reminder-laporan",
    label: "🔔 Reminder Laporan",
    template: "Assalamu'alaikum Pak/Bu Koordinator,\n\nMohon segera melaporkan hasil pengambilan kaleng koin wilayah Anda melalui sistem.\n\nJika sudah diinput, mohon abaikan pesan ini. Jazakallahu khairan.",
    hasDate: false,
  },
  {
    id: "info-rapat",
    label: "📨 Undangan Rapat/Kegiatan",
    template: "Assalamu'alaikum Pak/Bu Koordinator,\n\nDiundang untuk menghadiri:\n\nAgenda: {agenda}\nHari/Tanggal: {tanggal}\nWaktu: {waktu}\nTempat: {tempat}\n\nMohon kehadirannya. Terima kasih.",
    hasDate: true,
  },
  {
    id: "info-update",
    label: "📋 Info & Update",
    template: "Assalamu'alaikum Pak/Bu Koordinator,\n\n{pesan}\n\nMohon ditindaklanjuti. Terima kasih.",
    hasDate: false,
  },
  {
    id: "ucapan-terima-kasih",
    label: "🤝 Ucapan Terima Kasih",
    template: "Assalamu'alaikum Pak/Bu Koordinator,\n\nTerima kasih atas kerja keras dan dedikasi Anda dalam mengelola wilayah. Semoga Allah membalas kebaikan Anda.\n\nJazakallahu khairan.",
    hasDate: false,
  },
];

interface Props {
  role: "koordinator" | "ketua" | "sekretaris";
  targets: WhatsAppTarget[];
  initialMessage?: string;
  onMessageConsumed?: () => void;
}

export function WhatsAppChat({ role, targets, initialMessage, onMessageConsumed }: Props) {
  const [selectedTarget, setSelectedTarget] = useState<WhatsAppTarget>(targets[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [message, setMessage] = useState("");
  const [includeDate, setIncludeDate] = useState(false);
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [copied, setCopied] = useState(false);

  // Auto-fill message from submission
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      onMessageConsumed?.();
    }
  }, [initialMessage]);

  const templates = role === "koordinator"
    ? KOORDINATOR_TEMPLATES
    : role === "sekretaris"
    ? SEKRETARIS_KOORDINATOR_TEMPLATES
    : selectedTarget.label.toLowerCase().includes("bendahara")
    ? KETUA_BENDAHARA_TEMPLATES
    : KETUA_SEKRETARIS_TEMPLATES;

  const handleSelectTemplate = (tpl: MessageTemplate) => {
    setSelectedTemplate(tpl);
    let msg = tpl.template;
    if (tpl.hasDate && includeDate) {
      const formatted = new Date(customDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      msg = msg.replace("{tanggal}", formatted);
    }
    setMessage(msg);
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast({ title: "Pesan kosong", description: "Tulis pesan terlebih dahulu", variant: "destructive" });
      return;
    }
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${selectedTarget.number}?text=${encoded}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast({ title: "Disalin!", description: "Pesan berhasil disalin ke clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Target Selection (for ketua with multiple targets) */}
      {targets.length > 1 && (
        <div className="flex gap-2">
          {targets.map((t) => (
            <Button
              key={t.number}
              variant={selectedTarget.number === t.number ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={() => {
                setSelectedTarget(t);
                setSelectedTemplate(null);
                setMessage("");
              }}
            >
              <Phone className="h-3 w-3" />
              {t.label}
            </Button>
          ))}
        </div>
      )}

      {/* Target info */}
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{selectedTarget.label}</p>
            <p className="text-xs text-muted-foreground">+{selectedTarget.number}</p>
          </div>
        </CardContent>
      </Card>

      {/* Date toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs">Sertakan Tanggal</Label>
        </div>
        <Switch checked={includeDate} onCheckedChange={setIncludeDate} />
      </div>

      {includeDate && (
        <Input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="text-sm"
        />
      )}

      {/* Template Selection */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Pilih Template Pesan</Label>
        <div className="grid gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`text-left p-3 rounded-lg border text-xs transition-all ${
                selectedTemplate?.id === tpl.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Editor */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Pesan {selectedTemplate ? "(edit sesuai kebutuhan)" : "(tulis manual)"}
        </Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik atau pilih template pesan..."
          className="min-h-[150px] text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1"
          onClick={handleCopy}
          disabled={!message.trim()}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Tersalin" : "Salin"}
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs gap-1 bg-green-600 hover:bg-green-700"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <Send className="h-3 w-3" />
          Kirim via WhatsApp
        </Button>
      </div>
    </div>
  );
}
