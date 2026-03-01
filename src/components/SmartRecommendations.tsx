import { useState } from "react";
import { Lightbulb, ChevronRight, CheckCircle, AlertTriangle, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  steps: string[];
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  beginnerTip?: string;
}

const generateRecommendations = (riskLevel: number, threatTypes: string[]): Recommendation[] => {
  const recs: Recommendation[] = [];

  if (riskLevel > 70 || threatTypes.includes("malware")) {
    recs.push({
      id: "1",
      title: "Isolate Infected Systems",
      description: "Disconnect compromised machines from the network to prevent lateral movement.",
      steps: [
        "Identify affected machines from scan results",
        "Disable network adapters or unplug cables",
        "Run full offline antivirus scan",
        "Check for persistence mechanisms",
        "Re-image system if deeply compromised",
      ],
      priority: "critical",
      category: "Malware Response",
      beginnerTip: "Think of this like quarantining a sick person — you separate the infected computer from healthy ones so the virus can't spread.",
    });
  }

  if (threatTypes.includes("phishing")) {
    recs.push({
      id: "2",
      title: "Block Phishing Domains",
      description: "Add identified phishing domains to your organization's blocklist.",
      steps: [
        "Collect all flagged URLs from phishing scan",
        "Add domains to DNS sinkhole or firewall rules",
        "Notify users who may have visited these URLs",
        "Force password reset for potentially affected accounts",
      ],
      priority: "high",
      category: "Phishing Defense",
      beginnerTip: "Phishing is when attackers create fake websites that look real to steal your passwords. Blocking these sites prevents anyone from accidentally visiting them.",
    });
  }

  if (riskLevel > 40) {
    recs.push({
      id: "3",
      title: "Enable Multi-Factor Authentication",
      description: "Add an extra layer of security to prevent unauthorized access even if passwords are compromised.",
      steps: [
        "Audit which accounts lack MFA",
        "Deploy authenticator app-based MFA",
        "Set up backup recovery codes",
        "Test MFA flow end-to-end",
      ],
      priority: "high",
      category: "Access Security",
      beginnerTip: "MFA is like having two locks on your door. Even if someone steals your key (password), they still can't get in without the second lock (your phone code).",
    });
  }

  recs.push({
    id: "4",
    title: "Update Security Patches",
    description: "Apply latest security patches to close known vulnerabilities.",
    steps: [
      "Check for pending OS updates",
      "Update all installed software",
      "Verify firewall rules are current",
      "Review application permissions",
    ],
    priority: riskLevel > 60 ? "high" : "medium",
    category: "Prevention",
    beginnerTip: "Software updates often fix security holes. Keeping everything updated is one of the easiest ways to stay protected.",
  });

  return recs;
};

const priorityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-success/10 text-success border-success/30",
};

const SmartRecommendations = ({ riskLevel = 50, threatTypes = ["malware"] }: { riskLevel?: number; threatTypes?: string[] }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBeginner, setShowBeginner] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean[]>>({});

  const recommendations = generateRecommendations(riskLevel, threatTypes);

  const toggleStep = (recId: string, stepIdx: number) => {
    setCompletedSteps((prev) => {
      const steps = prev[recId] || [];
      const copy = [...steps];
      copy[stepIdx] = !copy[stepIdx];
      return { ...prev, [recId]: copy };
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Smart Recommendations</h3>
        </div>
        <Button
          size="sm"
          variant={showBeginner ? "default" : "outline"}
          onClick={() => setShowBeginner(!showBeginner)}
          className={showBeginner ? "bg-primary text-primary-foreground" : "border-primary/30 text-primary"}
        >
          <BookOpen className="w-4 h-4 mr-1" />
          {showBeginner ? "Beginner Mode ON" : "Beginner Mode"}
        </Button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          const isExpanded = expandedId === rec.id;
          const steps = completedSteps[rec.id] || [];
          const completedCount = steps.filter(Boolean).length;

          return (
            <div key={rec.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
              >
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{rec.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${priorityStyles[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.category}</p>
                </div>
                {completedCount > 0 && (
                  <span className="text-xs text-success font-mono">{completedCount}/{rec.steps.length}</span>
                )}
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{rec.description}</p>

                  {showBeginner && rec.beginnerTip && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-2">
                      <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-primary">{rec.beginnerTip}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Step-by-step guide:</p>
                    {rec.steps.map((step, i) => (
                      <button
                        key={i}
                        onClick={() => toggleStep(rec.id, i)}
                        className="flex items-center gap-2 w-full text-left hover:bg-secondary/30 rounded p-1.5 transition-colors"
                      >
                        {steps[i] ? (
                          <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground shrink-0" />
                        )}
                        <span className={`text-sm ${steps[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {step}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartRecommendations;
