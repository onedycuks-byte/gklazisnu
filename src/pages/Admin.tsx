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
import { useAnalyticsStats } from "@/hooks/useAnalytics";
import { useOrphanRegistrations } from "@/hooks/useOrphanRegistrations";
import { OrphanCard } from "@/components/OrphanCard";
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
  ArrowLeft, Shield, AlertTriangle, TrendingUp, TrendingDown, Wallet, Target, Upload, Image, Newspaper, Phone, Save, Sparkles, MessageCircle, Check, X, Bell, Send, Users, Eye, Download, BarChart3, Heart
} from "lucide-react";

// Role-tab access mapping
const ROLE_TABS: Record<string, string[]> = {
  admin: ["statistik", "program", "pemasukan", "pengeluaran", "regions", "berita", "kontak", "diskusi", "santunan", "konfirmasi", "ai"],
  bendahara: ["statistik", "pemasukan", "pengeluaran", "santunan", "konfirmasi"],
  sekretaris: ["regions", "kontak", "diskusi", "santunan"],
  dokumentasi: ["berita", "program", "ai"],
  koordinator: ["input-pemasukan"],
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  bendahara: "Bendahara",
  sekretaris: "Sekretaris",
  dokumentasi: "Dokumentasi",
  koordinator: "Koordinator",
};

export default function Admin() {
  const { user, isAdmin, roles, hasAnyRole, isLoading: authLoading, signOut } = useAuth();
  const { regions, isLoading: regionsLoading, updateRegion, addRegion, deleteRegion } = useRegions();
  const { donations, isLoading: donationsLoading, addDonation, updateDonation, deleteDonation, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, addExpense, deleteExpense, uploadReceipt, getTotalExpenses } = useExpenses();
  const { programs, isLoading: programsLoading, addProgram, updateProgram, deleteProgram, uploadProgramImage } = usePrograms();
  const { news, isLoading: newsLoading, addNews, updateNews, deleteNews, uploadNewsImage } = useNews();
  const { getSettingsMap, updateSetting, isLoading: settingsLoading } = useSiteSettings();
  const { discussions, isLoading: discussionsLoading, replyDiscussion, deleteDiscussion } = useDiscussions(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { data: analyticsStats, isLoading: analyticsLoading } = useAnalyticsStats();
  const { registrations: orphanRegistrations, isLoading: orphansLoading, updateStatus: updateOrphanStatus, deleteRegistration: deleteOrphan, topUp, isTopingUp, deduct, isDeducting } = useOrphanRegistrations(true);
  const [orphanNotes, setOrphanNotes] = useState<Record<string, string>>({});
  const [walletAmounts, setWalletAmounts] = useState<Record<string, string>>({});
  const [walletDescs, setWalletDescs] = useState<Record<string, string>>({});
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

  // Koordinator: submit pending donation
  const handleSubmitPendingDonation = async () => {
    if (!newDonation.region_id || !newDonation.amount) {
      toast({ title: "Error", description: "Pilih wilayah dan masukkan nominal", variant: "destructive" }); return;
    }
    const amount = parseInt(newDonation.amount.replace(/[^\d]/g, ""));
    const { error } = await addDonation({
      region_id: newDonation.region_id,
      amount,
      date: newDonation.date,
      notes: newDonation.notes || undefined,
      category: "Infaq Kaleng Koin",
    }, true); // pending = true
    if (error) toast({ title: "Gagal", description: "Gagal mengirim data", variant: "destructive" });
    else {
      toast({ title: "Berhasil", description: "Data pemasukan dikirim untuk konfirmasi" });
      setNewDonation({ region_id: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "", category: "Infaq Kaleng Koin" });
    }
  };

  // Admin/Bendahara: confirm/reject pending donation
  const handleConfirmDonation = async (id: string) => {
    const { error } = await updateDonation(id, { status: "confirmed" } as any);
    if (error) toast({ title: "Gagal", description: "Gagal mengkonfirmasi", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Pemasukan dikonfirmasi" });
  };

  const handleRejectDonation = async (id: string) => {
    const { error } = await updateDonation(id, { status: "rejected" } as any);
    if (error) toast({ title: "Gagal", description: "Gagal menolak", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Pemasukan ditolak" });
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

  const hasAccess = hasAnyRole(["admin", "bendahara", "sekretaris", "dokumentasi", "koordinator"]);

  if (!hasAccess) {
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
            <CardDescription>Anda tidak memiliki akses ke portal ini.</CardDescription>
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

  // Compute visible tabs based on user roles
  const visibleTabs = new Set<string>();
  roles.forEach(role => {
    const tabs = ROLE_TABS[role];
    if (tabs) tabs.forEach(t => visibleTabs.add(t));
  });

  const activeRole = roles.find(r => r !== "user") || "user";
  const roleLabel = ROLE_LABELS[activeRole] || activeRole;

  const totalPemasukan = getTotalDonations();
  const totalPengeluaran = getTotalExpenses();
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header - compact sticky */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">Portal {roleLabel}</h1>
              <p className="text-[10px] text-muted-foreground truncate">{roles.filter(r => r !== "user").map(r => ROLE_LABELS[r] || r).join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Summary Cards - only for roles that can see financials */}
        {(visibleTabs.has("pemasukan") || visibleTabs.has("pengeluaran")) && (
          <div className="grid grid-cols-3 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Pemasukan</p>
                <p className="text-xs font-bold text-foreground">{formatCurrency(totalPemasukan)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingDown className="h-4 w-4 text-red-600 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
                <p className="text-xs font-bold text-foreground">{formatCurrency(totalPengeluaran)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Wallet className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Saldo</p>
                <p className="text-xs font-bold text-foreground">{formatCurrency(saldo)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue={Array.from(visibleTabs)[0] || "statistik"} className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <TabsList className="inline-flex w-max gap-1">
              {visibleTabs.has("statistik") && (
                <TabsTrigger value="statistik" className="text-xs px-2.5 py-1.5 gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> Statistik
                </TabsTrigger>
              )}
              {visibleTabs.has("program") && (
                <TabsTrigger value="program" className="text-xs px-2.5 py-1.5 gap-1">
                  <Target className="h-3.5 w-3.5" /> Program
                </TabsTrigger>
              )}
              {visibleTabs.has("pemasukan") && (
                <TabsTrigger value="pemasukan" className="text-xs px-2.5 py-1.5 gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Masuk
                </TabsTrigger>
              )}
              {visibleTabs.has("pengeluaran") && (
                <TabsTrigger value="pengeluaran" className="text-xs px-2.5 py-1.5 gap-1">
                  <TrendingDown className="h-3.5 w-3.5" /> Keluar
                </TabsTrigger>
              )}
              {visibleTabs.has("regions") && (
                <TabsTrigger value="regions" className="text-xs px-2.5 py-1.5 gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Wilayah
                </TabsTrigger>
              )}
              {visibleTabs.has("berita") && (
                <TabsTrigger value="berita" className="text-xs px-2.5 py-1.5 gap-1">
                  <Newspaper className="h-3.5 w-3.5" /> Berita
                </TabsTrigger>
              )}
              {visibleTabs.has("kontak") && (
                <TabsTrigger value="kontak" className="text-xs px-2.5 py-1.5 gap-1">
                  <Phone className="h-3.5 w-3.5" /> Kontak
                </TabsTrigger>
              )}
              {visibleTabs.has("diskusi") && (
                <TabsTrigger value="diskusi" className="text-xs px-2.5 py-1.5 gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> Diskusi
                </TabsTrigger>
              )}
              {visibleTabs.has("santunan") && (
                <TabsTrigger value="santunan" className="text-xs px-2.5 py-1.5 gap-1">
                  <Heart className="h-3.5 w-3.5" /> Santunan
                </TabsTrigger>
              )}
              {visibleTabs.has("ai") && (
                <TabsTrigger value="ai" className="text-xs px-2.5 py-1.5 gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI
                </TabsTrigger>
              )}
              {visibleTabs.has("input-pemasukan") && (
                <TabsTrigger value="input-pemasukan" className="text-xs px-2.5 py-1.5 gap-1">
                  <Plus className="h-3.5 w-3.5" /> Input
                </TabsTrigger>
              )}
              {visibleTabs.has("konfirmasi") && (
                <TabsTrigger value="konfirmasi" className="text-xs px-2.5 py-1.5 gap-1">
                  <Check className="h-3.5 w-3.5" /> Konfirmasi
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Statistik Tab */}
          <TabsContent value="statistik" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Statistik Pengunjung</h2>
              <p className="text-xs text-muted-foreground">Data real-time pengunjung</p>
            </div>

            {analyticsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : analyticsStats ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Eye className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{analyticsStats.todayViews}</p>
                      <p className="text-xs text-muted-foreground">Kunjungan Hari Ini</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{analyticsStats.uniqueTodayCount}</p>
                      <p className="text-xs text-muted-foreground">Pengunjung Unik Hari Ini</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Download className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{analyticsStats.totalInstalls}</p>
                      <p className="text-xs text-muted-foreground">Total Instalasi PWA</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{analyticsStats.totalViews}</p>
                      <p className="text-xs text-muted-foreground">Total Kunjungan</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detail Stats */}
                <div className="grid grid-cols-1 gap-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ringkasan Kunjungan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm text-muted-foreground">Hari Ini</span>
                          <span className="font-semibold">{analyticsStats.todayViews} views</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm text-muted-foreground">7 Hari Terakhir</span>
                          <span className="font-semibold">{analyticsStats.weekViews} views</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm text-muted-foreground">Bulan Ini</span>
                          <span className="font-semibold">{analyticsStats.monthViews} views</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm text-muted-foreground">Total Semua</span>
                          <span className="font-semibold">{analyticsStats.totalViews} views</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Total Pengunjung Unik</span>
                          <span className="font-semibold">{analyticsStats.uniqueAllCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Kunjungan 7 Hari Terakhir</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analyticsStats.dailyChart.map((day) => {
                          const maxViews = Math.max(...analyticsStats.dailyChart.map(d => d.views), 1);
                          const barWidth = (day.views / maxViews) * 100;
                          return (
                            <div key={day.date} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-16 shrink-0">{day.date}</span>
                              <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                                <div
                                  className="h-full rounded-full gradient-primary transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold w-8 text-right">{day.views}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Install Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4" /> Statistik Instalasi Aplikasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xl font-bold text-foreground">{analyticsStats.todayInstalls}</p>
                        <p className="text-xs text-muted-foreground">Install Hari Ini</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xl font-bold text-foreground">{analyticsStats.totalInstalls}</p>
                        <p className="text-xs text-muted-foreground">Total Install</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xl font-bold text-foreground">
                          {analyticsStats.totalViews > 0
                            ? ((analyticsStats.totalInstalls / analyticsStats.uniqueAllCount) * 100).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Rasio Install</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          {/* Program Tab */}
          <TabsContent value="program" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Program Donasi</h2>
                <p className="text-xs text-muted-foreground">Program penggalangan dana</p>
              </div>
              <Dialog open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Tambah</Button>
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
                <h2 className="text-base font-semibold">Pemasukan</h2>
                <p className="text-xs text-muted-foreground">Data donasi infaq</p>
              </div>
              <Dialog open={isAddDonationOpen} onOpenChange={setIsAddDonationOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Tambah</Button>
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

            <div className="space-y-2">
              {donations.map((donation) => (
                <Card key={donation.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{formatCurrency(donation.amount)}</span>
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-accent text-accent-foreground">{donation.category || "Infaq Kaleng Koin"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(donation.date)} • {donation.region_id ? getRegionName(donation.region_id) : "Umum"}
                        </p>
                        {donation.notes && <p className="text-xs text-muted-foreground truncate">{donation.notes}</p>}
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingDonation(donation)}>
                              <Pencil className="h-3.5 w-3.5" />
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
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pengeluaran Tab */}
          <TabsContent value="pengeluaran" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Pengeluaran</h2>
                <p className="text-xs text-muted-foreground">Data pengeluaran operasional</p>
              </div>
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Tambah</Button>
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

            <div className="space-y-2">
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-destructive">{formatCurrency(expense.amount)}</span>
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-accent text-accent-foreground">{expense.category || "Operasional"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                        {expense.description && <p className="text-xs text-muted-foreground truncate">{expense.description}</p>}
                        {expense.receipt_url && (
                          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-1">
                            <Image className="h-3 w-3" /> Lihat Bukti
                          </a>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Wilayah</h2>
                <p className="text-xs text-muted-foreground">Wilayah dan koordinator</p>
              </div>
              <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Tambah</Button>
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

            <div className="space-y-2">
              {regions.map((region) => (
                <Card key={region.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-semibold">{region.name}</p>
                        <p className="text-xs text-muted-foreground">{region.coordinator} • {region.phone}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingRegion(region)}>
                              <Pencil className="h-3.5 w-3.5" />
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
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Berita Tab */}
          <TabsContent value="berita" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Berita</h2>
                <p className="text-xs text-muted-foreground">Berita & pengumuman</p>
              </div>
              <Dialog open={isAddNewsOpen} onOpenChange={setIsAddNewsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Tambah</Button>
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

            <div className="space-y-2">
              {news.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="h-12 w-12 object-cover rounded shrink-0" />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center shrink-0">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-accent text-accent-foreground">{item.category}</span>
                          <span className="text-[10px] text-muted-foreground">{item.is_published ? "✅ Publik" : "📝 Draft"}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{formatDate(item.published_at)}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingNews(item); setEditNewsImageFile(null); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Berita</DialogTitle></DialogHeader>
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
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Kontak Tab */}
          <TabsContent value="kontak" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Info Kontak</h2>
              <p className="text-xs text-muted-foreground">Edit informasi kontak</p>
            </div>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-3">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
              <h2 className="text-base font-semibold">Diskusi</h2>
              <p className="text-xs text-muted-foreground">Tanggapan pesan pengunjung</p>
            </div>
            {discussions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">Belum ada diskusi</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {discussions.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{d.author_name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(d.created_at)}</p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                            setReplyingTo(d.id);
                            setReplyText(d.admin_reply || "");
                          }}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
                      </div>
                      <p className="text-xs">{d.message}</p>
                      {d.admin_reply && (
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-[10px] text-muted-foreground font-semibold mb-0.5">Tanggapan:</p>
                          <p className="text-xs">{d.admin_reply}</p>
                        </div>
                      )}
                      {replyingTo === d.id && (
                        <div className="space-y-2 pt-1">
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
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Santunan Tab */}
          <TabsContent value="santunan" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Santunan</h2>
                <p className="text-xs text-muted-foreground">Pendaftaran & saldo dompet anak yatim</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  {orphanRegistrations.filter(r => r.status === "pending").length} Menunggu
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {orphanRegistrations.filter(r => r.status === "approved").length} Disetujui
                </span>
              </div>
            </div>

            {/* Total balance summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 opacity-70" />
                    <span className="text-xs font-medium opacity-80">Total Saldo Tersebar</span>
                  </div>
                  <p className="text-xl font-bold">
                    {formatCurrency(orphanRegistrations.reduce((s, r) => s + (r.balance || 0), 0))}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 opacity-70" />
                    <span className="text-xs font-medium opacity-80">Penerima Aktif</span>
                  </div>
                  <p className="text-xl font-bold">
                    {orphanRegistrations.filter(r => r.status === "approved").length} Anak
                  </p>
                </CardContent>
              </Card>
            </div>

            {orphansLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : orphanRegistrations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Belum ada pendaftaran santunan</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orphanRegistrations.map(reg => (
                  <Card key={reg.id} className={reg.status === "pending" ? "border-amber-300 border-2" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{reg.child_name}</CardTitle>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          reg.status === "approved" ? "bg-green-100 text-green-700" :
                          reg.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {reg.status === "approved" ? "Disetujui" : reg.status === "rejected" ? "Ditolak" : "Menunggu"}
                        </span>
                      </div>
                      <CardDescription className="font-mono text-xs">{reg.unique_code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Wallet Balance */}
                      <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl p-3 border border-violet-200 dark:border-violet-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Wallet className="h-4 w-4 text-violet-600" />
                            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Saldo Dompet</span>
                          </div>
                          <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
                            {formatCurrency(reg.balance || 0)}
                          </span>
                        </div>
                        
                        {reg.status === "approved" && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nominal"
                                value={walletAmounts[reg.id] || ""}
                                onChange={e => setWalletAmounts(w => ({ ...w, [reg.id]: formatAmount(e.target.value) }))}
                                className="text-xs h-8 flex-1"
                              />
                              <Input
                                placeholder="Keterangan"
                                value={walletDescs[reg.id] || ""}
                                onChange={e => setWalletDescs(w => ({ ...w, [reg.id]: e.target.value }))}
                                className="text-xs h-8 flex-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 gap-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                                disabled={isTopingUp || !walletAmounts[reg.id]}
                                onClick={async () => {
                                  const amount = parseInt((walletAmounts[reg.id] || "0").replace(/[^\d]/g, ""));
                                  if (!amount) return;
                                  try {
                                    await topUp({ registrationId: reg.id, amount, description: walletDescs[reg.id] || "Top up saldo", childName: reg.child_name });
                                    toast({ title: "Berhasil", description: `Saldo ${reg.child_name} ditambah ${formatCurrency(amount)}` });
                                    setWalletAmounts(w => ({ ...w, [reg.id]: "" }));
                                    setWalletDescs(w => ({ ...w, [reg.id]: "" }));
                                  } catch {
                                    toast({ title: "Gagal", description: "Gagal menambah saldo", variant: "destructive" });
                                  }
                                }}
                              >
                                {isTopingUp ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                                Top Up
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1 h-8 text-xs text-red-600 hover:text-red-700 border-red-200"
                                disabled={isDeducting || !walletAmounts[reg.id] || (reg.balance || 0) === 0}
                                onClick={async () => {
                                  const amount = parseInt((walletAmounts[reg.id] || "0").replace(/[^\d]/g, ""));
                                  if (!amount) return;
                                  try {
                                    await deduct({ registrationId: reg.id, amount, description: walletDescs[reg.id] || "Pencairan dana" });
                                    toast({ title: "Berhasil", description: `Saldo ${reg.child_name} dikurangi ${formatCurrency(amount)}` });
                                    setWalletAmounts(w => ({ ...w, [reg.id]: "" }));
                                    setWalletDescs(w => ({ ...w, [reg.id]: "" }));
                                  } catch {
                                    toast({ title: "Gagal", description: "Gagal mengurangi saldo", variant: "destructive" });
                                  }
                                }}
                              >
                                {isDeducting ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingDown className="h-3 w-3" />}
                                Cairkan
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Wali:</span> <span className="font-medium">{reg.guardian_name}</span></div>
                        <div><span className="text-muted-foreground">Telp:</span> <span className="font-medium">{reg.guardian_phone}</span></div>
                        <div><span className="text-muted-foreground">Lahir:</span> <span className="font-medium">{formatDate(reg.birth_date)}</span></div>
                        <div><span className="text-muted-foreground">Daftar:</span> <span className="font-medium">{formatDate(reg.created_at)}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Alamat:</span> <span className="font-medium">{reg.address}</span></div>
                      </div>

                      {reg.status === "pending" && (
                        <div className="space-y-2 pt-2 border-t">
                          <Textarea
                            placeholder="Catatan admin (opsional)"
                            value={orphanNotes[reg.id] || ""}
                            onChange={e => setOrphanNotes(n => ({ ...n, [reg.id]: e.target.value }))}
                            rows={2}
                            className="text-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                              onClick={async () => {
                                await updateOrphanStatus({ id: reg.id, status: "approved", admin_notes: orphanNotes[reg.id] });
                                toast({ title: "Berhasil", description: `Pendaftaran ${reg.child_name} disetujui` });
                              }}
                            >
                              <Check className="h-3.5 w-3.5" /> Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 gap-1"
                              onClick={async () => {
                                await updateOrphanStatus({ id: reg.id, status: "rejected", admin_notes: orphanNotes[reg.id] });
                                toast({ title: "Ditolak", description: `Pendaftaran ${reg.child_name} ditolak` });
                              }}
                            >
                              <X className="h-3.5 w-3.5" /> Tolak
                            </Button>
                          </div>
                        </div>
                      )}

                      {reg.admin_notes && (
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                          <span className="font-semibold">Catatan:</span> {reg.admin_notes}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1 text-xs flex-1">
                              <Eye className="h-3.5 w-3.5" /> Lihat Kartu
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Kartu Santunan</DialogTitle>
                            </DialogHeader>
                            <OrphanCard registration={reg} showDownload />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pendaftaran?</AlertDialogTitle>
                              <AlertDialogDescription>Data {reg.child_name} akan dihapus permanen.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteOrphan(reg.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <AdminAiChat />
          </TabsContent>

          {/* Koordinator Input Pemasukan Tab */}
          <TabsContent value="input-pemasukan" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Input Pemasukan</h2>
              <p className="text-xs text-muted-foreground">Kirim data pemasukan koin kaleng untuk konfirmasi</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Form Pemasukan Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label>Wilayah *</Label>
                    <Select value={newDonation.region_id} onValueChange={(v) => setNewDonation({ ...newDonation, region_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih wilayah" /></SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nominal *</Label>
                    <Input placeholder="Rp 0" value={newDonation.amount} onChange={(e) => setNewDonation({ ...newDonation, amount: formatAmount(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input type="date" value={newDonation.date} onChange={(e) => setNewDonation({ ...newDonation, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Input placeholder="Catatan opsional" value={newDonation.notes} onChange={(e) => setNewDonation({ ...newDonation, notes: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSubmitPendingDonation} className="w-full md:w-auto">
                  <Send className="mr-2 h-4 w-4" /> Kirim untuk Konfirmasi
                </Button>
              </CardContent>
            </Card>

            {/* Show own pending submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengiriman Saya</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.filter(d => d.submitted_by === user?.id).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Belum ada data yang dikirim</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Wilayah</TableHead>
                        <TableHead>Nominal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.filter(d => d.submitted_by === user?.id).map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{formatDate(d.date)}</TableCell>
                          <TableCell>{d.region_id ? getRegionName(d.region_id) : "-"}</TableCell>
                          <TableCell>{formatCurrency(d.amount)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              d.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              d.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {d.status === 'confirmed' ? 'Dikonfirmasi' : d.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Konfirmasi Tab - Admin/Bendahara */}
          <TabsContent value="konfirmasi" className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Konfirmasi Pemasukan</h2>
              <p className="text-xs text-muted-foreground">Data dari Koordinator yang menunggu konfirmasi</p>
            </div>

            {donations.filter(d => d.status === 'pending').length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Semua data sudah dikonfirmasi</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {donations.filter(d => d.status === 'pending').map((d) => (
                  <Card key={d.id} className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                            <span className="text-sm text-muted-foreground">{formatDate(d.date)}</span>
                          </div>
                          <p className="font-semibold text-lg">{formatCurrency(d.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            Wilayah: {d.region_id ? getRegionName(d.region_id) : "-"} • Kategori: {d.category}
                          </p>
                          {d.notes && <p className="text-sm">Catatan: {d.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleConfirmDonation(d.id)} className="bg-green-600 hover:bg-green-700">
                            <Check className="mr-1 h-4 w-4" /> Konfirmasi
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectDonation(d.id)}>
                            <X className="mr-1 h-4 w-4" /> Tolak
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
