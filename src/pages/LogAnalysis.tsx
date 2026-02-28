import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Loader2, AlertTriangle, Info } from "lucide-react";
import { getRiskColor } from "@/components/RiskGauge";
import RiskGauge from "@/components/RiskGauge";

interface LogEntry {
  line: number;
  content: string;
  severity: number;
  category: string;
}

const mockLogResults: LogEntry[] = [
  { line: 12, content: "Failed login attempt from 203.0.113.50 - brute force pattern", severity: 88, category: "Authentication" },
  { line: 45, content: "Unusual DNS query to known C2 domain", severity: 95, category: "DNS" },
  { line: 78, content: "Large data transfer to external IP (2.3GB)", severity: 72, category: "Data Exfiltration" },
  { line: 134, content: "Service restart on port 4444 - potential backdoor", severity: 82, category: "Service" },
  { line: 201, content: "Elevated privilege request from non-admin user", severity: 60, category: "Privilege Escalation" },
];

const LogAnalysis = () => {
  const [logText, setLogText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<LogEntry[] | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResults(mockLogResults);
    }, 2500);
  };

  const overallScore = results ? Math.round(results.reduce((a, b) => a + b.severity, 0) / results.length) : 0;

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Log Analysis</h2>
        <p className="text-muted-foreground mt-1">Upload and analyze system logs for threat indicators</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Log Input</h3>
            <p className="text-sm text-muted-foreground">Paste log data or upload a log file</p>
          </div>
        </div>

        <Textarea
          placeholder="Paste your log data here...&#10;&#10;Example:&#10;2024-01-15 08:23:11 [WARNING] Failed login attempt from 203.0.113.50&#10;2024-01-15 08:23:15 [ERROR] Authentication failed - brute force detected"
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          className="min-h-[200px] bg-secondary border-border font-mono text-sm mb-4"
        />

        <div className="flex gap-3">
          <Button variant="outline" className="border-border">
            <Upload className="w-4 h-4 mr-2" />
            Upload Log File
          </Button>
          <Button onClick={handleAnalyze} disabled={analyzing} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            {analyzing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Analyze Logs</>
            )}
          </Button>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <RiskGauge score={overallScore} label="Log Threat Score" size="lg" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Entries Analyzed</p>
                  <p className="text-2xl font-bold font-mono text-foreground">248</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Threats Found</p>
                  <p className="text-2xl font-bold font-mono text-destructive">{results.length}</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Critical Events</p>
                  <p className="text-2xl font-bold font-mono text-warning">{results.filter(r => r.severity >= 80).length}</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold font-mono text-primary">{new Set(results.map(r => r.category)).size}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Flagged Log Entries</h3>
            <div className="space-y-3">
              {results.map((entry, i) => {
                const risk = getRiskColor(entry.severity);
                return (
                  <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${risk.color}`} />
                        <span className="text-xs font-mono text-muted-foreground">Line {entry.line}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">{entry.category}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${risk.color}`}>{entry.severity}</span>
                    </div>
                    <p className="font-mono text-sm text-foreground">{entry.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default LogAnalysis;
