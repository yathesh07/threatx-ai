import { useState, useEffect } from "react";
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

const sources = ["endpoint-04", "email-gateway", "firewall-01", "endpoint-12", "switch-03", "dns-server", "endpoint-09", "proxy-02"];
const descriptions: Record<string, string[]> = {
  Malware: ["Trojan.GenericKD detected in system32", "Ransomware signature in temp folder", "Suspicious DLL loaded by svchost", "PUA detected - adware component"],
  Phishing: ["Suspicious URL in inbound email", "Credential harvesting page detected", "Fake banking login portal blocked", "Spear phishing with macro attachment"],
  Network: ["Unusual outbound traffic to unknown IP", "Port scan activity from external source", "DNS exfiltration pattern detected", "Brute-force SSH attempt blocked"],
};

const generateThreats = (): ThreatItem[] => {
  const types = ["Malware", "Phishing", "Network"];
  const times = ["Just now", "1 min ago", "3 min ago", "8 min ago", "15 min ago"];
  return Array.from({ length: 5 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id: String(i),
      type,
      severity: Math.round(20 + Math.random() * 75),
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp: times[i],
      description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
    };
  });
};

const iconMap: Record<string, typeof AlertTriangle> = {
  Malware: AlertTriangle,
  Phishing: Shield,
  Network: Activity,
};

const ThreatFeed = () => {
  const [threats, setThreats] = useState(generateThreats);

  useEffect(() => {
    const interval = setInterval(() => setThreats(generateThreats()), 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Live Threat Feed</h3>
        <span className="flex items-center gap-1.5 text-xs font-mono text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="space-y-3">
        {threats.map((threat) => {
          const risk = getRiskColor(threat.severity);
          const Icon = iconMap[threat.type] || AlertTriangle;
          return (
            <div key={threat.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/20 transition-colors">
              <div className={`p-2 rounded-lg bg-secondary ${risk.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{threat.type}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${risk.color} bg-secondary`}>{threat.severity}</span>
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
