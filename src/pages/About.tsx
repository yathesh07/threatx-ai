import AppLayout from "@/components/AppLayout";
import { Shield, Bug, Fish, Activity, FileText, ClipboardList, Zap, Brain, MessageSquare, Filter, TrendingUp, Download, BarChart3, Lock } from "lucide-react";

const features = [
  { icon: Shield, title: "Unified Risk Assessment", description: "A single consolidated risk dashboard that aggregates scores from malware, phishing, network anomaly, and log analysis modules. Risk values only update when you run a scan — no phantom changes." },
  { icon: Bug, title: "Malware Scanning", description: "AI-powered malware detection engine that analyzes file signatures, behavioral patterns, and entropy levels. Results persist across sessions and page navigations." },
  { icon: Fish, title: "Phishing Detection", description: "Intelligent phishing URL and email analysis using domain age verification, visual similarity scoring, and known threat database matching." },
  { icon: Activity, title: "Network Anomaly Detection", description: "Real-time network traffic analysis identifying unusual data flows, DNS exfiltration, C2 beacon patterns, and lateral movement indicators." },
  { icon: FileText, title: "Log Analysis", description: "Automated log parsing and anomaly detection across system, authentication, and application logs. Identifies privilege escalation, brute-force attempts, and suspicious patterns." },
  { icon: Brain, title: "AI Threat Analysis", description: "Powered by advanced AI models, get deep-dive threat assessments with explainable AI (XAI) breakdowns showing exactly why a threat was flagged." },
  { icon: MessageSquare, title: "Security Assistant Chatbot", description: "An AI-powered security chatbot that answers your cybersecurity questions, provides remediation guidance, and explains threat intelligence in plain language." },
  { icon: Filter, title: "Intelligent Alert Filtering", description: "Smart false-positive reduction engine that classifies alerts as confirmed threats, false alarms, or needs-review. Confirmed threats include step-by-step remediation guides." },
  { icon: TrendingUp, title: "Predictive Threat Engine", description: "Machine learning-based prediction of future attack probability and likely attack vectors based on historical scan data and current threat landscape." },
  { icon: ClipboardList, title: "Threat Logging", description: "Comprehensive threat detection history with severity tracking, confidence scoring, and resolution status management." },
  { icon: Zap, title: "Incident Response Center", description: "Full incident lifecycle management — from detection to documentation to corporate escalation with impact assessments, priority tagging, and tier-based routing." },
  { icon: Download, title: "PDF & Visual Reports", description: "Export scan results and incident reports as PDF documents with embedded visualizations — severity bar charts, pie charts, and detailed data tables." },
  { icon: BarChart3, title: "Real-Time Dashboard Stats", description: "Live dashboard showing total scans, threats detected, malware count, phishing attempts, and risk trend analysis. All stats sync with your scan history." },
  { icon: Lock, title: "Enterprise-Grade Security", description: "Row-level security on all data, encrypted sessions, role-based access control, and secure authentication — your data never leaves your account boundary." },
];

const About = () => (
  <AppLayout>
    <div className="mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">About ThreatX AI</h2>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">Comprehensive AI-powered cybersecurity platform</p>
    </div>

    {/* Hero */}
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">ThreatX AI v2.0</h3>
          <p className="text-xs text-muted-foreground font-mono">Next-generation threat intelligence platform</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
        ThreatX AI is an all-in-one cybersecurity dashboard that combines real-time threat detection, AI-powered analysis, predictive intelligence, and automated incident response. Built for security analysts, SOC teams, and organizations that demand proactive threat management with explainable AI insights.
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((f) => (
        <div key={f.title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{f.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Tech Stack */}
    <div className="bg-card border border-border rounded-xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Technology Stack</h3>
      <div className="flex flex-wrap gap-2">
        {["React", "TypeScript", "Tailwind CSS", "Recharts", "jsPDF", "AI/ML Models", "Edge Functions", "Real-Time Database", "Row-Level Security"].map((t) => (
          <span key={t} className="text-xs font-mono px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground">{t}</span>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default About;
