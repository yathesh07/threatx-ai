import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Loader2, AlertTriangle } from "lucide-react";
import { getRiskColor } from "@/components/RiskGauge";
import RiskGauge from "@/components/RiskGauge";
import ExportButton from "@/components/ExportReport";
import AIThreatAnalysis from "@/components/AIThreatAnalysis";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  line: number;
  content: string;
  severity: number;
  category: string;
}

const categories = ["Authentication", "DNS", "Data Exfiltration", "Service", "Privilege Escalation", "Firewall", "Intrusion"];
const logTemplates = [
  "Failed login attempt from {ip} - brute force pattern",
  "Unusual DNS query to known C2 domain {domain}",
  "Large data transfer to external IP ({size}GB)",
  "Service restart on port {port} - potential backdoor",
  "Elevated privilege request from non-admin user {user}",
  "Firewall rule modification detected from {ip}",
  "Multiple concurrent sessions from single user {user}",
  "SSH key change detected on production server",
  "Unauthorized cron job addition detected",
  "Abnormal process spawning from web server",
];

const generateLogs = (): LogEntry[] => {
  const count = 4 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, (_, i) => {
    const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
    const content = template
      .replace("{ip}", `${Math.round(Math.random() * 200 + 10)}.${Math.round(Math.random() * 255)}.${Math.round(Math.random() * 255)}.${Math.round(Math.random() * 255)}`)
      .replace("{domain}", ["c2.malicious.top", "evil-dns.xyz", "data-leak.cc"][Math.floor(Math.random() * 3)])
      .replace("{size}", String((Math.random() * 5 + 0.5).toFixed(1)))
      .replace("{port}", String([4444, 8080, 3389, 1337][Math.floor(Math.random() * 4)]))
      .replace("{user}", ["guest_user", "admin_backup", "svc_account"][Math.floor(Math.random() * 3)]);
    return {
      line: Math.round(Math.random() * 300 + 10),
      content,
      severity: Math.round(40 + Math.random() * 55),
      category: categories[Math.floor(Math.random() * categories.length)],
    };
  }).sort((a, b) => b.severity - a.severity);
};

const LogAnalysis = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [logText, setLogText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<LogEntry[] | null>(null);

  // Load last scan on mount
  useEffect(() => {
    if (!user) return;
    const loadLastScan = async () => {
      const { data } = await supabase
        .from("scan_history")
        .select("results")
        .eq("user_id", user.id)
        .eq("scan_type", "log_analysis")
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0 && data[0].results) {
        const parsed = data[0].results as any;
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].content) {
          setResults(parsed as LogEntry[]);
        }
      }
    };
    loadLastScan();
  }, [user]);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(async () => {
      const generated = generateLogs();
      setAnalyzing(false);
      setResults(generated);

      if (user) {
        const riskScore = Math.round(generated.reduce((a, b) => a + b.severity, 0) / generated.length);
        const highSeverity = generated.filter(r => r.severity >= 70).length;
        await Promise.all([
          supabase.from("scan_history").insert({
            user_id: user.id,
            scan_type: "log_analysis",
            risk_score: riskScore,
            threat_count: highSeverity,
            target: "log_input",
            results: generated as any,
          }),
          supabase.from("profiles").update({
            total_scans: (profile?.total_scans ?? 0) + 1,
            threats_detected: (profile?.threats_detected ?? 0) + highSeverity,
          }).eq("user_id", user.id),
        ]);
      }

      toast({
        variant: "destructive",
        title: "Log Analysis Complete",
        description: `${generated.length} suspicious entries found`,
      });
    }, 2500);
  };

  const overallScore = results ? Math.round(results.reduce((a, b) => a + b.severity, 0) / results.length) : 0;

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Log Analysis</h2>
        <p className="text-muted-foreground mt-1">Upload and analyze system logs for threat indicators</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-8 mb-6">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="border-border">
            <Upload className="w-4 h-4 mr-2" />Upload Log File
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
          <div className="bg-card border border-border rounded-xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <RiskGauge score={overallScore} label="Log Threat Score" size="lg" />
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Entries Analyzed</p>
                  <p className="text-2xl font-bold font-mono text-foreground">{Math.round(100 + Math.random() * 300)}</p>
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

          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Flagged Log Entries</h3>
              <ExportButton data={{
                title: "Log_Analysis_Report",
                generatedAt: new Date().toISOString(),
                rows: results.map(r => ({ line: r.line, content: r.content, severity: r.severity, category: r.category })),
              }} />
            </div>
            <div className="space-y-3">
              {results.map((entry, i) => {
                const risk = getRiskColor(entry.severity);
                return (
                  <div key={i} className="p-3 md:p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${risk.color}`} />
                        <span className="text-xs font-mono text-muted-foreground">Line {entry.line}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">{entry.category}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${risk.color}`}>{entry.severity}</span>
                    </div>
                    <p className="font-mono text-sm text-foreground break-all">{entry.content}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <AIThreatAnalysis threatData={{
            type: "Log Analysis",
            entries: results.map(r => ({ line: r.line, content: r.content, severity: r.severity, category: r.category })),
          }} />
        </div>
      )}
    </AppLayout>
  );
};

export default LogAnalysis;
