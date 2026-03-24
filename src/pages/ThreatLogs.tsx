import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { FileText, Search, AlertTriangle, Shield, CheckCircle, Lightbulb, Clock, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getRiskColor } from "@/components/RiskGauge";
import { useAuth } from "@/contexts/AuthContext";

interface ThreatLog {
  id: string;
  timestamp: string;
  type: string;
  severity: number;
  description: string;
  solution: string;
  resolved: boolean;
}

// Seeded pseudo-random number generator
const seededRandom = (seed: number, offset: number) => {
  const x = Math.sin(seed + offset * 9973) * 10000;
  return x - Math.floor(x);
};

const generateMockLogs = (userSeed: number): ThreatLog[] => {
  const types = ["Malware", "Phishing", "Network", "Log Anomaly"];
  const logs: ThreatLog[] = [];
  const now = Date.now();

  const descriptions: Record<string, string[]> = {
    Malware: [
      "Trojan.Win32.Agent detected on endpoint-07",
      "Ransomware signature found in quarantine",
      "Backdoor.Win32.Agent found in update.bat",
      "Suspicious executable blocked from download",
      "Rootkit activity detected in kernel module",
      "Cryptominer process consuming 95% CPU",
      "Worm propagation attempt via SMB share",
      "Keylogger DLL injected into browser process",
    ],
    Phishing: [
      "Credential harvesting page identified at login-secure.com",
      "Suspicious URL blocked from email gateway",
      "Fake banking portal detected targeting employees",
      "Spear-phishing email with malicious attachment",
      "CEO impersonation email requesting wire transfer",
      "OAuth consent phishing targeting cloud accounts",
      "QR code phishing campaign detected in emails",
      "Fake MFA reset page hosted on compromised domain",
    ],
    Network: [
      "Port scan detected from 203.0.113.88",
      "Unusual DNS exfiltration pattern detected",
      "Brute-force SSH attempt from external IP",
      "Anomalous outbound traffic spike to unknown server",
      "Lateral movement detected between subnets",
      "TLS certificate mismatch on internal service",
      "ARP spoofing detected on VLAN 42",
      "Unauthorized DHCP server broadcasting on network",
    ],
    "Log Anomaly": [
      "Privilege escalation attempt from guest account",
      "Multiple failed login attempts detected",
      "Unauthorized config change in firewall rules",
      "Suspicious cron job added to production server",
      "Audit log tampering detected on auth server",
      "Service account used outside business hours",
      "Mass file deletion event on shared drive",
      "Database query pattern anomaly — possible SQLi",
    ],
  };

  const solutions: Record<string, string[]> = {
    Malware: [
      "Isolate the infected endpoint. Run a full offline antivirus scan. Re-image if needed.",
      "Keep the file in quarantine. Update antivirus definitions. Monitor for reappearance.",
      "Remove the backdoor file. Check for persistence mechanisms. Patch the entry point.",
      "Block the download source. Update web gateway rules. Alert affected users.",
      "Run rootkit detection tools. Boot from clean media. Rebuild kernel if compromised.",
      "Kill the miner process. Block mining pool IPs. Scan for initial access vector.",
      "Disable SMB v1. Patch MS17-010. Isolate affected segments.",
      "Terminate injected process. Scan for stolen credentials. Force password resets.",
    ],
    Phishing: [
      "Block the domain. Force password resets for anyone who visited. Enable MFA.",
      "Add URL to blocklist. Review email filters. Notify impacted users.",
      "Report the domain to ISP. Update email gateway. Train employees on phishing.",
      "Quarantine the email. Scan attachments. Brief the team on the attack pattern.",
      "Alert finance team. Verify all pending transfers. Report to law enforcement.",
      "Revoke compromised OAuth tokens. Audit connected apps. Enable consent verification.",
      "Block QR code sender. Alert employees. Update email scanning for QR payloads.",
      "Take down the fake MFA page. Reset affected accounts. Add domain to blocklist.",
    ],
    Network: [
      "Block the source IP at firewall. Review scanned ports for vulnerabilities.",
      "Investigate DNS queries. Block suspicious domains. Enable DNS-over-HTTPS.",
      "Block the attacking IP. Enforce strong passwords. Consider fail2ban rules.",
      "Identify the destination. Check for data loss. Tighten egress rules.",
      "Segment affected subnets. Check for compromised credentials. Enable micro-segmentation.",
      "Update the TLS certificate. Investigate potential MITM. Alert service owners.",
      "Enable dynamic ARP inspection. Isolate the rogue device. Review switch port security.",
      "Locate and disable rogue DHCP. Enable DHCP snooping on switches.",
    ],
    "Log Anomaly": [
      "Revoke guest account privileges. Audit permission policies. Enable MFA.",
      "Lock affected accounts. Review access logs. Implement account lockout policies.",
      "Revert the config change. Audit admin access. Enable change tracking.",
      "Remove the suspicious cron job. Scan for rootkits. Review deployment pipeline.",
      "Restore audit logs from backup. Investigate the tampering source. Enable log immutability.",
      "Review service account activity. Restrict logon hours. Enable alerting for off-hours use.",
      "Restore deleted files. Investigate the user account. Enable versioning on shares.",
      "Review query logs. Block the source IP. Implement WAF rules for SQLi.",
    ],
  };

  // User seed determines which descriptions/solutions are picked and in what order
  const logCount = 15 + Math.floor(seededRandom(userSeed, 999) * 10); // 15-24 logs per user
  
  for (let i = 0; i < logCount; i++) {
    const typeIdx = Math.floor(seededRandom(userSeed, i * 7 + 1) * types.length);
    const type = types[typeIdx];
    const descIdx = Math.floor(seededRandom(userSeed, i * 7 + 2) * descriptions[type].length);
    const severity = 25 + Math.floor(seededRandom(userSeed, i * 7 + 3) * 70); // 25-95
    const hoursAgo = seededRandom(userSeed, i * 7 + 4) * 168; // up to 7 days
    const resolved = seededRandom(userSeed, i * 7 + 5) > 0.45;
    
    logs.push({
      id: `TL-${String(1000 + Math.floor(seededRandom(userSeed, i * 7 + 6) * 9000))}`,
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      type,
      severity,
      description: descriptions[type][descIdx],
      solution: solutions[type][descIdx],
      resolved,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const ThreatLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const userSeed = (user?.id || "anonymous").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    setLogs(generateMockLogs(userSeed));
  }, [user]);

  const filtered = logs.filter((log) => {
    const matchSearch = log.description.toLowerCase().includes(search.toLowerCase()) || log.type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || log.type === filter || (filter === "resolved" && log.resolved) || (filter === "unresolved" && !log.resolved);
    return matchSearch && matchFilter;
  });

  const filterOptions = ["all", "Malware", "Phishing", "Network", "Log Anomaly", "resolved", "unresolved"];

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Threat Logs</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Complete history of detected threats and proposed solutions</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search threats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={`text-xs capitalize ${filter === f ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filtered.map((log) => {
          const risk = getRiskColor(log.severity);
          const isExpanded = expandedId === log.id;
          return (
            <div key={log.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-secondary/30 transition-colors text-left"
              >
                {log.resolved ? (
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${risk.color}`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{log.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${risk.color} border-current/20`}>
                      Severity: {log.severity}
                    </span>
                    {log.resolved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-mono">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{log.description}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 border-t border-border pt-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Threat Details</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-success/5 border border-success/20 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-success" />
                      <h4 className="text-sm font-semibold text-foreground">Proposed Solution</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{log.solution}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No threat logs found matching your criteria</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ThreatLogs;
