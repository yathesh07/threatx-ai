import { AlertTriangle, Shield, Activity, Clock } from "lucide-react";
import { getRiskColor } from "./RiskGauge";

interface ThreatItem {
  id: string;
  type: string;
  severity: number;
  source: string;
  timestamp: string;
  description: string;
}

const mockThreats: ThreatItem[] = [
  { id: "1", type: "Malware", severity: 92, source: "endpoint-04", timestamp: "2 min ago", description: "Trojan.GenericKD detected in system32" },
  { id: "2", type: "Phishing", severity: 78, source: "email-gateway", timestamp: "8 min ago", description: "Suspicious URL in inbound email" },
  { id: "3", type: "Network", severity: 65, source: "firewall-01", timestamp: "15 min ago", description: "Unusual outbound traffic to unknown IP" },
  { id: "4", type: "Malware", severity: 45, source: "endpoint-12", timestamp: "32 min ago", description: "PUA detected - adware component" },
  { id: "5", type: "Network", severity: 30, source: "switch-03", timestamp: "1 hr ago", description: "Minor port scan activity detected" },
];

const iconMap: Record<string, typeof AlertTriangle> = {
  Malware: AlertTriangle,
  Phishing: Shield,
  Network: Activity,
};

const ThreatFeed = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Live Threat Feed</h3>
        <span className="flex items-center gap-1.5 text-xs font-mono text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="space-y-3">
        {mockThreats.map((threat) => {
          const risk = getRiskColor(threat.severity);
          const Icon = iconMap[threat.type] || AlertTriangle;
          return (
            <div
              key={threat.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/20 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-secondary ${risk.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{threat.type}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${risk.color} bg-secondary`}>
                    {threat.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{threat.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">{threat.source}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {threat.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreatFeed;
