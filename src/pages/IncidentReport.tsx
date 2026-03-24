import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ExportButton from "@/components/ExportReport";
import RiskGauge from "@/components/RiskGauge";
import { getRiskColor } from "@/components/RiskGauge";
import { FileText, AlertTriangle, Shield, Zap, Clock, Download, ChevronRight, CheckCircle, Brain, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Incident {
  id: string;
  timestamp: string;
  type: string;
  severity: number;
  confidence: number;
  module: string;
  description: string;
  logEvidence: string;
  solution: string;
  status: "detected" | "documented" | "escalated";
  escalationTier?: string;
  priorityCode?: string;
}

const seededRandom = (seed: number, offset: number) => {
  const x = Math.sin(seed + offset * 9973) * 10000;
  return x - Math.floor(x);
};

const incidentTemplates = [
  { type: "Malware", module: "Malware Scanner", descriptions: [
    "Trojan.GenericKD.46542 detected on endpoint-07 with high entropy binary and suspicious API call patterns.",
    "Ransomware payload intercepted attempting to encrypt shared drive on file-server-03.",
    "Cryptominer malware consuming 98% CPU on workstation-14, C2 beacon confirmed.",
    "Fileless malware detected using PowerShell living-off-the-land technique on DC-02.",
    "Rootkit signatures found in boot sector of endpoint-22, persistence mechanism active.",
    "Polymorphic virus variant evading signature detection on endpoint-11.",
  ], evidenceTemplates: [
    "[CRITICAL] Signature match: Trojan.GenericKD.46542\n[WARNING] Suspicious CreateRemoteThread API call\n[ERROR] File entropy 7.98/8.0 — packed binary",
    "[CRITICAL] Ransomware encryption routine detected\n[ERROR] 847 files targeted for encryption\n[WARNING] Shadow copy deletion attempted",
    "[WARNING] CPU usage spike to 98% on workstation-14\n[CRITICAL] Outbound connection to mining pool detected\n[ERROR] Persistence via scheduled task confirmed",
    "[CRITICAL] PowerShell AMSI bypass detected\n[ERROR] In-memory payload execution via reflective loading\n[WARNING] Lateral movement via WMI observed",
    "[CRITICAL] MBR modification detected\n[ERROR] Hidden driver loaded at boot\n[WARNING] Anti-forensic timestamp manipulation",
    "[WARNING] Signature mutation detected across 5 samples\n[ERROR] Heuristic score 9.2/10\n[CRITICAL] Self-modifying code in memory",
  ], solutions: [
    "Isolate endpoint-07. Run offline AV scan. Re-image if persistence found. Patch entry vector.",
    "Disconnect file-server-03 from network. Restore from clean backup. Patch SMB vulnerabilities.",
    "Kill miner process. Block mining pool IPs at firewall. Scan for initial access vector.",
    "Isolate DC-02. Reset all admin credentials. Enable constrained language mode for PowerShell.",
    "Boot from clean media. Rebuild MBR. Full re-image of endpoint-22. Audit boot chain.",
    "Update AV signatures. Deploy behavioral detection rules. Quarantine affected endpoints.",
  ]},
  { type: "Phishing", module: "Phishing Detection", descriptions: [
    "Credential harvesting page at secure-login-update.xyz targeting internal employees.",
    "CEO impersonation email requesting urgent wire transfer of $125,000 to offshore account.",
    "OAuth consent phishing campaign targeting Microsoft 365 accounts with fake app permissions.",
    "Fake MFA reset page hosted on compromised legitimate domain collecting TOTP codes.",
    "Watering hole attack detected on industry forum frequently visited by engineering team.",
    "Voice phishing (vishing) campaign targeting HR department for employee PII.",
  ], evidenceTemplates: [
    "[WARNING] URL blocked: secure-login-update.xyz/login\n[INFO] Domain age: 2 days\n[WARNING] Visual similarity to internal portal: 94%",
    "[CRITICAL] Email header analysis: forged From field\n[WARNING] Urgency keywords detected\n[ERROR] Reply-to address differs from display name",
    "[WARNING] OAuth consent request from unverified app\n[CRITICAL] Excessive permission scope: Mail.ReadWrite, Files.ReadWrite.All\n[ERROR] 12 users granted consent before detection",
    "[CRITICAL] Legitimate domain compromised: trusted-vendor.com/mfa-reset\n[WARNING] TOTP code interception detected\n[ERROR] 3 accounts potentially compromised",
    "[WARNING] Injected JavaScript on forum page\n[CRITICAL] Drive-by download attempted\n[ERROR] Exploit kit targeting browser vulnerabilities",
    "[WARNING] Spoofed caller ID matching company switchboard\n[CRITICAL] Social engineering script detected\n[ERROR] 2 employees disclosed partial SSN data",
  ], solutions: [
    "Block domain network-wide. Force password reset for 3 users who visited. Enable MFA on all accounts.",
    "Alert finance team. Freeze pending transfers. Report to FBI IC3. Brief all executives.",
    "Revoke compromised OAuth tokens. Audit connected apps. Enable admin consent workflow.",
    "Take down compromised page. Reset affected accounts. Deploy phishing-resistant FIDO2 keys.",
    "Block compromised forum domain. Scan visiting users' machines. Patch browser vulnerabilities.",
    "Alert HR to cease disclosures. Notify affected employees. Enable voice verification protocols.",
  ]},
  { type: "Network", module: "Network Anomaly", descriptions: [
    "DNS exfiltration to known C2 domain with data transfer volume of 2.3GB to external IP.",
    "Lateral movement detected from compromised workstation to domain controller via Pass-the-Hash.",
    "DDoS attack detected — 15Gbps volumetric flood targeting public-facing web application.",
    "Man-in-the-middle attack detected on internal network using ARP poisoning technique.",
    "Unauthorized VPN tunnel established from internal server to external IP in high-risk country.",
    "Botnet C2 communication pattern detected from 8 endpoints in marketing subnet.",
  ], evidenceTemplates: [
    "[CRITICAL] DNS query to c2.malicious-domain.top\n[ERROR] Data transfer: 2.3GB outbound\n[CRITICAL] C2 beacon pattern confirmed",
    "[CRITICAL] NTLM hash relay detected\n[ERROR] Lateral movement: ws-15 → DC-01\n[WARNING] Mimikatz-like memory access pattern",
    "[CRITICAL] Inbound traffic spike: 15.2 Gbps\n[ERROR] SYN flood from 50,000+ source IPs\n[WARNING] Application response time degraded 400%",
    "[CRITICAL] ARP table poisoning on VLAN 10\n[ERROR] SSL/TLS interception detected\n[WARNING] Credentials captured in transit",
    "[CRITICAL] Unauthorized OpenVPN tunnel on port 443\n[ERROR] Destination: 185.x.x.x (sanctioned country)\n[WARNING] 800MB data exfiltrated over 6 hours",
    "[CRITICAL] C2 heartbeat pattern: 60s intervals\n[ERROR] 8 endpoints communicating with same C2\n[WARNING] IRC-based command channel detected",
  ], solutions: [
    "Block C2 domain. Identify source machine. Full forensic analysis. Check for lateral movement.",
    "Reset all domain admin passwords. Disable NTLM where possible. Enable Credential Guard.",
    "Activate DDoS mitigation. Route traffic through scrubbing center. Enable rate limiting.",
    "Enable dynamic ARP inspection. Isolate rogue device. Deploy 802.1X authentication.",
    "Terminate VPN tunnel. Isolate the server. Full forensic investigation. Report to legal.",
    "Quarantine affected endpoints. Block C2 IPs. Deploy EDR across marketing subnet.",
  ]},
  { type: "Log Anomaly", module: "Log Analysis", descriptions: [
    "Privilege escalation attempt from guest account at 2:30 AM via sudo exploit.",
    "Mass audit log deletion detected on authentication server — potential evidence tampering.",
    "Service account performing 50,000 database queries in 10 minutes — possible data harvesting.",
    "Failed login attempts from 200+ unique IPs against admin portal — distributed brute force.",
    "Unauthorized certificate authority created on internal PKI server.",
    "Cron job modification on production database server scheduling nightly data export.",
  ], evidenceTemplates: [
    "[WARNING] sudo attempt by guest_user\n[ERROR] Privilege escalation CVE-2024-1234\n[WARNING] Config file modified: /etc/sudoers",
    "[CRITICAL] 15,000 audit log entries deleted\n[ERROR] Log deletion by svc_backup account\n[WARNING] Deletion timestamp coincides with intrusion window",
    "[WARNING] svc_reporting: 50,247 SELECT queries in 10min\n[CRITICAL] Query pattern targets PII columns\n[ERROR] 2.1GB result set generated",
    "[CRITICAL] 247 unique source IPs in 30 minutes\n[ERROR] Target: /admin/login endpoint\n[WARNING] Credential stuffing pattern detected",
    "[CRITICAL] New root CA certificate created\n[ERROR] Unauthorized issuer: 'Internal-Shadow-CA'\n[WARNING] 3 certificates already issued by rogue CA",
    "[WARNING] Crontab modified on db-prod-01\n[CRITICAL] New job: mysqldump to external S3 bucket\n[ERROR] Bucket owned by unknown AWS account",
  ], solutions: [
    "Disable guest account. Revert sudoers change. Patch CVE-2024-1234. Audit all admin access.",
    "Restore logs from immutable backup. Revoke svc_backup credentials. Enable write-once logging.",
    "Revoke svc_reporting access. Audit exported data. Implement query rate limiting.",
    "Enable CAPTCHA on admin login. Deploy IP reputation filtering. Force admin password rotation.",
    "Revoke rogue CA. Re-issue all affected certificates. Audit PKI access controls.",
    "Remove malicious cron job. Rotate database credentials. Block external S3 bucket at firewall.",
  ]},
];

const generateIncidents = (userSeed: number): Incident[] => {
  const incidents: Incident[] = [];
  const now = Date.now();
  
  // Each user gets 4-6 incidents with different combinations
  const count = 4 + Math.floor(seededRandom(userSeed, 100) * 3);
  
  for (let i = 0; i < count; i++) {
    const templateIdx = Math.floor(seededRandom(userSeed, i * 11 + 1) * incidentTemplates.length);
    const template = incidentTemplates[templateIdx];
    const variantIdx = Math.floor(seededRandom(userSeed, i * 11 + 2) * template.descriptions.length);
    
    const severity = 45 + Math.floor(seededRandom(userSeed, i * 11 + 3) * 53); // 45-98
    const confidence = 55 + Math.floor(seededRandom(userSeed, i * 11 + 4) * 40); // 55-95
    const hoursAgo = Math.floor(seededRandom(userSeed, i * 11 + 5) * 48); // up to 48 hours
    const incidentNum = 300 + Math.floor(seededRandom(userSeed, i * 11 + 6) * 700);
    
    incidents.push({
      id: `INC-2026-${String(incidentNum).padStart(4, "0")}`,
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      type: template.type,
      severity,
      confidence,
      module: template.module,
      description: template.descriptions[variantIdx],
      logEvidence: new Date(now - hoursAgo * 3600000).toISOString().slice(0, 10).replace(/-/g, "-") + " " +
        new Date(now - hoursAgo * 3600000).toTimeString().slice(0, 8) + " " +
        template.evidenceTemplates[variantIdx],
      solution: template.solutions[variantIdx],
      status: "detected",
    });
  }
  
  return incidents.sort((a, b) => b.severity - a.severity);
};

const getEscalationTier = (severity: number): string => {
  if (severity >= 90) return "SOC Manager / Tier 3";
  if (severity >= 70) return "Tier 2 Analyst";
  return "Tier 1 Analyst";
};

const getPriorityCode = (severity: number): string => {
  if (severity >= 90) return "P1 — CRITICAL";
  if (severity >= 70) return "P2 — HIGH";
  if (severity >= 50) return "P3 — MEDIUM";
  return "P4 — LOW";
};

const getImpactAssessment = (severity: number, seed: number) => ({
  dataBreachProbability: Math.min(95, severity + Math.round(seededRandom(seed, 501) * 10)),
  operationalDisruption: Math.min(90, Math.round(severity * 0.8 + seededRandom(seed, 502) * 15)),
  financialImpact: severity >= 80 ? "High ($50K–$500K)" : severity >= 60 ? "Medium ($10K–$50K)" : "Low (<$10K)",
  complianceRisk: severity >= 80 ? "Critical — Regulatory notification required" : severity >= 60 ? "Moderate — Internal audit recommended" : "Low — Standard monitoring",
});

const IncidentReport = () => {
  const { user } = useAuth();
  const userSeed = (user?.id || "anonymous").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  const [incidents, setIncidents] = useState<Incident[]>(() => generateIncidents(userSeed));
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dialogMode, setDialogMode] = useState<"choose" | "document" | "escalate" | null>(null);

  const handleAction = (incident: Incident) => {
    setSelectedIncident(incident);
    setDialogMode("choose");
  };

  const documentIncident = () => {
    if (!selectedIncident) return;
    setIncidents((prev) => prev.map((i) => i.id === selectedIncident.id ? { ...i, status: "documented" } : i));
    setDialogMode("document");
    toast({ title: "Incident Documented", description: `${selectedIncident.id} has been documented successfully.` });
  };

  const escalateIncident = () => {
    if (!selectedIncident) return;
    const tier = getEscalationTier(selectedIncident.severity);
    const code = getPriorityCode(selectedIncident.severity);
    setIncidents((prev) => prev.map((i) => i.id === selectedIncident.id ? { ...i, status: "escalated", escalationTier: tier, priorityCode: code } : i));
    setDialogMode("escalate");
    toast({ variant: "destructive", title: "Incident Escalated", description: `${selectedIncident.id} escalated to ${tier} with priority ${code}.` });
  };

  const getExportData = (incident: Incident, type: "document" | "escalate") => {
    const impact = getImpactAssessment(incident.severity, userSeed);
    const base = [
      { field: "Incident ID", value: incident.id },
      { field: "Timestamp", value: new Date(incident.timestamp).toLocaleString() },
      { field: "Threat Type", value: incident.type },
      { field: "Severity", value: incident.severity },
      { field: "Confidence", value: `${incident.confidence}%` },
      { field: "Detection Module", value: incident.module },
      { field: "Description", value: incident.description },
      { field: "Log Evidence", value: incident.logEvidence.replace(/\n/g, " | ") },
      { field: "Recommended Actions", value: incident.solution },
    ];
    if (type === "escalate") {
      base.push(
        { field: "Escalation Tier", value: getEscalationTier(incident.severity) },
        { field: "Priority Code", value: getPriorityCode(incident.severity) },
        { field: "Data Breach Probability", value: `${impact.dataBreachProbability}%` },
        { field: "Operational Disruption", value: `${impact.operationalDisruption}%` },
        { field: "Financial Impact", value: impact.financialImpact },
        { field: "Compliance Risk", value: impact.complianceRisk },
        { field: "Status", value: "ESCALATED" },
      );
    } else {
      base.push({ field: "Status", value: "DOCUMENTED (Not Escalated)" });
    }
    return { title: `${type === "escalate" ? "Escalation" : "Incident"}_Report_${incident.id}`, generatedAt: new Date().toISOString(), rows: base };
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Incident Response Center</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Escalate threats or generate audit-ready documentation</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Incidents</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-foreground">{incidents.length}</p>
        </div>
        <div className="bg-card border border-destructive/20 rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs text-muted-foreground">Pending Action</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-destructive">{incidents.filter((i) => i.status === "detected").length}</p>
        </div>
        <div className="bg-card border border-warning/20 rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs text-muted-foreground">Escalated</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-warning">{incidents.filter((i) => i.status === "escalated").length}</p>
        </div>
        <div className="bg-card border border-success/20 rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs text-muted-foreground">Documented</p>
          <p className="text-xl md:text-2xl font-bold font-mono text-success">{incidents.filter((i) => i.status === "documented").length}</p>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.map((incident) => {
          const risk = getRiskColor(incident.severity);
          const statusStyles = {
            detected: "bg-destructive/10 text-destructive border-destructive/20",
            documented: "bg-primary/10 text-primary border-primary/20",
            escalated: "bg-warning/10 text-warning border-warning/20",
          };
          return (
            <div key={incident.id} className="bg-card border border-border rounded-xl p-3 md:p-5">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="hidden sm:block">
                  <RiskGauge score={incident.severity} label="" size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-sm font-bold text-foreground">{incident.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${statusStyles[incident.status]}`}>
                      {incident.status.toUpperCase()}
                    </span>
                    {incident.escalationTier && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-mono">
                        {incident.escalationTier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-foreground mb-1">{incident.description}</p>
                  <div className="flex items-center gap-3 md:gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(incident.timestamp).toLocaleString()}</span>
                    <span className="hidden sm:inline">Module: {incident.module}</span>
                    <span>Confidence: {incident.confidence}%</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {incident.status === "detected" ? (
                    <Button size="sm" onClick={() => handleAction(incident)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Zap className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Take </span>Action
                    </Button>
                  ) : (
                    <ExportButton data={getExportData(incident, incident.status === "escalated" ? "escalate" : "document")} />
                  )}
                </div>
              </div>

              {/* Log Evidence */}
              <div className="mt-3 bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs font-semibold text-foreground mb-1">Log Evidence</p>
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{incident.logEvidence}</pre>
              </div>

              {/* Solution */}
              <div className="mt-2 bg-success/5 border border-success/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-3 h-3 text-success" />
                  <p className="text-xs font-semibold text-foreground">Auto-Suggested Solution</p>
                </div>
                <p className="text-xs text-muted-foreground">{incident.solution}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
        {selectedIncident && dialogMode === "choose" && (
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Threat Detected — {selectedIncident.id}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedIncident.description}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-foreground mb-4">How would you like to proceed?</p>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={escalateIncident} className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left">
                <Zap className="w-6 h-6 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">🚨 Escalate Incident</p>
                  <p className="text-xs text-muted-foreground">Generate corporate escalation report with impact assessment, priority tagging, and escalation tier assignment.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
              <button onClick={documentIncident} className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left">
                <FileText className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">📄 Document Only</p>
                  <p className="text-xs text-muted-foreground">Generate standard incident documentation for audit records without escalation.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </div>
          </DialogContent>
        )}

        {selectedIncident && dialogMode === "document" && (
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                Incident Documentation — {selectedIncident.id}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Standard incident documentation generated. Export below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Incident ID:</span><span className="font-mono text-foreground">{selectedIncident.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="text-foreground">{selectedIncident.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Severity:</span><span className={`font-mono font-bold ${getRiskColor(selectedIncident.severity).color}`}>{selectedIncident.severity}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Confidence:</span><span className="font-mono text-foreground">{selectedIncident.confidence}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="text-primary font-semibold">Documented (Not Escalated)</span></div>
              </div>
              <ExportButton data={getExportData(selectedIncident, "document")} />
            </div>
          </DialogContent>
        )}

        {selectedIncident && dialogMode === "escalate" && (() => {
          const impact = getImpactAssessment(selectedIncident.severity, userSeed);
          return (
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="w-5 h-5 text-destructive" />
                  Escalation Report — {selectedIncident.id}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Corporate escalation report with full impact assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Priority:</span><span className="font-mono font-bold text-destructive">{getPriorityCode(selectedIncident.severity)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Escalation Tier:</span><span className="font-mono text-warning">{getEscalationTier(selectedIncident.severity)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="text-warning font-semibold">ESCALATED</span></div>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-destructive" />
                    <p className="text-xs font-semibold text-foreground">Risk Impact Assessment</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Data Breach Probability:</span><span className="font-mono text-destructive">{impact.dataBreachProbability}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Operational Disruption:</span><span className="font-mono text-warning">{impact.operationalDisruption}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Financial Impact:</span><span className="font-mono text-foreground">{impact.financialImpact}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Compliance Risk:</span><span className="font-mono text-foreground">{impact.complianceRisk}</span></div>
                  </div>
                </div>
                <ExportButton data={getExportData(selectedIncident, "escalate")} />
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </AppLayout>
  );
};

export default IncidentReport;
