import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ExportButton from "@/components/ExportReport";
import RiskGauge from "@/components/RiskGauge";
import { getRiskColor } from "@/components/RiskGauge";
import { FileText, AlertTriangle, Shield, Zap, Clock, Download, ChevronRight, CheckCircle, Brain, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const generateIncidents = (): Incident[] => [
  { id: "INC-2026-0301", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "Malware", severity: 92, confidence: 89, module: "Malware Scanner", description: "Trojan.GenericKD.46542 detected on endpoint-07 with high entropy binary and suspicious API call patterns.", logEvidence: "2026-03-02 08:23:11 [CRITICAL] Signature match: Trojan.GenericKD.46542\n2026-03-02 08:23:12 [WARNING] Suspicious CreateRemoteThread API call\n2026-03-02 08:23:14 [ERROR] File entropy 7.98/8.0 — packed binary", solution: "Isolate endpoint-07. Run offline AV scan. Re-image if persistence found. Patch entry vector.", status: "detected" },
  { id: "INC-2026-0302", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "Phishing", severity: 78, confidence: 82, module: "Phishing Detection", description: "Credential harvesting page at secure-login-update.xyz targeting internal employees.", logEvidence: "2026-03-02 07:15:22 [WARNING] URL blocked: secure-login-update.xyz/login\n2026-03-02 07:15:23 [INFO] Domain age: 2 days\n2026-03-02 07:15:25 [WARNING] Visual similarity to internal portal: 94%", solution: "Block domain network-wide. Force password reset for 3 users who visited. Enable MFA on all accounts.", status: "detected" },
  { id: "INC-2026-0303", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "Network", severity: 95, confidence: 94, module: "Network Anomaly", description: "DNS exfiltration to known C2 domain with data transfer volume of 2.3GB to external IP.", logEvidence: "2026-03-02 05:45:10 [CRITICAL] DNS query to c2.malicious-domain.top\n2026-03-02 05:45:12 [ERROR] Data transfer: 2.3GB outbound\n2026-03-02 05:45:15 [CRITICAL] C2 beacon pattern confirmed", solution: "Block C2 domain. Identify source machine. Full forensic analysis. Check for lateral movement.", status: "detected" },
  { id: "INC-2026-0304", timestamp: new Date(Date.now() - 28800000).toISOString(), type: "Log Anomaly", severity: 68, confidence: 61, module: "Log Analysis", description: "Privilege escalation attempt from guest account at 2:30 AM via sudo exploit.", logEvidence: "2026-03-02 02:30:01 [WARNING] sudo attempt by guest_user\n2026-03-02 02:30:03 [ERROR] Privilege escalation CVE-2024-1234\n2026-03-02 02:30:05 [WARNING] Config file modified: /etc/sudoers", solution: "Disable guest account. Revert sudoers change. Patch CVE-2024-1234. Audit all admin access.", status: "detected" },
];

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

const getImpactAssessment = (severity: number) => ({
  dataBreachProbability: Math.min(95, severity + Math.round(Math.random() * 10)),
  operationalDisruption: Math.min(90, Math.round(severity * 0.8 + Math.random() * 15)),
  financialImpact: severity >= 80 ? "High ($50K–$500K)" : severity >= 60 ? "Medium ($10K–$50K)" : "Low (<$10K)",
  complianceRisk: severity >= 80 ? "Critical — Regulatory notification required" : severity >= 60 ? "Moderate — Internal audit recommended" : "Low — Standard monitoring",
});

const IncidentReport = () => {
  const [incidents, setIncidents] = useState<Incident[]>(generateIncidents);
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
    const impact = getImpactAssessment(incident.severity);
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
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Incident Response Center</h2>
        <p className="text-muted-foreground mt-1">Escalate threats or generate audit-ready documentation</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Incidents</p>
          <p className="text-2xl font-bold font-mono text-foreground">{incidents.length}</p>
        </div>
        <div className="bg-card border border-destructive/20 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Pending Action</p>
          <p className="text-2xl font-bold font-mono text-destructive">{incidents.filter((i) => i.status === "detected").length}</p>
        </div>
        <div className="bg-card border border-warning/20 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Escalated</p>
          <p className="text-2xl font-bold font-mono text-warning">{incidents.filter((i) => i.status === "escalated").length}</p>
        </div>
        <div className="bg-card border border-success/20 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Documented</p>
          <p className="text-2xl font-bold font-mono text-success">{incidents.filter((i) => i.status === "documented").length}</p>
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
            <div key={incident.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-4">
                <RiskGauge score={incident.severity} label="" size="sm" />
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
                  <p className="text-sm text-foreground mb-1">{incident.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(incident.timestamp).toLocaleString()}</span>
                    <span>Module: {incident.module}</span>
                    <span>Confidence: {incident.confidence}%</span>
                  </div>
                </div>
                <div className="shrink-0 flex gap-2">
                  {incident.status === "detected" ? (
                    <Button size="sm" onClick={() => handleAction(incident)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Zap className="w-4 h-4 mr-1" /> Take Action
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
          const impact = getImpactAssessment(selectedIncident.severity);
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
                    <div className="flex justify-between"><span className="text-muted-foreground">Financial Impact:</span><span className="text-foreground">{impact.financialImpact}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Compliance Risk:</span><span className="text-foreground">{impact.complianceRisk}</span></div>
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
