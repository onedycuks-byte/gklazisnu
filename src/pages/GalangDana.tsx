import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMyFundraiser, nikToEmail, PROPOSAL_CATEGORIES } from "@/hooks/useFundraising";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Megaphone, LogOut, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { useTrackPageView } from "@/hooks/useAnalytics";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const STATUS_META: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Menunggu Verifikasi", className: "text-amber-600 bg-amber-500/10", icon: Clock },
  approved: { label: "Disetujui", className: "text-emerald-600 bg-emerald-500/10", icon: CheckCircle2 },
  rejected: { label: "Ditolak", className: "text-destructive bg-destructive/10", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}>
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

export default function GalangDana() {
  useTrackPageView("/galang-dana");
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { account, isLoading: accountLoading, proposals, createProposal } = useMyFundraiser(user?.id);

  // auth forms
  const [mode, setMode] = useState("masuk");
  const [busy, setBusy] = useState(false);
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // proposal form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(PROPOSAL_CATEGORIES[0]);
  const [beneficiary, setBeneficiary] = useState("");
  const [target, setTarget] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const validNik = (v: string) => /^\d{16}$/.test(v.trim());

  const handleRegister = async () => {
    if (!validNik(nik)) return toast({ title: "NIK harus 16 digit angka", variant: "destructive" });
    if (!fullName.trim() || !phone.trim()) return toast({ title: "Nama dan nomor HP wajib diisi", variant: "destructive" });
    if (password.length < 6) return toast({ title: "Sandi minimal 6 karakter", variant: "destructive" });
    setBusy(true);
    try {
      const email = nikToEmail(nik);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/galang-dana` },
      });
      if (error) throw error;
      const uid = data.user?.id;
      if (!uid) throw new Error("Pendaftaran gagal, coba lagi.");
      const { error: insErr } = await supabase.from("fundraiser_accounts").insert({
        user_id: uid,
        nik: nik.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || null,
        status: "pending",
      });
      if (insErr) throw insErr;
      toast({ title: "Pendaftaran terkirim", description: "Menunggu konfirmasi pengurus." });
      setPassword("");
    } catch (e: any) {
      const msg = String(e?.message || e);
      toast({
        title: "Gagal mendaftar",
        description: msg.includes("already registered") ? "NIK sudah terdaftar, silakan masuk." : msg,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    if (!validNik(nik)) return toast({ title: "NIK harus 16 digit angka", variant: "destructive" });
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: nikToEmail(nik), password });
      if (error) throw error;
      toast({ title: "Berhasil masuk" });
      setPassword("");
    } catch (e: any) {
      toast({ title: "Gagal masuk", description: "NIK atau sandi salah.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!title.trim() || !description.trim() || !target) {
      return toast({ title: "Judul, deskripsi, dan target dana wajib diisi", variant: "destructive" });
    }
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const path = `proposals/${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const { error: upErr } = await supabase.storage.from("program-images").upload(path, imageFile);
        if (upErr) throw upErr;
        image_url = supabase.storage.from("program-images").getPublicUrl(path).data.publicUrl;
      }
      await createProposal.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        beneficiary: beneficiary.trim() || undefined,
        target_amount: Number(target),
        image_url,
      });
      toast({ title: "Pengajuan terkirim", description: "Menunggu persetujuan pengurus." });
      setTitle(""); setDescription(""); setBeneficiary(""); setTarget(""); setImageFile(null); setShowForm(false);
    } catch (e: any) {
      toast({ title: "Gagal mengirim pengajuan", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const loading = authLoading || (!!user && accountLoading);

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Megaphone className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">Galang Dana</h1>
              <p className="text-[10px] text-muted-foreground truncate">Pengajuan penggalangan dana</p>
            </div>
          </div>
          {user && account && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !user || !account ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Akun Penggalang Dana</CardTitle>
              <CardDescription className="text-xs">
                Daftar dengan NIK KTP dan sandi. Pendaftaran diverifikasi pengurus sebelum bisa mengajukan penggalangan dana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={setMode} className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="masuk" className="text-xs">Masuk</TabsTrigger>
                  <TabsTrigger value="daftar" className="text-xs">Daftar</TabsTrigger>
                </TabsList>

                <TabsContent value="masuk" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">NIK KTP</Label>
                    <Input inputMode="numeric" maxLength={16} value={nik} onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))} placeholder="16 digit NIK" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sandi</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                  </div>
                  <Button className="w-full" disabled={busy} onClick={handleLogin}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Masuk
                  </Button>
                  {user && !account && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      Akun ini belum terdaftar sebagai penggalang dana. Silakan lengkapi pendaftaran di tab Daftar.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="daftar" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">NIK KTP</Label>
                    <Input inputMode="numeric" maxLength={16} value={nik} onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))} placeholder="16 digit NIK" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nama Lengkap</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sesuai KTP" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nomor HP / WhatsApp</Label>
                    <Input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alamat</Label>
                    <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat domisili" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sandi</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
                  </div>
                  <Button className="w-full" disabled={busy} onClick={handleRegister}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Kirim Pendaftaran
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{account.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">NIK {account.nik} · {account.phone}</p>
                  </div>
                  <StatusBadge status={account.status} />
                </div>
                {account.admin_notes && (
                  <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-md p-2">Catatan pengurus: {account.admin_notes}</p>
                )}
                {account.status === "pending" && (
                  <p className="text-[11px] text-amber-600">Pendaftaran sedang diverifikasi pengurus. Pengajuan bisa dikirim setelah disetujui.</p>
                )}
              </CardContent>
            </Card>

            {account.status === "approved" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Pengajuan Saya</h2>
                  <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                    <Plus className="h-4 w-4 mr-1" /> {showForm ? "Tutup" : "Ajukan"}
                  </Button>
                </div>

                {showForm && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Form Pengajuan Penggalangan Dana</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Judul Penggalangan</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Bantuan Biaya Operasi" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Kategori</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PROPOSAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Penerima Manfaat</Label>
                        <Input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Nama penerima / lembaga" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Target Dana (Rp)</Label>
                        <Input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} placeholder="5000000" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Deskripsi / Latar Belakang</Label>
                        <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan kondisi dan kebutuhan dana" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Foto Pendukung (opsional)</Label>
                        <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                      </div>
                      <Button className="w-full" disabled={busy} onClick={handleSubmitProposal}>
                        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Kirim Pengajuan
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {proposals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Belum ada pengajuan.</p>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((p) => (
                      <Card key={p.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{p.title}</p>
                              <p className="text-[11px] text-muted-foreground">{p.category}{p.beneficiary ? ` · ${p.beneficiary}` : ""}</p>
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Target</span>
                            <span className="font-bold">{formatCurrency(p.target_amount)}</span>
                          </div>
                          {p.collected_amount > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Terkumpul</span>
                              <span className="font-bold text-primary">{formatCurrency(p.collected_amount)}</span>
                            </div>
                          )}
                          {p.admin_notes && (
                            <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-md p-2">Catatan: {p.admin_notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
