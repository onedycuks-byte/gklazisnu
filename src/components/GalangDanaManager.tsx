import { useState } from "react";
import { useFundraisingAdmin, PROPOSAL_CATEGORIES, type FundraisingProposal } from "@/hooks/useFundraising";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X, Users, Megaphone, Trash2, Pencil, IdCard, Save, Landmark, QrCode, Upload } from "lucide-react";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const STATUS_CLASS: Record<string, string> = {
  pending: "text-amber-600 bg-amber-500/10",
  approved: "text-emerald-600 bg-emerald-500/10",
  rejected: "text-destructive bg-destructive/10",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[status] || STATUS_CLASS.pending}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function ConfirmDelete({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus {label}?</AlertDialogTitle>
          <AlertDialogDescription>Data yang dihapus tidak dapat dikembalikan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function GalangDanaManager() {
  const {
    accounts, proposals, isLoading,
    setAccountStatus, setProposalStatus,
    updateProposal, deleteProposal, updateAccount, deleteAccount,
  } = useFundraisingAdmin();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [collected, setCollected] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<FundraisingProposal>>({});
  const [uploadingQris, setUploadingQris] = useState(false);

  const uploadQris = async (file: File) => {
    setUploadingQris(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `qris/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("program-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("program-images").getPublicUrl(path);
      setDraft((d) => ({ ...d, qris_image_url: data.publicUrl }));
      toast({ title: "Foto QRIS terunggah" });
    } catch (e: any) {
      toast({ title: "Gagal mengunggah QRIS", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setUploadingQris(false);
    }
  };

  const act = async (fn: typeof setAccountStatus, id: string, status: string, label: string) => {
    try {
      await fn.mutateAsync({ id, status, notes: notes[id]?.trim() || undefined });
      toast({ title: label });
      setNotes((n) => ({ ...n, [id]: "" }));
    } catch (e: any) {
      toast({ title: "Gagal memproses", description: String(e?.message || e), variant: "destructive" });
    }
  };

  const saveCollected = async (p: FundraisingProposal) => {
    const raw = collected[p.id];
    if (raw === undefined || raw === "") return;
    try {
      await updateProposal.mutateAsync({ id: p.id, collected_amount: Number(raw) });
      toast({ title: "Dana terkumpul diperbarui" });
      setCollected((c) => ({ ...c, [p.id]: "" }));
    } catch (e: any) {
      toast({ title: "Gagal memperbarui", description: String(e?.message || e), variant: "destructive" });
    }
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updateProposal.mutateAsync({
        id: editId,
        title: draft.title?.trim(),
        description: draft.description?.trim(),
        category: draft.category,
        beneficiary: draft.beneficiary?.trim() || null,
        target_amount: Number(draft.target_amount || 0),
        bank_name: draft.bank_name?.trim() || null,
        bank_account_number: draft.bank_account_number?.trim() || null,
        bank_account_holder: draft.bank_account_holder?.trim() || null,
        qris_image_url: draft.qris_image_url || null,
      });
      toast({ title: "Pengajuan diperbarui" });
      setEditId(null);
      setDraft({});
    } catch (e: any) {
      toast({ title: "Gagal menyimpan", description: String(e?.message || e), variant: "destructive" });
    }
  };

  const removeProposal = async (id: string) => {
    try {
      await deleteProposal.mutateAsync(id);
      toast({ title: "Pengajuan dihapus" });
    } catch (e: any) {
      toast({ title: "Gagal menghapus", description: String(e?.message || e), variant: "destructive" });
    }
  };

  const removeAccount = async (id: string) => {
    try {
      await deleteAccount.mutateAsync(id);
      toast({ title: "Pendaftar dihapus" });
    } catch (e: any) {
      toast({ title: "Gagal menghapus", description: String(e?.message || e), variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.full_name || "-";

  return (
    <Tabs defaultValue="pendaftar" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="pendaftar" className="text-xs gap-1"><Users className="h-3.5 w-3.5" /> Pendaftar ({accounts.length})</TabsTrigger>
        <TabsTrigger value="pengajuan" className="text-xs gap-1"><Megaphone className="h-3.5 w-3.5" /> Pengajuan ({proposals.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pendaftar" className="space-y-3">
        {accounts.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Belum ada pendaftar.</p>}
        {accounts.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-sm truncate">{a.full_name}</CardTitle>
                  <CardDescription className="text-[11px]">NIK {a.nik} · {a.phone}</CardDescription>
                </div>
                <Badge status={a.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {a.address && <p className="text-[11px] text-muted-foreground">{a.address}</p>}
              {a.ktp_url ? (
                <a href={a.ktp_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={a.ktp_url} alt={`Foto KTP ${a.full_name}`} loading="lazy" className="w-full h-40 object-contain rounded-md border bg-muted/30" />
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary"><IdCard className="h-3 w-3" /> Lihat KTP ukuran penuh</span>
                </a>
              ) : (
                <p className="text-[11px] text-muted-foreground italic">Foto KTP belum diunggah.</p>
              )}
              {a.admin_notes && <p className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2">Catatan: {a.admin_notes}</p>}
              <Input
                className="h-8 text-xs"
                placeholder="Catatan (opsional)"
                value={notes[a.id] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-8 text-xs" disabled={a.status === "approved"}
                  onClick={() => act(setAccountStatus, a.id, "approved", "Pendaftar disetujui")}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Setujui
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs" disabled={a.status === "rejected"}
                  onClick={() => act(setAccountStatus, a.id, "rejected", "Pendaftar ditolak")}>
                  <X className="h-3.5 w-3.5 mr-1" /> Tolak
                </Button>
                <ConfirmDelete label="pendaftar" onConfirm={() => removeAccount(a.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="pengajuan" className="space-y-3">
        {proposals.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Belum ada pengajuan.</p>}
        {proposals.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-sm truncate">{p.title}</CardTitle>
                  <CardDescription className="text-[11px]">
                    {p.category} · oleh {accountName(p.fundraiser_id)}
                  </CardDescription>
                </div>
                <Badge status={p.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {editId === p.id ? (
                <div className="space-y-2 rounded-md border p-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Judul</Label>
                    <Input className="h-8 text-xs" value={draft.title ?? ""} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Kategori</Label>
                    <Select value={draft.category} onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROPOSAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Penerima Manfaat</Label>
                    <Input className="h-8 text-xs" value={draft.beneficiary ?? ""} onChange={(e) => setDraft((d) => ({ ...d, beneficiary: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Target Dana (Rp)</Label>
                    <Input className="h-8 text-xs" inputMode="numeric" value={String(draft.target_amount ?? "")}
                      onChange={(e) => setDraft((d) => ({ ...d, target_amount: Number(e.target.value.replace(/\D/g, "")) }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Deskripsi</Label>
                    <Textarea rows={4} className="text-xs" value={draft.description ?? ""} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs" onClick={saveEdit}><Save className="h-3.5 w-3.5 mr-1" /> Simpan</Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => { setEditId(null); setDraft({}); }}>Batal</Button>
                  </div>
                </div>
              ) : (
                <>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-36 object-cover rounded-md" />
                  )}
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{p.description}</p>
                  {p.beneficiary && <p className="text-[11px] text-muted-foreground">Penerima: {p.beneficiary}</p>}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-bold">{formatCurrency(p.target_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Terkumpul</span>
                    <span className="font-bold text-primary">{formatCurrency(p.collected_amount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      className="h-8 text-xs"
                      inputMode="numeric"
                      placeholder="Perbarui dana terkumpul (Rp)"
                      value={collected[p.id] ?? ""}
                      onChange={(e) => setCollected((c) => ({ ...c, [p.id]: e.target.value.replace(/\D/g, "") }))}
                    />
                    <Button size="sm" className="h-8 text-xs" onClick={() => saveCollected(p)}>Simpan</Button>
                  </div>
                </>
              )}
              {p.admin_notes && <p className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2">Catatan: {p.admin_notes}</p>}
              <Input
                className="h-8 text-xs"
                placeholder="Catatan (opsional)"
                value={notes[p.id] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-8 text-xs" disabled={p.status === "approved"}
                  onClick={() => act(setProposalStatus, p.id, "approved", "Pengajuan disetujui")}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Setujui
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs" disabled={p.status === "rejected"}
                  onClick={() => act(setProposalStatus, p.id, "rejected", "Pengajuan ditolak")}>
                  <X className="h-3.5 w-3.5 mr-1" /> Tolak
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs"
                  onClick={() => { setEditId(p.id); setDraft(p); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <ConfirmDelete label="pengajuan" onConfirm={() => removeProposal(p.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
