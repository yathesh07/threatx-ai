import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

interface ExportButtonProps {
  data: ReportData;
  variant?: "csv" | "json" | "both";
}

const ExportButton = ({ data, variant = "both" }: ExportButtonProps) => {
  return (
    <div className="flex gap-2">
      {(variant === "csv" || variant === "both") && (
        <Button variant="outline" size="sm" onClick={() => exportCSV(data)} className="border-border">
          <Download className="w-4 h-4 mr-1" /> CSV
        </Button>
      )}
      {(variant === "json" || variant === "both") && (
        <Button variant="outline" size="sm" onClick={() => exportJSON(data)} className="border-border">
          <Download className="w-4 h-4 mr-1" /> JSON
        </Button>
      )}
    </div>
  );
};

export default ExportButton;
