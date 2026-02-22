import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRegions, Region } from "@/hooks/useRegions";
import { useSupabaseDonations, Donation } from "@/hooks/useSupabaseDonations";
import { useExpenses, Expense } from "@/hooks/useExpenses";
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
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, LogOut, MapPin, Pencil, Trash2, Plus, 
  ArrowLeft, Shield, AlertTriangle, TrendingUp, TrendingDown, Wallet
} from "lucide-react";

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { regions, isLoading: regionsLoading, updateRegion, addRegion, deleteRegion } = useRegions();
  const { donations, isLoading: donationsLoading, addDonation, updateDonation, deleteDonation, getTotalDonations } = useSupabaseDonations();
  const { expenses, isLoading: expensesLoading, addExpense, deleteExpense, getTotalExpenses } = useExpenses();
  const navigate = useNavigate();

  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [newRegion, setNewRegion] = useState({ name: "", coordinator: "", phone: "" });
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [newDonation, setNewDonation] = useState({
    region_id: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "",
  });
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);

  const [newExpense, setNewExpense] = useState({
    amount: "", date: new Date().toISOString().split("T")[0], description: "",
  });
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

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
    if (!newDonation.region_id || !newDonation.amount || !newDonation.date) {
      toast({ title: "Error", description: "Lengkapi semua field", variant: "destructive" }); return;
    }
    const amount = parseInt(newDonation.amount.replace(/[^\d]/g, ""));
    const { error } = await addDonation({ region_id: newDonation.region_id, amount, date: newDonation.date, notes: newDonation.notes || undefined });
    if (error) toast({ title: "Gagal", description: "Gagal menambah pemasukan", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Pemasukan berhasil ditambah" }); setNewDonation({ region_id: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" }); setIsAddDonationOpen(false); }
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
    const amount = parseInt(newExpense.amount.replace(/[^\d]/g, ""));
    const { error } = await addExpense({ amount, date: newExpense.date, description: newExpense.description || undefined });
    if (error) toast({ title: "Gagal", description: "Gagal menambah pengeluaran", variant: "destructive" });
    else { toast({ title: "Berhasil", description: "Pengeluaran berhasil ditambah" }); setNewExpense({ amount: "", date: new Date().toISOString().split("T")[0], description: "" }); setIsAddExpenseOpen(false); }
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await deleteExpense(id);
    if (error) toast({ title: "Gagal", description: "Gagal menghapus pengeluaran", variant: "destructive" });
    else toast({ title: "Berhasil", description: "Pengeluaran berhasil dihapus" });
  };

  const getRegionName = (regionId: string) => regions.find((r) => r.id === regionId)?.name || regionId;

  if (authLoading || regionsLoading || donationsLoading || expensesLoading) {
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

        <Tabs defaultValue="pemasukan" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pemasukan" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Pemasukan
            </TabsTrigger>
            <TabsTrigger value="pengeluaran" className="gap-2">
              <TrendingDown className="h-4 w-4" /> Pengeluaran
            </TabsTrigger>
            <TabsTrigger value="regions" className="gap-2">
              <MapPin className="h-4 w-4" /> Wilayah
            </TabsTrigger>
          </TabsList>

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
                      <Label>Wilayah</Label>
                      <Select value={newDonation.region_id} onValueChange={(v) => setNewDonation({ ...newDonation, region_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih wilayah" /></SelectTrigger>
                        <SelectContent>
                          {regions.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    <TableHead>Wilayah</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{formatDate(donation.date)}</TableCell>
                      <TableCell>{getRegionName(donation.region_id)}</TableCell>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Batal</Button>
                    <Button onClick={handleAddExpense}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{expense.description || "-"}</TableCell>
                      <TableCell className="text-right font-semibold text-destructive">{formatCurrency(expense.amount)}</TableCell>
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
        </Tabs>
      </main>
    </div>
  );
}
