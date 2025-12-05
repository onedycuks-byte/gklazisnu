import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

interface Donation {
  id: string;
  regionId: string;
  amount: number;
  date: string;
  notes?: string;
}

interface Region {
  id: string;
  name: string;
}

interface DonationTableProps {
  donations: Donation[];
  regions: Region[];
  showRegion?: boolean;
}

export function DonationTable({ donations, regions, showRegion = true }: DonationTableProps) {
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
        <p className="text-sm">Data donasi akan muncul di sini</p>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
