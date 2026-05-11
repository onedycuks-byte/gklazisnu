import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface LaporanPDFData {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  regions: Array<{ name: string; coordinator: string; totalDonations: number; donationCount: number }>;
  donations: Array<{ date: string; region: string; amount: number; notes?: string; category?: string }>;
  expenses: Array<{ date: string; description: string; category: string; amount: number }>;
  signers?: {
    ketuaLazis?: string;
    bendaharaLazis?: string;
    ketuaPRNU?: string;
  };
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export function exportLaporanPDF(data: LaporanPDFData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 15;

  // ===== KOP SURAT =====
  // Logo placeholder (lingkaran)
  doc.setDrawColor(20, 120, 70);
  doc.setLineWidth(0.8);
  doc.circle(marginX + 9, 20, 9);
  doc.setFontSize(7);
  doc.setTextColor(20, 120, 70);
  doc.text("LAZISNU", marginX + 9, 21, { align: "center" });

  // Heading kop
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 120, 70);
  doc.text("LEMBAGA AMIL ZAKAT, INFAQ DAN SHADAQAH", pageW / 2, 14, { align: "center" });
  doc.text("NAHDLATUL ULAMA (LAZISNU)", pageW / 2, 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("Pengurus Ranting Nahdlatul Ulama", pageW / 2, 25, { align: "center" });
  doc.setFontSize(8);
  doc.text("Sekretariat: Masjid / Kantor PRNU — Telp/WA: -", pageW / 2, 30, { align: "center" });

  // Garis ganda
  doc.setDrawColor(20, 120, 70);
  doc.setLineWidth(0.8);
  doc.line(marginX, 34, pageW - marginX, 34);
  doc.setLineWidth(0.3);
  doc.line(marginX, 35.2, pageW - marginX, 35.2);

  // ===== JUDUL LAPORAN =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("LAPORAN KEUANGAN INFAQ KALENG KOIN", pageW / 2, 43, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  doc.text(`Per Tanggal: ${today}`, pageW / 2, 49, { align: "center" });

  // ===== RINGKASAN =====
  let y = 56;
  autoTable(doc, {
    startY: y,
    head: [["Ringkasan Keuangan", "Jumlah"]],
    body: [
      ["Total Pemasukan", fmtIDR(data.totalPemasukan)],
      ["Total Pengeluaran", fmtIDR(data.totalPengeluaran)],
      [{ content: "SALDO AKHIR", styles: { fontStyle: "bold" } }, { content: fmtIDR(data.saldo), styles: { fontStyle: "bold", textColor: [20, 120, 70] } }],
    ],
    theme: "grid",
    headStyles: { fillColor: [20, 120, 70], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: marginX, right: marginX },
  });

  // ===== WILAYAH =====
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Rekap Per Wilayah", marginX, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["No", "Wilayah", "Koordinator", "Jumlah Donasi", "Total"]],
    body: data.regions.map((r, i) => [
      i + 1, r.name, r.coordinator, r.donationCount.toString(), fmtIDR(r.totalDonations),
    ]),
    theme: "striped",
    headStyles: { fillColor: [20, 120, 70], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: { 0: { halign: "center", cellWidth: 10 }, 3: { halign: "center" }, 4: { halign: "right" } },
    margin: { left: marginX, right: marginX },
  });

  // ===== PEMASUKAN DETAIL =====
  if (data.donations.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 6;
    if (y > pageH - 60) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Riwayat Pemasukan", marginX, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Tanggal", "Wilayah", "Kategori", "Keterangan", "Jumlah"]],
      body: data.donations.map((d) => [
        fmtDate(d.date), d.region, d.category || "-", d.notes || "-", fmtIDR(d.amount),
      ]),
      theme: "striped",
      headStyles: { fillColor: [20, 120, 70], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 4: { halign: "right" } },
      margin: { left: marginX, right: marginX },
    });
  }

  // ===== PENGELUARAN =====
  if (data.expenses.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 6;
    if (y > pageH - 60) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Rincian Pengeluaran", marginX, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Tanggal", "Kategori", "Keterangan", "Jumlah"]],
      body: data.expenses.map((e) => [
        fmtDate(e.date), e.category, e.description || "-", fmtIDR(e.amount),
      ]),
      foot: [[
        { content: "TOTAL PENGELUARAN", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
        { content: fmtIDR(data.totalPengeluaran), styles: { halign: "right", fontStyle: "bold" } },
      ]],
      theme: "striped",
      headStyles: { fillColor: [180, 50, 50], textColor: 255, fontSize: 9 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 3: { halign: "right" } },
      margin: { left: marginX, right: marginX },
    });
  }

  // ===== TANDA TANGAN =====
  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > pageH - 55) { doc.addPage(); y = 30; }

  const ketuaLazis = data.signers?.ketuaLazis || "(...........................)";
  const bendaharaLazis = data.signers?.bendaharaLazis || "(...........................)";
  const ketuaPRNU = data.signers?.ketuaPRNU || "(...........................)";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const placeDate = `${today}`;
  doc.text(`Dibuat di: ............... , ${placeDate}`, pageW - marginX, y, { align: "right" });
  y += 8;

  const colW = (pageW - marginX * 2) / 3;
  const cy = y;

  // Kolom 1 - Ketua LAZISNU
  doc.setFont("helvetica", "bold");
  doc.text("Ketua LAZISNU", marginX + colW / 2, cy, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("PR NU", marginX + colW / 2, cy + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(ketuaLazis, marginX + colW / 2, cy + 30, { align: "center" });
  doc.setLineWidth(0.2);
  doc.line(marginX + 10, cy + 31, marginX + colW - 10, cy + 31);

  // Kolom 2 - Bendahara LAZISNU
  doc.setFont("helvetica", "bold");
  doc.text("Bendahara LAZISNU", marginX + colW + colW / 2, cy, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("PR NU", marginX + colW + colW / 2, cy + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(bendaharaLazis, marginX + colW + colW / 2, cy + 30, { align: "center" });
  doc.line(marginX + colW + 10, cy + 31, marginX + colW * 2 - 10, cy + 31);

  // Kolom 3 - Ketua PR NU (Mengetahui)
  doc.setFont("helvetica", "bold");
  doc.text("Mengetahui,", marginX + colW * 2 + colW / 2, cy, { align: "center" });
  doc.text("Ketua PR NU", marginX + colW * 2 + colW / 2, cy + 5, { align: "center" });
  doc.text(ketuaPRNU, marginX + colW * 2 + colW / 2, cy + 30, { align: "center" });
  doc.line(marginX + colW * 2 + 10, cy + 31, marginX + colW * 3 - 10, cy + 31);

  // ===== FOOTER =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Laporan otomatis LAZISNU — Halaman ${i} dari ${pageCount}`,
      pageW / 2,
      pageH - 8,
      { align: "center" }
    );
  }

  doc.save(`Laporan-Keuangan-LAZISNU-${new Date().toISOString().slice(0, 10)}.pdf`);
}
