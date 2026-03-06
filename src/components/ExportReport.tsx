import { Button } from "@/components/ui/button";
import { Download, BarChart3, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReportData {
  title: string;
  generatedAt: string;
  rows: Record<string, string | number>[];
}

const generateCSV = (data: ReportData): string => {
  if (data.rows.length === 0) return "";
  const headers = Object.keys(data.rows[0]);
  const lines = [
    `# ${data.title}`,
    `# Generated: ${data.generatedAt}`,
    "",
    headers.join(","),
    ...data.rows.map((row) =>
      headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
    ),
  ];
  return lines.join("\n");
};

const generateHTMLReport = (data: ReportData): string => {
  if (data.rows.length === 0) return "";
  const headers = Object.keys(data.rows[0]);
  const severityKey = headers.find(h => h.toLowerCase().includes("severity") || h.toLowerCase().includes("risk") || h.toLowerCase().includes("score"));

  let chartSVG = "";
  if (severityKey) {
    const barWidth = 40;
    const gap = 10;
    const chartHeight = 200;
    const maxVal = Math.max(...data.rows.map(r => Number(r[severityKey]) || 0), 1);
    const bars = data.rows.slice(0, 10).map((row, i) => {
      const val = Number(row[severityKey]) || 0;
      const height = (val / maxVal) * (chartHeight - 30);
      const x = i * (barWidth + gap) + 20;
      const color = val >= 80 ? "#e05555" : val >= 60 ? "#c88d3f" : val >= 40 ? "#d4a843" : "#45b369";
      const label = String(Object.values(row)[0]).slice(0, 12);
      return `<rect x="${x}" y="${chartHeight - height - 20}" width="${barWidth}" height="${height}" fill="${color}" rx="4"/>
        <text x="${x + barWidth / 2}" y="${chartHeight - 5}" text-anchor="middle" font-size="9" fill="#888">${label}</text>
        <text x="${x + barWidth / 2}" y="${chartHeight - height - 25}" text-anchor="middle" font-size="10" fill="#ccc" font-family="monospace">${val}</text>`;
    });
    const svgWidth = data.rows.slice(0, 10).length * (barWidth + gap) + 40;
    chartSVG = `<div style="margin:20px 0"><h3 style="color:#e0e0e0;margin-bottom:10px">📊 Severity Distribution</h3><svg width="${svgWidth}" height="${chartHeight + 10}" style="background:#1a1d23;border-radius:8px;padding:10px">${bars.join("")}</svg></div>`;
  }

  // Pie chart for status distribution
  const statusKey = headers.find(h => h.toLowerCase().includes("status"));
  let pieChartSVG = "";
  if (statusKey) {
    const statusCounts: Record<string, number> = {};
    data.rows.forEach(r => {
      const s = String(r[statusKey]);
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const total = data.rows.length;
    const colors = ["#58d68d", "#e05555", "#d4a843", "#79c0ff", "#c88d3f"];
    let angle = 0;
    const slices = Object.entries(statusCounts).map(([status, count], i) => {
      const pct = count / total;
      const startAngle = angle;
      angle += pct * 360;
      const endAngle = angle;
      const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
      const largeArc = pct > 0.5 ? 1 : 0;
      return `<path d="M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[i % colors.length]}"/>
        <text x="210" y="${30 + i * 20}" font-size="12" fill="#ccc">● ${status}: ${count} (${(pct * 100).toFixed(0)}%)</text>`;
    });
    pieChartSVG = `<div style="margin:20px 0"><h3 style="color:#e0e0e0;margin-bottom:10px">📊 Status Distribution</h3><svg width="350" height="${Math.max(200, Object.keys(statusCounts).length * 20 + 20)}" style="background:#1a1d23;border-radius:8px;padding:10px">${slices.join("")}</svg></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.title}</title>
<style>body{font-family:'Segoe UI',sans-serif;background:#0d1117;color:#c9d1d9;margin:0;padding:40px}
h1{color:#58d68d;border-bottom:2px solid #21262d;padding-bottom:10px}
h2{color:#79c0ff}
.meta{color:#8b949e;font-size:14px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:#161b22;color:#58d68d;text-align:left;padding:12px;border:1px solid #30363d}
td{padding:10px 12px;border:1px solid #21262d}
tr:nth-child(even){background:#161b22}
.footer{margin-top:30px;padding-top:15px;border-top:1px solid #21262d;color:#8b949e;font-size:12px}
</style></head><body>
<h1>🔒 ${data.title}</h1>
<p class="meta">Generated: ${new Date(data.generatedAt).toLocaleString()} | Records: ${data.rows.length}</p>
${chartSVG}${pieChartSVG}
<h2>📋 Detailed Data</h2>
<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${data.rows.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join("")}</tr>`).join("")}</tbody></table>
<div class="footer">ThreatX AI Security Report — Confidential</div>
</body></html>`;
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportCSV = (data: ReportData) => {
  const csv = generateCSV(data);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(csv, `${data.title.replace(/\s+/g, "_")}_${timestamp}.csv`, "text/csv");
  toast({ title: "Report Exported", description: `${data.title} saved as CSV` });
};

export const exportJSON = (data: ReportData) => {
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(json, `${data.title.replace(/\s+/g, "_")}_${timestamp}.json`, "application/json");
  toast({ title: "Report Exported", description: `${data.title} saved as JSON` });
};

export const exportHTML = (data: ReportData) => {
  const html = generateHTMLReport(data);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(html, `${data.title.replace(/\s+/g, "_")}_${timestamp}.html`, "text/html");
  toast({ title: "Visual Report Exported", description: `${data.title} saved as HTML with charts` });
};

export const exportPDF = async (data: ReportData) => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(88, 214, 141);
  doc.setFontSize(18);
  doc.text(`🔒 ${data.title}`, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(139, 148, 158);
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()} | Records: ${data.rows.length}`, 14, 32);

  if (data.rows.length === 0) {
    doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`);
    toast({ title: "PDF Exported", description: `${data.title} saved as PDF` });
    return;
  }

  const headers = Object.keys(data.rows[0]);
  const severityKey = headers.find(h => h.toLowerCase().includes("severity") || h.toLowerCase().includes("risk") || h.toLowerCase().includes("score"));

  // Bar chart visualization
  if (severityKey) {
    const startY = 50;
    const chartHeight = 60;
    const maxVal = Math.max(...data.rows.map(r => Number(r[severityKey]) || 0), 1);
    const barCount = Math.min(data.rows.length, 10);
    const barWidth = Math.min(15, (pageWidth - 40) / barCount - 3);

    doc.setFontSize(11);
    doc.setTextColor(121, 192, 255);
    doc.text("Severity Distribution", 14, startY);

    data.rows.slice(0, 10).forEach((row, i) => {
      const val = Number(row[severityKey]) || 0;
      const height = (val / maxVal) * chartHeight;
      const x = 14 + i * (barWidth + 3);
      const y = startY + 5 + chartHeight - height;

      // Color based on severity
      if (val >= 80) doc.setFillColor(224, 85, 85);
      else if (val >= 60) doc.setFillColor(200, 141, 63);
      else if (val >= 40) doc.setFillColor(212, 168, 67);
      else doc.setFillColor(69, 179, 105);

      doc.rect(x, y, barWidth, height, "F");
      doc.setFontSize(6);
      doc.setTextColor(139, 148, 158);
      doc.text(String(val), x + barWidth / 2, y - 2, { align: "center" });
      const label = String(Object.values(row)[0]).slice(0, 8);
      doc.text(label, x + barWidth / 2, startY + 5 + chartHeight + 5, { align: "center" });
    });
  }

  // Data table
  const tableStartY = severityKey ? 130 : 50;
  (doc as any).autoTable({
    startY: tableStartY,
    head: [headers],
    body: data.rows.map(row => headers.map(h => String(row[h]))),
    theme: "grid",
    headStyles: { fillColor: [22, 27, 34], textColor: [88, 214, 141], fontSize: 8 },
    bodyStyles: { fillColor: [13, 17, 23], textColor: [201, 209, 217], fontSize: 7 },
    alternateRowStyles: { fillColor: [22, 27, 34] },
    styles: { cellPadding: 3, lineColor: [48, 54, 61], lineWidth: 0.1 },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 20;
  doc.setFontSize(8);
  doc.setTextColor(139, 148, 158);
  doc.text("ThreatX AI Security Report — Confidential", 14, finalY + 10);

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`${data.title.replace(/\s+/g, "_")}_${timestamp}.pdf`);
  toast({ title: "PDF Exported", description: `${data.title} saved as PDF with visualizations` });
};

interface ExportButtonProps {
  data: ReportData;
  variant?: "csv" | "json" | "both" | "all";
}

const ExportButton = ({ data, variant = "all" }: ExportButtonProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {(variant === "csv" || variant === "both" || variant === "all") && (
        <Button variant="outline" size="sm" onClick={() => exportCSV(data)} className="border-border text-xs">
          <Download className="w-3 h-3 mr-1" /> CSV
        </Button>
      )}
      {(variant === "json" || variant === "both" || variant === "all") && (
        <Button variant="outline" size="sm" onClick={() => exportJSON(data)} className="border-border text-xs">
          <Download className="w-3 h-3 mr-1" /> JSON
        </Button>
      )}
      {variant === "all" && (
        <>
          <Button variant="outline" size="sm" onClick={() => exportHTML(data)} className="border-border text-xs">
            <BarChart3 className="w-3 h-3 mr-1" /> Visual Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(data)} className="border-border text-xs">
            <FileText className="w-3 h-3 mr-1" /> PDF
          </Button>
        </>
      )}
    </div>
  );
};

export default ExportButton;
