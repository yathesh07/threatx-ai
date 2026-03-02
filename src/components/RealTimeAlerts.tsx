import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Shield, Lightbulb, CheckCircle } from "lucide-react";

interface AlertData {
  type: string;
  message: string;
  severity: number;
  steps: string[];
  beginnerTip: string;
}

const alertMessages: AlertData[] = [
  {
    type: "Malware", message: "Trojan.Win32.Agent detected on endpoint-07", severity: 92,
    steps: ["Disconnect the affected computer from the network", "Run a full antivirus scan in Safe Mode", "Delete or quarantine the detected file", "Update your antivirus and scan again", "Monitor the system for 24 hours"],
    beginnerTip: "A trojan is a harmful program disguised as something safe. Disconnecting from the network stops it from spreading or stealing your data.",
  },
  {
    type: "Phishing", message: "Suspicious URL blocked from email gateway", severity: 78,
    steps: ["Do NOT click any links in the suspicious email", "Report the email as phishing in your email client", "Delete the email from your inbox and trash", "If you clicked: change your password immediately", "Enable two-factor authentication on affected accounts"],
    beginnerTip: "Phishing emails try to trick you into clicking fake links. Think of it like a stranger pretending to be your bank. Always verify before clicking!",
  },
  {
    type: "Network", message: "Port scan detected from 203.0.113.88", severity: 65,
    steps: ["Block the suspicious IP address in your firewall", "Check which ports were scanned", "Review your open ports and close unnecessary ones", "Enable intrusion detection alerts", "Monitor network traffic for follow-up attempts"],
    beginnerTip: "A port scan is like someone checking all the doors and windows of your house to find one that's unlocked. Blocking them keeps your network safe.",
  },
  {
    type: "Malware", message: "Ransomware signature found in quarantine", severity: 96,
    steps: ["DO NOT pay any ransom demand", "Isolate affected systems immediately", "Restore from clean backups if available", "Report to your IT security team", "Run deep scan on all connected systems"],
    beginnerTip: "Ransomware locks your files and demands payment. Never pay — it doesn't guarantee your files back. Use backups to restore your data safely.",
  },
  {
    type: "Network", message: "Unusual DNS exfiltration pattern detected", severity: 71,
    steps: ["Block suspicious DNS queries at your firewall", "Review DNS logs for affected machines", "Enable DNS-over-HTTPS for security", "Check for malware that may be leaking data", "Update DNS filtering rules"],
    beginnerTip: "DNS exfiltration means someone might be secretly sending your data out through normal-looking internet requests. Blocking suspicious DNS stops this.",
  },
  {
    type: "Phishing", message: "Credential harvesting page identified", severity: 85,
    steps: ["Block the fake website across your network", "Identify any users who visited the page", "Force password resets for affected accounts", "Enable MFA on all user accounts", "Alert your team about this phishing campaign"],
    beginnerTip: "A credential harvesting page is a fake login page designed to steal your username and password. If you entered info, change your password right away!",
  },
  {
    type: "Log", message: "Privilege escalation attempt from guest account", severity: 80,
    steps: ["Disable the compromised guest account", "Review all admin access logs", "Audit user permissions and remove unnecessary access", "Enable alerts for permission changes", "Implement the principle of least privilege"],
    beginnerTip: "Privilege escalation is when someone tries to gain admin powers they shouldn't have — like a guest trying to get a master key. We need to lock them out.",
  },
];

const RealTimeAlerts = () => {
  const indexRef = useRef(0);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const showAlert = (alert: AlertData) => {
    toast({
      variant: alert.severity >= 80 ? "destructive" : "default",
      title: `⚠ ${alert.type} Alert — Risk: ${alert.severity}`,
      description: (
        <div>
          <p>{alert.message}</p>
          <button
            onClick={() => setSelectedAlert(alert)}
            className="mt-2 text-xs underline opacity-80 hover:opacity-100"
          >
            Click here for solution steps →
          </button>
        </div>
      ),
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const alert = alertMessages[indexRef.current % alertMessages.length];
      showAlert(alert);
      indexRef.current++;
    }, 15000);

    const timeout = setTimeout(() => {
      showAlert(alertMessages[0]);
      indexRef.current = 1;
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        {selectedAlert && (
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {selectedAlert.type} Alert — How to Fix
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedAlert.message}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Beginner Tip */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Beginner Explanation</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedAlert.beginnerTip}</p>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-foreground">Steps to Resolve</span>
                </div>
                <div className="space-y-2">
                  {selectedAlert.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default RealTimeAlerts;
