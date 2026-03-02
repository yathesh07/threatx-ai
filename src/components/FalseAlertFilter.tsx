import { useState, useEffect, useCallback } from "react";
import { Filter, Eye, EyeOff, ThumbsUp, ThumbsDown, AlertTriangle, Shield, CheckCircle, TrendingDown, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export interface FilteredAlert {
  id: string;
  type: string;
  description: string;
  severity: number;
  confidence: number;
  falsePositiveScore: number;
  classification: "confirmed" | "suspicious" | "likely_false_positive";
  timestamp: string;
  features: { name: string; score: number }[];
  userFeedback?: "real" | "false_alarm";
  solution: string;
}

const classifyAlert = (confidence: number, fpScore: number): FilteredAlert["classification"] => {
  if (confidence >= 75 && fpScore < 30) return "confirmed";
  if (confidence >= 40 || fpScore < 60) return "suspicious";
  return "likely_false_positive";
};

const computeFPScore = (alert: Omit<FilteredAlert, "falsePositiveScore" | "classification">): number => {
  let score = 0;
  // Low confidence → likely false positive
  if (alert.confidence < 50) score += 30;
  else if (alert.confidence < 70) score += 15;
  // Low severity → more likely false
  if (alert.severity < 40) score += 25;
  else if (alert.severity < 60) score += 10;
  // Feature-based scoring
  const avgFeature = alert.features.reduce((s, f) => s + f.score, 0) / (alert.features.length || 1);
  if (avgFeature < 0.4) score += 20;
  // Previously marked false → boost
  if (alert.userFeedback === "false_alarm") score += 30;
  return Math.min(100, score);
};

const generateAlerts = (): FilteredAlert[] => {
  const raw = [
    { id: "fa-1", type: "Malware", description: "Trojan.GenericKD detected on endpoint-07", severity: 92, confidence: 89, features: [{ name: "File entropy", score: 0.91 }, { name: "API calls", score: 0.85 }, { name: "Signature match", score: 0.78 }], solution: "Isolate the endpoint immediately. Run a full offline antivirus scan. Re-image if the threat persists." },
    { id: "fa-2", type: "Phishing", description: "Suspicious login page at secure-update.xyz", severity: 78, confidence: 82, features: [{ name: "Domain age", score: 0.95 }, { name: "SSL cert", score: 0.2 }, { name: "URL pattern", score: 0.73 }], solution: "Block this domain across your network. Force password resets for users who visited. Enable MFA." },
    { id: "fa-3", type: "Network", description: "Outbound connection to unusual port 4444", severity: 35, confidence: 28, features: [{ name: "Port reputation", score: 0.3 }, { name: "Traffic volume", score: 0.15 }, { name: "Destination IP", score: 0.22 }], solution: "Monitor the connection for 24 hours. Likely a legitimate development tool. Verify with the endpoint user." },
    { id: "fa-4", type: "Log Anomaly", description: "Failed login from internal IP 10.0.0.45", severity: 25, confidence: 18, features: [{ name: "IP reputation", score: 0.1 }, { name: "Login pattern", score: 0.2 }, { name: "Time anomaly", score: 0.15 }], solution: "No action needed. This appears to be a normal password typo from a known internal user." },
    { id: "fa-5", type: "Malware", description: "Macro.Downloader found in document.xlsm", severity: 55, confidence: 52, features: [{ name: "Macro complexity", score: 0.6 }, { name: "File origin", score: 0.45 }, { name: "Obfuscation", score: 0.38 }], solution: "Quarantine the file. Verify with the sender. Update macro security policies to block by default." },
    { id: "fa-6", type: "Network", description: "DNS query to known C2 domain detected", severity: 95, confidence: 94, features: [{ name: "Domain reputation", score: 0.98 }, { name: "Query pattern", score: 0.88 }, { name: "Threat intel match", score: 0.95 }], solution: "Block the domain immediately. Identify the source machine. Run full malware scan. Check for data exfiltration." },
    { id: "fa-7", type: "Phishing", description: "URL with Base64 encoded parameters", severity: 30, confidence: 22, features: [{ name: "URL encoding", score: 0.35 }, { name: "Domain age", score: 0.1 }, { name: "SSL valid", score: 0.05 }], solution: "Likely a legitimate application using encoded parameters. No action required unless other indicators appear." },
    { id: "fa-8", type: "Log Anomaly", description: "Root access at 2:30 AM from admin console", severity: 68, confidence: 61, features: [{ name: "Time anomaly", score: 0.7 }, { name: "User pattern", score: 0.55 }, { name: "Access location", score: 0.5 }], solution: "Verify with the admin team. If unauthorized, revoke access and audit recent changes. Enable after-hours alerts." },
  ];

  return raw.map((a) => {
    const fpScore = computeFPScore({ ...a, timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString() } as any);
    return {
      ...a,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      falsePositiveScore: fpScore,
      classification: classifyAlert(a.confidence, fpScore),
    };
  }).sort((a, b) => {
    const order = { confirmed: 0, suspicious: 1, likely_false_positive: 2 };
    return order[a.classification] - order[b.classification];
  });
};

const classStyles = {
  confirmed: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", label: "⚠ Confirmed Threat", icon: AlertTriangle },
  suspicious: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", label: "🔍 Needs Review", icon: Eye },
  likely_false_positive: { bg: "bg-success/10", border: "border-success/30", text: "text-success", label: "✓ Likely False Positive", icon: Shield },
};

const FalseAlertFilter = () => {
  const [alerts, setAlerts] = useState<FilteredAlert[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suppressedCount, setSuppressedCount] = useState(0);

  useEffect(() => {
    const generated = generateAlerts();
    setAlerts(generated);
    setSuppressedCount(generated.filter((a) => a.classification === "likely_false_positive").length);
  }, []);

  const markFeedback = useCallback((id: string, feedback: "real" | "false_alarm") => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, userFeedback: feedback };
        if (feedback === "false_alarm") {
          updated.falsePositiveScore = Math.min(100, a.falsePositiveScore + 30);
          updated.classification = classifyAlert(a.confidence, updated.falsePositiveScore);
        }
        return updated;
      })
    );
    toast({
      title: feedback === "false_alarm" ? "Marked as False Alarm" : "Confirmed as Real Threat",
      description: feedback === "false_alarm"
        ? "Future similar alerts will be auto-suppressed."
        : "Alert priority maintained. Solution actions recommended.",
    });
  }, []);

  const visibleAlerts = showAdvanced
    ? alerts
    : alerts.filter((a) => a.classification !== "likely_false_positive");

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Intelligent Alert Filter</h3>
        </div>
        <div className="flex items-center gap-3">
          {suppressedCount > 0 && (
            <span className="text-xs font-mono bg-success/10 text-success px-2 py-1 rounded-full border border-success/20">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              {suppressedCount} auto-suppressed
            </span>
          )}
          <Button
            size="sm"
            variant={showAdvanced ? "default" : "outline"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={showAdvanced ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}
          >
            {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showAdvanced ? "Hide Low-Confidence" : "Show All Alerts"}
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Confirmed</p>
          <p className="text-xl font-bold font-mono text-destructive">{alerts.filter((a) => a.classification === "confirmed").length}</p>
        </div>
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Needs Review</p>
          <p className="text-xl font-bold font-mono text-warning">{alerts.filter((a) => a.classification === "suspicious").length}</p>
        </div>
        <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">False Positives</p>
          <p className="text-xl font-bold font-mono text-success">{alerts.filter((a) => a.classification === "likely_false_positive").length}</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {visibleAlerts.map((alert) => {
          const cls = classStyles[alert.classification];
          const isExpanded = expandedId === alert.id;
          return (
            <div key={alert.id} className={`border rounded-lg overflow-hidden ${cls.border}`}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/30 transition-colors`}
              >
                <cls.icon className={`w-4 h-4 shrink-0 ${cls.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{alert.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${cls.bg} ${cls.text} ${cls.border}`}>
                      {cls.label}
                    </span>
                    {alert.userFeedback && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                        {alert.userFeedback === "false_alarm" ? "📌 Marked False" : "📌 Confirmed"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{alert.description}</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-xs font-mono text-muted-foreground">Conf: <span className="text-foreground font-bold">{alert.confidence}%</span></div>
                  <div className="text-xs font-mono text-muted-foreground">FP: <span className={alert.falsePositiveScore > 50 ? "text-success font-bold" : "text-destructive font-bold"}>{alert.falsePositiveScore}%</span></div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  {/* Confidence & FP visual */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Threat Confidence</p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${alert.confidence}%` }} />
                      </div>
                      <p className="text-xs font-mono text-foreground mt-1">{alert.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">False Positive Probability</p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full transition-all" style={{ width: `${alert.falsePositiveScore}%` }} />
                      </div>
                      <p className="text-xs font-mono text-foreground mt-1">{alert.falsePositiveScore}%</p>
                    </div>
                  </div>

                  {/* Feature breakdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <p className="text-xs font-semibold text-foreground">Detection Features</p>
                    </div>
                    <div className="space-y-1.5">
                      {alert.features.map((f) => (
                        <div key={f.name} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-28 truncate">{f.name}</span>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${f.score * 100}%`, background: f.score > 0.6 ? "hsl(var(--destructive))" : f.score > 0.3 ? "hsl(var(--warning))" : "hsl(var(--success))" }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground w-10 text-right">{(f.score * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto Solution */}
                  <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-success" />
                      <p className="text-xs font-semibold text-foreground">Recommended Action</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.solution}</p>
                  </div>

                  {/* User Feedback */}
                  {!alert.userFeedback && (
                    <div className="flex items-center gap-3 pt-1">
                      <p className="text-xs text-muted-foreground">Was this a real threat?</p>
                      <Button size="sm" variant="outline" onClick={() => markFeedback(alert.id, "real")} className="text-xs h-7 border-destructive/30 text-destructive hover:bg-destructive/10">
                        <ThumbsUp className="w-3 h-3 mr-1" /> Real Threat
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => markFeedback(alert.id, "false_alarm")} className="text-xs h-7 border-success/30 text-success hover:bg-success/10">
                        <ThumbsDown className="w-3 h-3 mr-1" /> False Alarm
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FalseAlertFilter;
