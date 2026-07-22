import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import { Save, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MessageTemplate {
  id: string;
  label: string;
  template: string;
  hasDate: boolean;
}

interface Props {
  title: string;
  settingKey: string;
  targetLabel: string;
  templates: MessageTemplate[];
  currentPhone: string;
  onSavePhone: (value: string) => Promise<any>;
}

export function KoordinatorKhususChat({ title, targetLabel, templates, currentPhone, onSavePhone }: Props) {
  const [phone, setPhone] = useState(currentPhone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhone(currentPhone);
  }, [currentPhone]);

  const normalized = phone.replace(/[^\d]/g, "").replace(/^0/, "62");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSavePhone(normalized);
      toast({ title: "Tersimpan", description: "Nomor koordinator diperbarui" });
    } catch (e) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1">
            <Phone className="h-3 w-3" /> Nomor WhatsApp Koordinator
          </Label>
          <div className="flex gap-2">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="628xxxxxxxxxx"
              className="text-sm"
            />
            <Button size="sm" onClick={handleSave} disabled={saving || !normalized} className="gap-1">
              <Save className="h-3 w-3" /> Simpan
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Format: 62xxx (tanpa tanda +)</p>
        </div>

        {normalized ? (
          <WhatsAppChat
            role="sekretaris"
            targets={[{ label: targetLabel, number: normalized }]}
            customTemplates={templates}
          />
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Simpan nomor WhatsApp koordinator terlebih dahulu untuk mulai chat.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export const SANTUNAN_TEMPLATES: MessageTemplate[] = [
  {
    id: "und-santunan",
    label: "📨 Undangan Kegiatan Santunan",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Santunan Yatim-Piatu yang kami hormati,\n\nBersama ini kami mengundang Bapak/Ibu untuk hadir dalam kegiatan santunan yatim-piatu:\n\nHari/Tanggal: {tanggal}\nWaktu: {waktu}\nTempat: {tempat}\nAgenda: {agenda}\n\nMohon kehadirannya tepat waktu. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.\n\nJazakumullahu khairan katsiran.",
    hasDate: true,
  },
  {
    id: "info-penyaluran-santunan",
    label: "💝 Pemberitahuan Penyaluran Santunan",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Santunan Yatim-Piatu,\n\nDiberitahukan bahwa penyaluran santunan yatim-piatu akan dilaksanakan pada:\n\nHari/Tanggal: {tanggal}\nTempat: {tempat}\nJumlah Penerima: {jumlah} anak\nNominal per anak: Rp {nominal}\n\nMohon koordinasi dengan tim penyaluran dan pastikan data penerima sudah valid. Terima kasih.",
    hasDate: true,
  },
  {
    id: "minta-laporan-santunan",
    label: "📋 Permintaan Laporan Penyaluran",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Santunan Yatim-Piatu,\n\nMohon segera menyampaikan laporan hasil penyaluran santunan yang telah dilaksanakan, meliputi:\n\n1. Daftar penerima santunan\n2. Dokumentasi (foto kegiatan)\n3. Bukti serah terima\n4. Kendala di lapangan (jika ada)\n\nLaporan mohon disampaikan paling lambat tanggal {tanggal}. Jazakumullahu khairan.",
    hasDate: true,
  },
  {
    id: "terimakasih-santunan",
    label: "🤝 Ucapan Terima Kasih",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Santunan Yatim-Piatu,\n\nAtas nama pengurus LAZISNU, kami mengucapkan terima kasih yang sebesar-besarnya atas dedikasi, waktu, dan tenaga yang telah Bapak/Ibu curahkan dalam kegiatan santunan yatim-piatu.\n\nSemoga Allah SWT membalas segala kebaikan dengan pahala yang berlipat ganda dan menjadikannya amal jariyah yang tak terputus.\n\nJazakumullahu khairan katsiran.",
    hasDate: false,
  },
  {
    id: "custom-santunan",
    label: "📝 Pesan Khusus (Custom)",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Santunan Yatim-Piatu,\n\n{pesan}\n\nMohon ditindaklanjuti. Terima kasih atas perhatiannya.\n\nJazakumullahu khairan.",
    hasDate: false,
  },
];

export const PENDIDIKAN_TEMPLATES: MessageTemplate[] = [
  {
    id: "und-pendidikan",
    label: "📨 Undangan Rapat/Kegiatan",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Penyaluran Bantuan Pendidikan yang kami hormati,\n\nDengan hormat kami mengundang Bapak/Ibu untuk hadir dalam:\n\nAgenda: {agenda}\nHari/Tanggal: {tanggal}\nWaktu: {waktu}\nTempat: {tempat}\n\nMengingat pentingnya agenda ini, mohon kehadirannya. Terima kasih.\n\nJazakumullahu khairan.",
    hasDate: true,
  },
  {
    id: "info-penyaluran-pendidikan",
    label: "🎓 Pemberitahuan Penyaluran Bantuan",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Penyaluran Bantuan Pendidikan,\n\nDiinformasikan bahwa penyaluran bantuan pendidikan akan dilaksanakan pada:\n\nHari/Tanggal: {tanggal}\nTempat: {tempat}\nJumlah Penerima: {jumlah} siswa\nBentuk Bantuan: {bentuk}\nNominal: Rp {nominal}\n\nMohon dipersiapkan data penerima dan koordinasi dengan pihak sekolah. Terima kasih.",
    hasDate: true,
  },
  {
    id: "minta-laporan-pendidikan",
    label: "📋 Permintaan Laporan Penyaluran",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Penyaluran Bantuan Pendidikan,\n\nMohon segera menyampaikan laporan penyaluran bantuan pendidikan yang telah dilaksanakan, meliputi:\n\n1. Daftar penerima bantuan\n2. Nama sekolah/lembaga\n3. Dokumentasi kegiatan\n4. Bukti tanda terima\n5. Evaluasi & kendala\n\nLaporan mohon disampaikan paling lambat tanggal {tanggal}. Jazakumullahu khairan.",
    hasDate: true,
  },
  {
    id: "terimakasih-pendidikan",
    label: "🤝 Ucapan Terima Kasih",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Penyaluran Bantuan Pendidikan,\n\nAtas nama pengurus LAZISNU, kami menyampaikan terima kasih dan penghargaan setinggi-tingginya atas dedikasi Bapak/Ibu dalam menyalurkan bantuan pendidikan bagi para siswa yang membutuhkan.\n\nSemoga menjadi amal jariyah dan ilmu yang bermanfaat, serta dibalas Allah SWT dengan sebaik-baik balasan.\n\nJazakumullahu khairan katsiran.",
    hasDate: false,
  },
  {
    id: "custom-pendidikan",
    label: "📝 Pesan Khusus (Custom)",
    template: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu Koordinator Penyaluran Bantuan Pendidikan,\n\n{pesan}\n\nMohon ditindaklanjuti. Terima kasih atas perhatiannya.\n\nJazakumullahu khairan.",
    hasDate: false,
  },
];
