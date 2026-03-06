import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Baby, User, Phone, MapPin, Calendar, UserPlus, Loader2,
} from "lucide-react";

interface FormData {
  child_name: string;
  birth_date: string;
  guardian_name: string;
  guardian_phone: string;
  address: string;
}

interface Props {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isRegistering: boolean;
}

export function SantunanRegisterForm({ form, setForm, onSubmit, isRegistering }: Props) {
  return (
    <form onSubmit={onSubmit} className="bg-card rounded-2xl p-5 shadow-card border border-border/30 space-y-4 animate-fade-in">
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
  );
}
