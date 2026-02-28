import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Bug, Activity } from "lucide-react";

const alertMessages = [
  { type: "Malware", message: "Trojan.Win32.Agent detected on endpoint-07", severity: 92 },
  { type: "Phishing", message: "Suspicious URL blocked from email gateway", severity: 78 },
  { type: "Network", message: "Port scan detected from 203.0.113.88", severity: 65 },
  { type: "Malware", message: "Ransomware signature found in quarantine", severity: 96 },
  { type: "Network", message: "Unusual DNS exfiltration pattern detected", severity: 71 },
  { type: "Phishing", message: "Credential harvesting page identified", severity: 85 },
  { type: "Log", message: "Privilege escalation attempt from guest account", severity: 80 },
];

const severityStyle = (s: number) =>
  s >= 80 ? "destructive" as const : "default" as const;

const RealTimeAlerts = () => {
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const alert = alertMessages[indexRef.current % alertMessages.length];
      toast({
        variant: severityStyle(alert.severity),
        title: `⚠ ${alert.type} Alert — Risk: ${alert.severity}`,
        description: alert.message,
      });
      indexRef.current++;
    }, 12000);

    // Fire one after 3s on mount
    const timeout = setTimeout(() => {
      const alert = alertMessages[0];
      toast({
        variant: severityStyle(alert.severity),
        title: `⚠ ${alert.type} Alert — Risk: ${alert.severity}`,
        description: alert.message,
      });
      indexRef.current = 1;
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return null;
};

export default RealTimeAlerts;
