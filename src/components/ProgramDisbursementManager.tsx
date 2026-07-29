import { useState } from "react";
import { useProgramDisbursements } from "@/hooks/useProgramDisbursements";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HandCoins, Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  programId: string;
  programTitle: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatAmount = (v: string) => {
  const num = v.replace(/[^\d]/g, "");
  return num ? new Intl.NumberFormat("id-ID").format(parseInt(num)) : "";
};

export function ProgramDisbursementManager({ programId, programTitle }: Props) {
  const { disbursements, totalDisbursed, addDisbursement, deleteDisbursement, uploadImage, isAdding } =
    useProgramDisbursements(programId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    recipient_name: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAdd = async () => {
    if (!form.recipient_name || !form.amount) {
      toast.error("Nama penerima & nominal wajib diisi");
      return;
    }
    try {
      setUploading(true);
      let image_url: string | null = null;
      if (file) image_url = await uploadImage(file);
      await addDisbursement({
        program_id: programId,
        recipient_name: form.recipient_name,
        amount: parseInt(form.amount.replace(/[^\d]/g, "")) || 0,
        date: form.date,
        description: form.description || null,
        image_url,
      });
      toast.success("Penyaluran dicatat");
      setForm({ recipient_name: "", amount: "", date: new Date().toISOString().slice(0, 10), description: "" });
      setFile(null);
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Kelola Penyaluran">
          <HandCoins className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Penyaluran: {programTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 max-h-[65vh] overflow-y-auto">
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Tersalurkan</p>
            <p className="text-lg font-bold text-primary">{fmt(totalDisbursed)}</p>
          </div>

          <div className="grid gap-2 border border-border rounded-lg p-3">
            <p className="text-xs font-semibold">+ Tambah Penyaluran</p>
            <div className="grid gap-1.5">
              <Label className="text-xs">Nama Penerima / Kegiatan</Label>
              <Input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label className="text-xs">Nominal (Rp)</Label>
                <Input
                  value={formatAmount(form.amount)}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  inputMode="numeric"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Tanggal</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Keterangan</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Foto (opsional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button size="sm" onClick={handleAdd} disabled={uploading || isAdding}>
              {(uploading || isAdding) ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3.5 w-3.5" />}
              Simpan
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Riwayat ({disbursements.length})</p>
            {disbursements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">Belum ada catatan</p>
            ) : (
              disbursements.map((d) => (
                <div key={d.id} className="border border-border rounded-lg p-2 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{d.recipient_name}</p>
                    <p className="text-xs text-primary font-bold">{fmt(d.amount)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {d.description && <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive shrink-0"
                    onClick={() => {
                      if (confirm("Hapus catatan ini?")) deleteDisbursement(d.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
