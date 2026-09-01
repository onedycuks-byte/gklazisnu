import { useState } from "react";
import { useFundraisingAdmin } from "@/hooks/useFundraising";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, X, Users, Megaphone } from "lucide-react";

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

export function GalangDanaManager() {
  const { accounts, proposals, isLoading, setAccountStatus, setProposalStatus } = useFundraisingAdmin();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const act = async (
    fn: typeof setAccountStatus,
    id: string,
    status: string,
    label: string
  ) => {
    try {
      await fn.mutateAsync({ id, status, notes: notes[id]?.trim() || undefined });
      toast({ title: label });
      setNotes((n) => ({ ...n, [id]: "" }));
    } catch (e: any) {
      toast({ title: "Gagal memproses", description: String(e?.message || e), variant: "destructive" });
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
              {p.image_url && (
                <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-36 object-cover rounded-md" />
              )}
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{p.description}</p>
              {p.beneficiary && <p className="text-[11px] text-muted-foreground">Penerima: {p.beneficiary}</p>}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Target</span>
                <span className="font-bold">{formatCurrency(p.target_amount)}</span>
              </div>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
