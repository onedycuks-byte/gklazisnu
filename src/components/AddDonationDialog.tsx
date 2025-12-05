import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { regions } from "@/data/regions";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddDonationDialogProps {
  onAdd: (donation: { regionId: string; amount: number; date: string; notes?: string }) => void;
  defaultRegionId?: string;
}

export function AddDonationDialog({ onAdd, defaultRegionId }: AddDonationDialogProps) {
  const [open, setOpen] = useState(false);
  const [regionId, setRegionId] = useState(defaultRegionId || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regionId || !amount || !date) {
      toast({
        title: "Data tidak lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount.replace(/[^\d]/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Nominal tidak valid",
        description: "Mohon masukkan nominal yang valid",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      regionId,
      amount: amountNum,
      date,
      notes: notes || undefined,
    });

    toast({
      title: "Berhasil!",
      description: "Data donasi berhasil ditambahkan",
    });

    setOpen(false);
    setRegionId(defaultRegionId || "");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/[^\d]/g, "");
    if (num) {
      return new Intl.NumberFormat("id-ID").format(parseInt(num));
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Donasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Data Donasi</DialogTitle>
            <DialogDescription>
              Masukkan data infaq kaleng koin yang diterima
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="region">Wilayah</Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wilayah" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                placeholder="Contoh: 150.000"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan jika diperlukan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
