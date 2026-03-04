import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRegions, Region } from "@/hooks/useRegions";
import { useSupabaseDonations, Donation, INCOME_CATEGORIES } from "@/hooks/useSupabaseDonations";
import { useExpenses, Expense, EXPENSE_CATEGORIES } from "@/hooks/useExpenses";
import { usePrograms, Program } from "@/hooks/usePrograms";
import { useNews, NewsItem } from "@/hooks/useNews";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AdminAiChat } from "@/components/AdminAiChat";
import { useDiscussions } from "@/hooks/useDiscussions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, LogOut, MapPin, Pencil, Trash2, Plus, 
  ArrowLeft, Shield, AlertTriangle, TrendingUp, TrendingDown, Wallet, Target, Upload, Image, Newspaper, Phone, Save, Sparkles, MessageCircle, Check, X, Bell, Send
} from "lucide-react";

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { regions, isLoading: regionsLoading, updateRegion, addRegion, deleteRegion } = useRegions();
  const { donations, isLoading: donationsLoading, addDonation, updateDonation, deleteDonation, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, addExpense, deleteExpense, uploadReceipt, getTotalExpenses } = useExpenses();
  const { programs, isLoading: programsLoading, addProgram, updateProgram, deleteProgram, uploadProgramImage } = usePrograms();
  const { news, isLoading: newsLoading, addNews, updateNews, deleteNews, uploadNewsImage } = useNews();
  const { getSettingsMap, updateSetting, isLoading: settingsLoading } = useSiteSettings();
  const { discussions, isLoading: discussionsLoading, replyDiscussion, deleteDiscussion } = useDiscussions(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();

  const [contactForm, setContactForm] = useState<Record<string, string>>({});
  const [savingContact, setSavingContact] = useState(false);

  // Load settings into form when available
  useEffect(() => {
    if (!settingsLoading) {
      setContactForm(getSettingsMap());
    }
  }, [settingsLoading]);

  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [newRegion, setNewRegion] = useState({ name: "", coordinator: "", phone: "" });
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [newDonation, setNewDonation] = useState({
    region_id: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "", category: "Infaq Kaleng Koin",
  });
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);

  const [newExpense, setNewExpense] = useState({
    amount: "", date: new Date().toISOString().split("T")[0], description: "", category: "Operasional",
  });
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Program state
  const [newProgram, setNewProgram] = useState({
    title: "", description: "", target_amount: "", qris_image_url: "",
  });
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programImageFile, setProgramImageFile] = useState<File | null>(null);
  const [qrisImageFile, setQrisImageFile] = useState<File | null>(null);
  const [editProgramImageFile, setEditProgramImageFile] = useState<File | null>(null);
  const [editQrisImageFile, setEditQrisImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // News state
  const [newNews, setNewNews] = useState({ title: "", excerpt: "", content: "", category: "Umum" });
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [editNewsImageFile, setEditNewsImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const formatAmount = (value: string) => {
    const num = value.replace(/[^\d]/g, "");
    return num ? new Intl.NumberFormat("id-ID").format(parseInt(num)) : "";
  };

  // Region handlers
  const handleUpdateRegion = async () => {
    if (!editingRegion) return;
    const { error } = await updateRegion(editingRegion.id, {
      name: editingRegion.name, coordinator: editingRegion.coordinator, phone: editingRegion.phone,
    });
    if (error) toast({ title: "Gagal", description: "Gagal mengupdate wilayah", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Wilayah berhasil diupdate" }); setEditingRegion(null); }
  };

  const handleAddRegion = async () => {
    if (!newRegion.name || !newRegion.coordinator || !newRegion.phone) {
      toast({ title: "Error", description: "Lengkapi semua field", variant: "destructive" }); return;
    }
    const { error } = await addRegion(newRegion);
    if (error) toast({ title: "Gagal", description: "Gagal menambah wilayah", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Wilayah berhasil ditambah" }); setNewRegion({ name: "", coordinator: "", phone: "" }); setIsAddRegionOpen(false); }
  };

  const handleDeleteRegion = async (id: string) => {
    const { error } = await deleteRegion(id);
    if (error) toast({ title: "Gagal", description: "Gagal menghapus wilayah", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Wilayah berhasil dihapus" });
  };

  // Donation handlers
  const handleAddDonation = async () => {
    if (!newDonation.amount || !newDonation.date || !newDonation.category) {
      toast({ title: "Error", description: "Lengkapi semua field", variant: "destructive" }); return;
    }
    if (newDonation.category === "Infaq Kaleng Koin" && !newDonation.region_id) {
      toast({ title: "Error", description: "Pilih wilayah untuk Infaq Kaleng Koin", variant: "destructive" }); return;
    }
    const amount = parseInt(newDonation.amount.replace(/[^\d]/g, ""));
    const { error } = await addDonation({ region_id: newDonation.category === "Infaq Kaleng Koin" ? newDonation.region_id : null, amount, date: newDonation.date, notes: newDonation.notes || undefined, category: newDonation.category });
    if (error) toast({ title: "Gagal", description: "Gagal menambah pemasukan", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Pemasukan berhasil ditambah" }); setNewDonation({ region_id: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "", category: "Infaq Kaleng Koin" }); setIsAddDonationOpen(false); }
  };

  const handleUpdateDonation = async () => {
    if (!editingDonation) return;
    const { error } = await updateDonation(editingDonation.id, {
      region_id: editingDonation.region_id, amount: editingDonation.amount, date: editingDonation.date, notes: editingDonation.notes || undefined,
    });
    if (error) toast({ title: "Gagal", description: "Gagal mengupdate pemasukan", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Pemasukan berhasil diupdate" }); setEditingDonation(null); }
  };

  const handleDeleteDonation = async (id: string) => {
    const { error } = await deleteDonation(id);
    if (error) toast({ title: "Gagal", description: "Gagal menghapus pemasukan", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Pemasukan berhasil dihapus" });
  };

  // Expense handlers
  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.date) {
      toast({ title: "Error", description: "Lengkapi nominal dan tanggal", variant: "destructive" }); return;
    }
    setUploading(true);
    const amount = parseInt(newExpense.amount.replace(/[^\d]/g, ""));
    let receipt_url: string | undefined;
    if (receiptFile) {
      const res = await uploadReceipt(receiptFile);
      if (res.error) { toast({ title: "Gagal upload bukti", variant: "destructive" }); setUploading(false); return; }
      receipt_url = res.url!;
    }
    const { error } = await addExpense({ amount, date: newExpense.date, description: newExpense.description || undefined, category: newExpense.category, receipt_url });
    setUploading(false);
    if (error) toast({ title: "Gagal", description: "Gagal menambah pengeluaran", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Pengeluaran berhasil ditambah" }); setNewExpense({ amount: "", date: new Date().toISOString().split("T")[0], description: "", category: "Operasional" }); setReceiptFile(null); setIsAddExpenseOpen(false); }
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await deleteExpense(id);
    if (error) toast({ title: "Gagal", description: "Gagal menghapus pengeluaran", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Pengeluaran berhasil dihapus" });
  };

  // Program handlers
  const handleAddProgram = async () => {
    if (!newProgram.title || !newProgram.target_amount) {
      toast({ title: "Error", description: "Lengkapi judul dan target donasi", variant: "destructive" }); return;
    }
    setUploading(true);
    const target = parseInt(newProgram.target_amount.replace(/[^\d]/g, ""));
    let image_url: string | undefined;
    let qris_image_url: string | undefined = newProgram.qris_image_url || undefined;

    if (programImageFile) {
      const res = await uploadProgramImage(programImageFile, "images");
      if (res.error) { toast({ title: "Gagal upload gambar", variant: "destructive" }); setUploading(false); return; }
      image_url = res.url!;
    }
    if (qrisImageFile) {
      const res = await uploadProgramImage(qrisImageFile, "qris");
      if (res.error) { toast({ title: "Gagal upload QRIS", variant: "destructive" }); setUploading(false); return; }
      qris_image_url = res.url!;
    }

    const { error } = await addProgram({
      title: newProgram.title,
      description: newProgram.description || undefined,
      target_amount: target,
      qris_image_url,
      ...(image_url ? { image_url } : {}),
    } as any);
    setUploading(false);
    if (error) toast({ title: "Gagal", description: "Gagal menambah program", variant: "destructive" });
    else {
      toast({ title: "Berhasil", description: "Program berhasil ditambah" });
      setNewProgram({ title: "", description: "", target_amount: "", qris_image_url: "" });
      setProgramImageFile(null); setQrisImageFile(null);
      setIsAddProgramOpen(false);
    }
  };

  const handleUpdateProgram = async () => {
    if (!editingProgram) return;
    setUploading(true);
    let image_url = editingProgram.image_url;
    let qris_image_url = editingProgram.qris_image_url;

    if (editProgramImageFile) {
      const res = await uploadProgramImage(editProgramImageFile, "images");
      if (res.error) { toast({ title: "Gagal upload gambar", variant: "destructive" }); setUploading(false); return; }
      image_url = res.url!;
    }
    if (editQrisImageFile) {
      const res = await uploadProgramImage(editQrisImageFile, "qris");
      if (res.error) { toast({ title: "Gagal upload QRIS", variant: "destructive" }); setUploading(false); return; }
      qris_image_url = res.url!;
    }

    const { error } = await updateProgram(editingProgram.id, {
      title: editingProgram.title,
      description: editingProgram.description,
      target_amount: editingProgram.target_amount,
      collected_amount: editingProgram.collected_amount,
      qris_image_url,
      image_url,
      is_active: editingProgram.is_active,
    });
    setUploading(false);
    if (error) toast({ title: "Gagal", description: "Gagal mengupdate program", variant: "destructive" });
    else {
      toast({ title: "Berhasil", description: "Program berhasil diupdate" });
      setEditingProgram(null); setEditProgramImageFile(null); setEditQrisImageFile(null);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    const { error } = await deleteProgram(id);
    if (error) toast({ title: "Gagal", description: "Gagal menghapus program", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Program berhasil dihapus" });
  };

  // News handlers
  const handleAddNews = async () => {
    if (!newNews.title) {
      toast({ title: "Error", description: "Judul berita harus diisi", variant: "destructive" }); return;
    }
    setUploading(true);
    let image_url: string | undefined;
    if (newsImageFile) {
      const res = await uploadNewsImage(newsImageFile);
      if (res.error) { toast({ title: "Gagal upload gambar", variant: "destructive" }); setUploading(false); return; }
      image_url = res.url!;
    }
    const { error } = await addNews({
      title: newNews.title, excerpt: newNews.excerpt || undefined,
      content: newNews.content || undefined, category: newNews.category,
      ...(image_url ? { image_url } : {}),
    });
    setUploading(false);
    if (error) toast({ title: "Gagal", description: "Gagal menambah berita", variant: "destructive" });
    else {
      toast({ title: "Berhasil", description: "Berita berhasil ditambah" });
      setNewNews({ title: "", excerpt: "", content: "", category: "Umum" });
      setNewsImageFile(null); setIsAddNewsOpen(false);
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    setUploading(true);
    let image_url = editingNews.image_url;
    if (editNewsImageFile) {
      const res = await uploadNewsImage(editNewsImageFile);
      if (res.error) { toast({ title: "Gagal upload gambar", variant: "destructive" }); setUploading(false); return; }
      image_url = res.url!;
    }
    const { error } = await updateNews(editingNews.id, {
      title: editingNews.title, excerpt: editingNews.excerpt,
      content: editingNews.content, category: editingNews.category,
      image_url, is_published: editingNews.is_published,
    });
    setUploading(false);
    if (error) toast({ title: "Gagal", description: "Gagal mengupdate berita", variant: "destructive" });
    else {
      toast({ title: "Berhasil", description: "Berita berhasil diupdate" });
      setEditingNews(null); setEditNewsImageFile(null);
    }
  };

  const handleDeleteNews = async (id: string) => {
    const { error } = await deleteNews(id);
    if (error) toast({ title: "Gagal", description: "Gagal menghapus berita", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Berita berhasil dihapus" });
  };

  const getRegionName = (regionId: string) => regions.find((r) => r.id === regionId)?.name || regionId;

  if (authLoading || regionsLoading || donationsLoading || expensesLoading || programsLoading || newsLoading || settingsLoading || discussionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle>Akses Ditolak</CardTitle>
            <CardDescription>Anda tidak memiliki akses admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => navigate("/")}>Kembali ke Halaman Utama</Button>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPemasukan = getTotalDonations();
  const totalPengeluaran = getTotalExpenses();
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">LAZISNU Gendongkulon</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Lihat Publik
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pemasukan</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalPemasukan)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalPengeluaran)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(saldo)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="program" className="space-y-6">
          <TabsList>
            <TabsTrigger value="program" className="gap-2">
              <Target className="h-4 w-4" /> Program
            </TabsTrigger>
            <TabsTrigger value="pemasukan" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Pemasukan
            </TabsTrigger>
            <TabsTrigger value="pengeluaran" className="gap-2">
              <TrendingDown className="h-4 w-4" /> Pengeluaran
            </TabsTrigger>
            <TabsTrigger value="regions" className="gap-2">
              <MapPin className="h-4 w-4" /> Wilayah
            </TabsTrigger>
            <TabsTrigger value="berita" className="gap-2">
              <Newspaper className="h-4 w-4" /> Berita
            </TabsTrigger>
            <TabsTrigger value="kontak" className="gap-2">
              <Phone className="h-4 w-4" /> Kontak
            </TabsTrigger>
            <TabsTrigger value="diskusi" className="gap-2">
              <MessageCircle className="h-4 w-4" /> Diskusi
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" /> AI
            </TabsTrigger>
          </TabsList>

          {/* Program Tab */}
          <TabsContent value="program" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kelola Program Donasi</h2>
                <p className="text-sm text-muted-foreground">Program penggalangan dana dengan QRIS</p>
              </div>
              <Dialog open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Tambah Program</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Program Donasi</DialogTitle>
                    <DialogDescription>Buat program penggalangan dana baru</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label>Judul Program</Label>
                      <Input value={newProgram.title} onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })} placeholder="Pembangunan Masjid" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Deskripsi</Label>
                      <Textarea value={newProgram.description} onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })} placeholder="Deskripsi program donasi" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Target Donasi (Rp)</Label>
                      <Input value={newProgram.target_amount} onChange={(e) => setNewProgram({ ...newProgram, target_amount: formatAmount(e.target.value) })} placeholder="10.000.000" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2"><Image className="h-4 w-4" /> Gambar Program</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setProgramImageFile(e.target.files?.[0] || null)} />
                      {programImageFile && <p className="text-xs text-muted-foreground">{programImageFile.name}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Gambar QRIS</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setQrisImageFile(e.target.files?.[0] || null)} />
                      {qrisImageFile && <p className="text-xs text-muted-foreground">{qrisImageFile.name}</p>}
                      <p className="text-xs text-muted-foreground">Atau masukkan URL:</p>
                      <Input value={newProgram.qris_image_url} onChange={(e) => setNewProgram({ ...newProgram, qris_image_url: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddProgramOpen(false)}>Batal</Button>
                    <Button onClick={handleAddProgram} disabled={uploading}>
                      {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead className="text-right">Terkumpul</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{program.title}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{formatCurrency(program.collected_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(program.target_amount)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${program.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                          {program.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingProgram(program)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Program</DialogTitle></DialogHeader>
                              {editingProgram && (
                                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                  <div className="grid gap-2">
                                    <Label>Judul</Label>
                                    <Input value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea value={editingProgram.description || ""} onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Target (Rp)</Label>
                                    <Input value={formatAmount(editingProgram.target_amount.toString())} onChange={(e) => { const num = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0; setEditingProgram({ ...editingProgram, target_amount: num }); }} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Terkumpul (Rp)</Label>
                                    <Input value={formatAmount(editingProgram.collected_amount.toString())} onChange={(e) => { const num = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0; setEditingProgram({ ...editingProgram, collected_amount: num }); }} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label className="flex items-center gap-2"><Image className="h-4 w-4" /> Gambar Program</Label>
                                    {editingProgram.image_url && <img src={editingProgram.image_url} alt="Preview" className="h-20 w-auto rounded object-cover" />}
                                    <Input type="file" accept="image/*" onChange={(e) => setEditProgramImageFile(e.target.files?.[0] || null)} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Gambar QRIS</Label>
                                    {editingProgram.qris_image_url && <img src={editingProgram.qris_image_url} alt="QRIS" className="h-20 w-auto rounded" />}
                                    <Input type="file" accept="image/*" onChange={(e) => setEditQrisImageFile(e.target.files?.[0] || null)} />
                                    <Input value={editingProgram.qris_image_url || ""} onChange={(e) => setEditingProgram({ ...editingProgram, qris_image_url: e.target.value })} placeholder="Atau URL QRIS" />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Label>Aktif</Label>
                                    <Switch checked={editingProgram.is_active} onCheckedChange={(v) => setEditingProgram({ ...editingProgram, is_active: v })} />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button onClick={handleUpdateProgram} disabled={uploading}>
                                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Simpan
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Program?</AlertDialogTitle>
                                <AlertDialogDescription>Program donasi akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProgram(program.id)} className="bg-destructive">Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Pemasukan Tab */}
          <TabsContent value="pemasukan" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kelola Pemasukan</h2>
                <p className="text-sm text-muted-foreground">Data donasi infaq kaleng koin</p>
              </div>
              <Dialog open={isAddDonationOpen} onOpenChange={setIsAddDonationOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Tambah Pemasukan</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Pemasukan</DialogTitle>
                    <DialogDescription>Masukkan data pemasukan baru</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Kategori</Label>
                      <Select value={newDonation.category} onValueChange={(v) => setNewDonation({ ...newDonation, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {INCOME_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newDonation.category === "Infaq Kaleng Koin" && (
                      <div className="grid gap-2">
                        <Label>Wilayah</Label>
                        <Select value={newDonation.region_id} onValueChange={(v) => setNewDonation({ ...newDonation, region_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Pilih wilayah" /></SelectTrigger>
                          <SelectContent>
                            {regions.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label>Nominal (Rp)</Label>
                      <Input value={newDonation.amount} onChange={(e) => setNewDonation({ ...newDonation, amount: formatAmount(e.target.value) })} placeholder="150.000" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tanggal</Label>
                      <Input type="date" value={newDonation.date} onChange={(e) => setNewDonation({ ...newDonation, date: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Catatan</Label>
                      <Textarea value={newDonation.notes} onChange={(e) => setNewDonation({ ...newDonation, notes: e.target.value })} placeholder="Catatan opsional" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDonationOpen(false)}>Batal</Button>
                    <Button onClick={handleAddDonation}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{formatDate(donation.date)}</TableCell>
                      <TableCell><span className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">{donation.category || "Infaq Kaleng Koin"}</span></TableCell>
                      <TableCell>{donation.region_id ? getRegionName(donation.region_id) : "-"}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{formatCurrency(donation.amount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingDonation(donation)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Pemasukan</DialogTitle></DialogHeader>
                              {editingDonation && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label>Wilayah</Label>
                                    <Select value={editingDonation.region_id} onValueChange={(v) => setEditingDonation({ ...editingDonation, region_id: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>{regions.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Nominal</Label>
                                    <Input value={formatAmount(editingDonation.amount.toString())} onChange={(e) => { const num = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0; setEditingDonation({ ...editingDonation, amount: num }); }} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Tanggal</Label>
                                    <Input type="date" value={editingDonation.date} onChange={(e) => setEditingDonation({ ...editingDonation, date: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Catatan</Label>
                                    <Textarea value={editingDonation.notes || ""} onChange={(e) => setEditingDonation({ ...editingDonation, notes: e.target.value })} />
                                  </div>
                                </div>
                              )}
                              <DialogFooter><Button onClick={handleUpdateDonation}>Simpan</Button></DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pemasukan?</AlertDialogTitle>
                                <AlertDialogDescription>Data pemasukan akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDonation(donation.id)} className="bg-destructive">Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Pengeluaran Tab */}
          <TabsContent value="pengeluaran" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kelola Pengeluaran</h2>
                <p className="text-sm text-muted-foreground">Data pengeluaran operasional</p>
              </div>
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Tambah Pengeluaran</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Pengeluaran</DialogTitle>
                    <DialogDescription>Masukkan data pengeluaran baru</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Kategori</Label>
                      <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Nominal (Rp)</Label>
                      <Input value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: formatAmount(e.target.value) })} placeholder="50.000" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tanggal</Label>
                      <Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Keterangan</Label>
                      <Textarea value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="Keterangan pengeluaran" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Bukti / Nota</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                      {receiptFile && <p className="text-xs text-muted-foreground">📎 {receiptFile.name}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Batal</Button>
                    <Button onClick={handleAddExpense} disabled={uploading}>
                      {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead>Bukti</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell><span className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">{expense.category || "Operasional"}</span></TableCell>
                      <TableCell className="max-w-[200px] truncate">{expense.description || "-"}</TableCell>
                      <TableCell className="text-right font-semibold text-destructive">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        {expense.receipt_url ? (
                          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                            <Image className="h-3 w-3" /> Lihat
                          </a>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengeluaran?</AlertDialogTitle>
                              <AlertDialogDescription>Data pengeluaran akan dihapus permanen.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)} className="bg-destructive">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kelola Wilayah</h2>
                <p className="text-sm text-muted-foreground">Edit nama wilayah dan koordinator</p>
              </div>
              <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Tambah Wilayah</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Wilayah Baru</DialogTitle>
                    <DialogDescription>Masukkan data wilayah baru</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nama Wilayah</Label>
                      <Input value={newRegion.name} onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })} placeholder="Wilayah 6 - RT 11/12" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Koordinator</Label>
                      <Input value={newRegion.coordinator} onChange={(e) => setNewRegion({ ...newRegion, coordinator: e.target.value })} placeholder="Nama Koordinator" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Telepon</Label>
                      <Input value={newRegion.phone} onChange={(e) => setNewRegion({ ...newRegion, phone: e.target.value })} placeholder="0812-xxxx-xxxx" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRegionOpen(false)}>Batal</Button>
                    <Button onClick={handleAddRegion}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Wilayah</TableHead>
                    <TableHead>Koordinator</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.name}</TableCell>
                      <TableCell>{region.coordinator}</TableCell>
                      <TableCell>{region.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingRegion(region)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Wilayah</DialogTitle></DialogHeader>
                              {editingRegion && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label>Nama Wilayah</Label>
                                    <Input value={editingRegion.name} onChange={(e) => setEditingRegion({ ...editingRegion, name: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Koordinator</Label>
                                    <Input value={editingRegion.coordinator} onChange={(e) => setEditingRegion({ ...editingRegion, coordinator: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Telepon</Label>
                                    <Input value={editingRegion.phone} onChange={(e) => setEditingRegion({ ...editingRegion, phone: e.target.value })} />
                                  </div>
                                </div>
                              )}
                              <DialogFooter><Button onClick={handleUpdateRegion}>Simpan</Button></DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Wilayah?</AlertDialogTitle>
                                <AlertDialogDescription>Semua data donasi wilayah ini juga akan terhapus.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteRegion(region.id)} className="bg-destructive">Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Berita Tab */}
          <TabsContent value="berita" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kelola Berita</h2>
                <p className="text-sm text-muted-foreground">Berita & pengumuman dengan gambar</p>
              </div>
              <Dialog open={isAddNewsOpen} onOpenChange={setIsAddNewsOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Tambah Berita</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Berita</DialogTitle>
                    <DialogDescription>Buat berita atau pengumuman baru</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label>Judul</Label>
                      <Input value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} placeholder="Judul berita" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Kategori</Label>
                      <Select value={newNews.category} onValueChange={(v) => setNewNews({ ...newNews, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Umum">Umum</SelectItem>
                          <SelectItem value="Penyaluran">Penyaluran</SelectItem>
                          <SelectItem value="Pengumpulan">Pengumpulan</SelectItem>
                          <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                          <SelectItem value="Sosialisasi">Sosialisasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Ringkasan</Label>
                      <Textarea value={newNews.excerpt} onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })} placeholder="Ringkasan singkat berita" rows={2} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Konten Lengkap</Label>
                      <Textarea value={newNews.content} onChange={(e) => setNewNews({ ...newNews, content: e.target.value })} placeholder="Isi berita lengkap" rows={5} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Gambar Berita</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setNewsImageFile(e.target.files?.[0] || null)} />
                      {newsImageFile && <p className="text-xs text-muted-foreground">📎 {newsImageFile.name}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddNews} disabled={uploading}>
                      {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengupload...</> : "Simpan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="h-12 w-16 object-cover rounded" />
                        ) : (
                          <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{item.title}</TableCell>
                      <TableCell><span className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">{item.category}</span></TableCell>
                      <TableCell>{item.is_published ? "✅ Publik" : "📝 Draft"}</TableCell>
                      <TableCell>{formatDate(item.published_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingNews(item); setEditNewsImageFile(null); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Berita</DialogTitle>
                              </DialogHeader>
                              {editingNews?.id === item.id && (
                                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                  <div className="grid gap-2">
                                    <Label>Judul</Label>
                                    <Input value={editingNews.title} onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Kategori</Label>
                                    <Select value={editingNews.category} onValueChange={(v) => setEditingNews({ ...editingNews, category: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Umum">Umum</SelectItem>
                                        <SelectItem value="Penyaluran">Penyaluran</SelectItem>
                                        <SelectItem value="Pengumpulan">Pengumpulan</SelectItem>
                                        <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                                        <SelectItem value="Sosialisasi">Sosialisasi</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Ringkasan</Label>
                                    <Textarea value={editingNews.excerpt || ""} onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })} rows={2} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Konten Lengkap</Label>
                                    <Textarea value={editingNews.content || ""} onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })} rows={5} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Gambar</Label>
                                    {editingNews.image_url && <img src={editingNews.image_url} alt="" className="h-24 object-cover rounded" />}
                                    <Input type="file" accept="image/*" onChange={(e) => setEditNewsImageFile(e.target.files?.[0] || null)} />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch checked={editingNews.is_published} onCheckedChange={(v) => setEditingNews({ ...editingNews, is_published: v })} />
                                    <Label>Dipublikasikan</Label>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button onClick={handleUpdateNews} disabled={uploading}>
                                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengupload...</> : "Simpan"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                                <AlertDialogDescription>Berita ini akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteNews(item.id)} className="bg-destructive">Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Kontak Tab */}
          <TabsContent value="kontak" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Kelola Info Kontak</h2>
              <p className="text-sm text-muted-foreground">Edit informasi kontak yang tampil di halaman Kontak</p>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Organisasi</Label>
                    <Input value={contactForm.org_name || ""} onChange={(e) => setContactForm(p => ({ ...p, org_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Ketua</Label>
                    <Input value={contactForm.org_leader || ""} onChange={(e) => setContactForm(p => ({ ...p, org_leader: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jabatan Ketua</Label>
                    <Input value={contactForm.org_title || ""} onChange={(e) => setContactForm(p => ({ ...p, org_title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon</Label>
                    <Input value={contactForm.phone || ""} onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input value={contactForm.whatsapp || ""} onChange={(e) => setContactForm(p => ({ ...p, whatsapp: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={contactForm.email || ""} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Alamat</Label>
                    <Textarea value={contactForm.address || ""} onChange={(e) => setContactForm(p => ({ ...p, address: e.target.value }))} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Senin-Jumat</Label>
                    <Input value={contactForm.hours_weekday || ""} onChange={(e) => setContactForm(p => ({ ...p, hours_weekday: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Sabtu</Label>
                    <Input value={contactForm.hours_saturday || ""} onChange={(e) => setContactForm(p => ({ ...p, hours_saturday: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Minggu</Label>
                    <Input value={contactForm.hours_sunday || ""} onChange={(e) => setContactForm(p => ({ ...p, hours_sunday: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={contactForm.website || ""} onChange={(e) => setContactForm(p => ({ ...p, website: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={contactForm.facebook || ""} onChange={(e) => setContactForm(p => ({ ...p, facebook: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Layanan (pisah dengan koma)</Label>
                    <Input value={contactForm.services || ""} onChange={(e) => setContactForm(p => ({ ...p, services: e.target.value }))} placeholder="Donasi Zakat,Infaq & Sedekah,Program Sosial" />
                  </div>
                </div>

                {/* Announcement Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifikasi / Pengumuman
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={contactForm.announcement_active === "true"}
                        onCheckedChange={(checked) => setContactForm(p => ({ ...p, announcement_active: checked ? "true" : "false" }))}
                      />
                      <Label>Tampilkan pengumuman di halaman utama</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Teks Pengumuman</Label>
                      <Textarea
                        value={contactForm.announcement_text || ""}
                        onChange={(e) => setContactForm(p => ({ ...p, announcement_text: e.target.value }))}
                        placeholder="Contoh: Pendaftaran relawan baru telah dibuka!"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="gap-2"
                  disabled={savingContact}
                  onClick={async () => {
                    setSavingContact(true);
                    try {
                      const keys = Object.keys(contactForm);
                      for (const key of keys) {
                        await updateSetting.mutateAsync({ key, value: contactForm[key] });
                      }
                      toast({ title: "Berhasil", description: "Informasi kontak berhasil diupdate" });
                    } catch {
                      toast({ title: "Gagal", description: "Gagal menyimpan", variant: "destructive" });
                    }
                    setSavingContact(false);
                  }}
                >
                  {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diskusi Tab */}
          <TabsContent value="diskusi" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Kelola Diskusi</h2>
              <p className="text-sm text-muted-foreground">Hapus atau beri tanggapan pada pesan pengunjung</p>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Pesan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tanggapan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discussions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Belum ada diskusi
                        </TableCell>
                      </TableRow>
                    ) : (
                      discussions.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.author_name}</TableCell>
                          <TableCell className="max-w-xs truncate">{d.message}</TableCell>
                          <TableCell className="text-xs">{formatDate(d.created_at)}</TableCell>
                          <TableCell className="max-w-xs">
                            {replyingTo === d.id ? (
                              <div className="flex flex-col gap-1.5">
                                <Textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Tulis tanggapan..."
                                  rows={2}
                                  className="text-xs"
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" className="gap-1 text-xs h-7" onClick={async () => {
                                    if (!replyText.trim()) return;
                                    const { error } = await replyDiscussion(d.id, replyText.trim());
                                    if (error) toast({ title: "Gagal", variant: "destructive" });
                                    else { toast({ title: "Tanggapan terkirim" }); setReplyingTo(null); setReplyText(""); }
                                  }}>
                                    <Send className="h-3 w-3" /> Kirim
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                                    Batal
                                  </Button>
                                </div>
                              </div>
                            ) : d.admin_reply ? (
                              <span className="text-xs text-muted-foreground truncate block">{d.admin_reply}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                                setReplyingTo(d.id);
                                setReplyText(d.admin_reply || "");
                              }}>
                                <MessageCircle className="h-3.5 w-3.5" /> Balas
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Diskusi?</AlertDialogTitle>
                                    <AlertDialogDescription>Pesan ini akan dihapus permanen.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => {
                                      const { error } = await deleteDiscussion(d.id);
                                      if (error) toast({ title: "Gagal", variant: "destructive" });
                                      else toast({ title: "Berhasil dihapus" });
                                    }}>Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <AdminAiChat />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
