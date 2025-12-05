import { Donation } from "@/types/donation";
import { regions } from "@/data/regions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DonationTableProps {
  donations: Donation[];
  onDelete: (id: string) => void;
  showRegion?: boolean;
}

export function DonationTable({ donations, onDelete, showRegion = true }: DonationTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRegionName = (regionId: string) => {
    const region = regions.find((r) => r.id === regionId);
    return region?.name || regionId;
  };

  if (donations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Belum ada data donasi</p>
        <p className="text-sm">Klik tombol "Tambah Donasi" untuk memulai</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Tanggal</TableHead>
            {showRegion && <TableHead className="font-semibold">Wilayah</TableHead>}
            <TableHead className="font-semibold text-right">Nominal</TableHead>
            <TableHead className="font-semibold">Catatan</TableHead>
            <TableHead className="font-semibold w-[80px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => (
            <TableRow key={donation.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{formatDate(donation.date)}</TableCell>
              {showRegion && (
                <TableCell className="text-muted-foreground">
                  {getRegionName(donation.regionId)}
                </TableCell>
              )}
              <TableCell className="text-right font-semibold text-primary">
                {formatCurrency(donation.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {donation.notes || "-"}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Data Donasi?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Data donasi sebesar {formatCurrency(donation.amount)} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(donation.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
