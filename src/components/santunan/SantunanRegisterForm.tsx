import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Baby, User, Phone, MapPin, Calendar, UserPlus, Loader2,
  GraduationCap, School, Users, Heart, Upload, FileImage, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface RegisterFormData {
  child_name: string;
  birth_date: string;
  gender: string;
  education: string;
  school_name: string;
  father_name: string;
  mother_name: string;
  cause_of_orphan: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relation: string;
  address: string;
  ktp_url: string;
}

export const emptyForm: RegisterFormData = {
  child_name: "", birth_date: "", gender: "laki-laki",
  education: "", school_name: "",
  father_name: "", mother_name: "", cause_of_orphan: "",
  guardian_name: "", guardian_phone: "", guardian_relation: "",
  address: "", ktp_url: "",
};

interface Props {
  form: RegisterFormData;
  setForm: React.Dispatch<React.SetStateAction<RegisterFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isRegistering: boolean;
}

export function SantunanRegisterForm({ form, setForm, onSubmit, isRegistering }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);

  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const ext = file.name.split(".").pop();
    const path = `ktp-${Date.now()}.${ext}`;

    // Use XMLHttpRequest for progress tracking
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const uploadUrl = `${supabaseUrl}/storage/v1/object/ktp-uploads/${path}`;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(pct);
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Upload gagal"));
      });
      xhr.addEventListener("error", () => reject(new Error("Upload gagal")));
      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Authorization", `Bearer ${supabaseKey}`);
      xhr.setRequestHeader("apikey", supabaseKey);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.send(file);
    }).catch(err => {
      alert("Gagal upload KTP: " + err.message);
      setUploading(false);
      setUploadProgress(0);
      return;
    });

    const { data: urlData } = supabase.storage.from("ktp-uploads").getPublicUrl(path);
    setForm(f => ({ ...f, ktp_url: urlData.publicUrl }));
    setKtpPreview(urlData.publicUrl);
    setUploading(false);
    setUploadProgress(0);
  };

  const removeKtp = () => {
    setForm(f => ({ ...f, ktp_url: "" }));
    setKtpPreview(null);
  };

  return (
    <form onSubmit={onSubmit} className="bg-card rounded-2xl p-5 shadow-card border border-border/30 space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 text-foreground mb-1">
        <Baby className="h-5 w-5 text-rose-500" />
        <h2 className="font-bold text-sm">Form Pendaftaran Anak Yatim Piatu</h2>
      </div>

      {/* === DATA ANAK === */}
      <div className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Baby className="h-3.5 w-3.5" /> Data Anak
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Lengkap Anak
          </Label>
          <Input placeholder="Masukkan nama lengkap" value={form.child_name}
            onChange={e => setForm(f => ({ ...f, child_name: e.target.value }))} maxLength={100} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Tanggal Lahir
          </Label>
          <Input type="date" value={form.birth_date}
            onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" /> Jenis Kelamin
          </Label>
          <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="laki-laki">Laki-laki</SelectItem>
              <SelectItem value="perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Pendidikan
          </Label>
          <Select value={form.education} onValueChange={v => setForm(f => ({ ...f, education: v }))}>
            <SelectTrigger><SelectValue placeholder="Pilih pendidikan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="belum-sekolah">Belum Sekolah</SelectItem>
              <SelectItem value="paud">PAUD/TK</SelectItem>
              <SelectItem value="sd">SD/MI</SelectItem>
              <SelectItem value="smp">SMP/MTs</SelectItem>
              <SelectItem value="sma">SMA/MA/SMK</SelectItem>
              <SelectItem value="kuliah">Perguruan Tinggi</SelectItem>
              <SelectItem value="tidak-sekolah">Tidak Sekolah</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <School className="h-3.5 w-3.5 text-muted-foreground" /> Nama Sekolah
          </Label>
          <Input placeholder="Nama sekolah (jika ada)" value={form.school_name}
            onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))} maxLength={100} />
        </div>
      </div>

      {/* === DATA ORANG TUA === */}
      <div className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pt-2">
        <Heart className="h-3.5 w-3.5" /> Data Orang Tua
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Ayah
          </Label>
          <Input placeholder="Nama ayah (alm.)" value={form.father_name}
            onChange={e => setForm(f => ({ ...f, father_name: e.target.value }))} maxLength={100} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Ibu
          </Label>
          <Input placeholder="Nama ibu" value={form.mother_name}
            onChange={e => setForm(f => ({ ...f, mother_name: e.target.value }))} maxLength={100} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-muted-foreground" /> Penyebab Yatim/Piatu
          </Label>
          <Select value={form.cause_of_orphan} onValueChange={v => setForm(f => ({ ...f, cause_of_orphan: v }))}>
            <SelectTrigger><SelectValue placeholder="Pilih penyebab" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ayah-meninggal">Ayah Meninggal (Yatim)</SelectItem>
              <SelectItem value="ibu-meninggal">Ibu Meninggal (Piatu)</SelectItem>
              <SelectItem value="keduanya-meninggal">Kedua Orang Tua Meninggal (Yatim Piatu)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* === DATA WALI === */}
      <div className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pt-2">
        <Users className="h-3.5 w-3.5" /> Data Wali / Penanggung Jawab
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Wali
          </Label>
          <Input placeholder="Masukkan nama wali" value={form.guardian_name}
            onChange={e => setForm(f => ({ ...f, guardian_name: e.target.value }))} maxLength={100} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> No. Telepon Wali
          </Label>
          <Input type="tel" placeholder="08xxxxxxxxxx" value={form.guardian_phone}
            onChange={e => setForm(f => ({ ...f, guardian_phone: e.target.value }))} maxLength={15} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" /> Hubungan dengan Anak
          </Label>
          <Select value={form.guardian_relation} onValueChange={v => setForm(f => ({ ...f, guardian_relation: v }))}>
            <SelectTrigger><SelectValue placeholder="Pilih hubungan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ibu">Ibu</SelectItem>
              <SelectItem value="kakek-nenek">Kakek/Nenek</SelectItem>
              <SelectItem value="paman-bibi">Paman/Bibi</SelectItem>
              <SelectItem value="kakak">Kakak</SelectItem>
              <SelectItem value="kerabat-lain">Kerabat Lain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* === ALAMAT === */}
      <div className="space-y-1.5 pt-2">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Alamat Lengkap
        </Label>
        <Textarea placeholder="RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten" value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))} maxLength={500} rows={3} />
      </div>

      {/* === KTP UPLOAD === */}
      <div className="space-y-1.5 pt-2">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <FileImage className="h-3.5 w-3.5 text-muted-foreground" /> Foto KTP Wali
        </Label>
        
        {ktpPreview || form.ktp_url ? (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img src={ktpPreview || form.ktp_url} alt="KTP" className="w-full h-40 object-cover" />
            <button type="button" onClick={removeKtp}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-muted/50 transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="w-full max-w-[200px] space-y-1.5">
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-foreground text-center">{uploadProgress}%</p>
                </div>
                <span className="text-xs text-muted-foreground">Mengupload...</span>
              </div>
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
            {!uploading && (
              <span className="text-xs text-muted-foreground">
                Klik untuk upload foto KTP (maks. 5MB)
              </span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleKtpUpload} disabled={uploading} />
          </label>
        )}
      </div>

      <Button type="submit" disabled={isRegistering || uploading}
        className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 border-0">
        {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {isRegistering ? "Mendaftar..." : "Daftar Sekarang"}
      </Button>
    </form>
  );
}
