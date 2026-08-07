import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface RekapBulananData {
  /** format YYYY-MM */
  period: string;
  saldoAwal: number;
  donations: Array<{ date: string; region: string; category: string; notes?: string; amount: number }>;
  expenses: Array<{ date: string; description: string; category: string; amount: number }>;
  regions: Array<{ name: string; coordinator: string; totalDonations: number; donationCount: number }>;
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

export const monthLabel = (period: string) => {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const groupSum = <T,>(rows: T[], key: (r: T) => string, val: (r: T) => number) => {
  const map = new Map<string, { total: number; count: number }>();
  rows.forEach((r) => {
    const k = key(r) || "Lain-lain";
    const prev = map.get(k) || { total: 0, count: 0 };
    map.set(k, { total: prev.total + val(r), count: prev.count + 1 });
  });
  return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
};

export function exportRekapBulananPDF(data: RekapBulananData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 15;

  const totalIn = data.donations.reduce((s, d) => s + d.amount, 0);
  const totalOut = data.expenses.reduce((s, e) => s + e.amount, 0);
  const saldoAkhir = data.saldoAwal + totalIn - totalOut;

  // ===== KOP SURAT =====
  doc.setDrawColor(20, 120, 70);
  doc.setLineWidth(0.8);
  doc.circle(marginX + 9, 20, 9);
  doc.setFontSize(7);
  doc.setTextColor(20, 120, 70);
  doc.text("LAZISNU", marginX + 9, 21, { align: "center" });

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

  doc.setDrawColor(20, 120, 70);
  doc.setLineWidth(0.8);
  doc.line(marginX, 34, pageW - marginX, 34);
  doc.setLineWidth(0.3);
  doc.line(marginX, 35.2, pageW - marginX, 35.2);

  // ===== JUDUL =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("LAPORAN REKAPITULASI KEUANGAN BULANAN", pageW / 2, 43, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 120, 70);
  doc.text(`Periode: ${monthLabel(data.period)}`, pageW / 2, 49, { align: "center" });

  // ===== RINGKASAN =====
  autoTable(doc, {
    startY: 55,
    head: [["Uraian", "Jumlah"]],
    body: [
      ["Saldo Awal Bulan", fmtIDR(data.saldoAwal)],
      [`Total Pemasukan (${data.donations.length} transaksi)`, fmtIDR(totalIn)],
      [`Total Pengeluaran (${data.expenses.length} transaksi)`, fmtIDR(totalOut)],
      [
        { content: "SALDO AKHIR BULAN", styles: { fontStyle: "bold" } },
        { content: fmtIDR(saldoAkhir), styles: { fontStyle: "bold", textColor: [20, 120, 70] } },
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [20, 120, 70], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: marginX, right: marginX },
  });

  const sectionTitle = (title: string) => {
    let y = (doc as any).lastAutoTable.finalY + 6;
    if (y > pageH - 55) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(title, marginX, y);
    return y + 2;
  };

  // ===== PEMASUKAN PER KATEGORI =====
  const inByCat = groupSum(data.donations, (d) => d.category, (d) => d.amount);
  autoTable(doc, {
    startY: sectionTitle("A. Rekap Pemasukan per Kategori"),
    head: [["No", "Kategori", "Transaksi", "Jumlah", "%"]],
    body: inByCat.length
      ? inByCat.map(([cat, v], i) => [
          i + 1, cat, v.count.toString(), fmtIDR(v.total),
          totalIn ? `${((v.total / totalIn) * 100).toFixed(1)}%` : "0%",
        ])
      : [[{ content: "Tidak ada pemasukan pada periode ini", colSpan: 5, styles: { halign: "center" as const } }]],
    foot: [[{ content: "TOTAL", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
            { content: fmtIDR(totalIn), styles: { halign: "right", fontStyle: "bold" } },
            { content: "100%", styles: { halign: "center", fontStyle: "bold" } }]],
    theme: "grid",
    headStyles: { fillColor: [20, 120, 70], textColor: 255, fontSize: 9 },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: { 0: { halign: "center", cellWidth: 10 }, 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "center" } },
    margin: { left: marginX, right: marginX },
  });

  // ===== PENGELUARAN PER KATEGORI =====
  const outByCat = groupSum(data.expenses, (e) => e.category, (e) => e.amount);
  autoTable(doc, {
    startY: sectionTitle("B. Rekap Pengeluaran per Kategori"),
    head: [["No", "Kategori", "Transaksi", "Jumlah", "%"]],
    body: outByCat.length
      ? outByCat.map(([cat, v], i) => [
          i + 1, cat, v.count.toString(), fmtIDR(v.total),
          totalOut ? `${((v.total / totalOut) * 100).toFixed(1)}%` : "0%",
        ])
      : [[{ content: "Tidak ada pengeluaran pada periode ini", colSpan: 5, styles: { halign: "center" as const } }]],
    foot: [[{ content: "TOTAL", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
            { content: fmtIDR(totalOut), styles: { halign: "right", fontStyle: "bold" } },
            { content: "100%", styles: { halign: "center", fontStyle: "bold" } }]],
    theme: "grid",
    headStyles: { fillColor: [180, 50, 50], textColor: 255, fontSize: 9 },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: { 0: { halign: "center", cellWidth: 10 }, 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "center" } },
    margin: { left: marginX, right: marginX },
  });

  // ===== PER WILAYAH =====
  if (data.regions.length > 0) {
    autoTable(doc, {
      startY: sectionTitle("C. Rekap Pemasukan per Wilayah"),
      head: [["No", "Wilayah", "Koordinator", "Setoran", "Total"]],
      body: data.regions.map((r, i) => [
        i + 1, r.name, r.coordinator, r.donationCount.toString(), fmtIDR(r.totalDonations),
      ]),
      theme: "striped",
      headStyles: { fillColor: [20, 120, 70], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: { 0: { halign: "center", cellWidth: 10 }, 3: { halign: "center" }, 4: { halign: "right" } },
      margin: { left: marginX, right: marginX },
    });
  }

  // ===== DETAIL PEMASUKAN =====
  if (data.donations.length > 0) {
    autoTable(doc, {
      startY: sectionTitle("D. Rincian Pemasukan"),
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

  // ===== DETAIL PENGELUARAN =====
  if (data.expenses.length > 0) {
    autoTable(doc, {
      startY: sectionTitle("E. Rincian Pengeluaran"),
      head: [["Tanggal", "Kategori", "Keterangan", "Jumlah"]],
      body: data.expenses.map((e) => [
        fmtDate(e.date), e.category, e.description || "-", fmtIDR(e.amount),
      ]),
      theme: "striped",
      headStyles: { fillColor: [180, 50, 50], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 3: { halign: "right" } },
      margin: { left: marginX, right: marginX },
    });
  }

  // ===== TANDA TANGAN =====
  let y = (doc as any).lastAutoTable.finalY + 12;
  if (y > pageH - 55) { doc.addPage(); y = 30; }

  const ketuaLazis = data.signers?.ketuaLazis || "(...........................)";
  const bendaharaLazis = data.signers?.bendaharaLazis || "(...........................)";
  const ketuaPRNU = data.signers?.ketuaPRNU || "(...........................)";
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Dibuat di: ............... , ${today}`, pageW - marginX, y, { align: "right" });
  y += 8;

  const colW = (pageW - marginX * 2) / 3;
  const cy = y;

  doc.setFont("helvetica", "bold");
  doc.text("Ketua LAZISNU", marginX + colW / 2, cy, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("PR NU", marginX + colW / 2, cy + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(ketuaLazis, marginX + colW / 2, cy + 30, { align: "center" });
  doc.setLineWidth(0.2);
  doc.line(marginX + 10, cy + 31, marginX + colW - 10, cy + 31);

  doc.setFont("helvetica", "bold");
  doc.text("Bendahara LAZISNU", marginX + colW + colW / 2, cy, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("PR NU", marginX + colW + colW / 2, cy + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(bendaharaLazis, marginX + colW + colW / 2, cy + 30, { align: "center" });
  doc.line(marginX + colW + 10, cy + 31, marginX + colW * 2 - 10, cy + 31);

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
      `Rekap Bulanan LAZISNU — ${monthLabel(data.period)} — Halaman ${i} dari ${pageCount}`,
      pageW / 2, pageH - 8, { align: "center" }
    );
  }

  doc.save(`Rekap-Bulanan-LAZISNU-${data.period}.pdf`);
}
