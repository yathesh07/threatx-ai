import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, BarChart3, AlertTriangle, Shield, Info, BookOpen, GraduationCap, HelpCircle, CheckCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface XAIProps {
  threatType: string;
  severity: number;
  confidence: number;
  features?: { name: string; importance: number; direction: "positive" | "negative" }[];
  reasoning?: string[];
  decisionPath?: string[];
  solution?: string;
}

type ExplanationLevel = "basic" | "intermediate" | "advanced";

const defaultFeatures = (type: string): XAIProps["features"] => {
  if (type === "malware") return [
    { name: "File entropy", importance: 0.85, direction: "positive" },
    { name: "API call pattern", importance: 0.72, direction: "positive" },
    { name: "Code obfuscation level", importance: 0.68, direction: "positive" },
    { name: "Digital signature", importance: 0.45, direction: "negative" },
    { name: "File size anomaly", importance: 0.33, direction: "positive" },
  ];
  if (type === "phishing") return [
    { name: "Domain age", importance: 0.91, direction: "positive" },
    { name: "URL obfuscation", importance: 0.78, direction: "positive" },
    { name: "SSL certificate", importance: 0.65, direction: "negative" },
    { name: "Visual similarity", importance: 0.58, direction: "positive" },
    { name: "Redirect chain length", importance: 0.42, direction: "positive" },
  ];
  return [
    { name: "Traffic volume spike", importance: 0.88, direction: "positive" },
    { name: "Port scan activity", importance: 0.74, direction: "positive" },
    { name: "Protocol anomaly", importance: 0.61, direction: "positive" },
    { name: "Known IP reputation", importance: 0.53, direction: "negative" },
    { name: "Time-of-day pattern", importance: 0.37, direction: "positive" },
  ];
};

const defaultReasoning = (type: string, severity: number): string[] => {
  const base = [
    `The ${type} detection model identified this threat with high confidence based on multiple correlated indicators.`,
    `Primary detection was triggered by anomalous patterns matching known ${type} signatures in our threat database.`,
    `Behavioral analysis confirmed suspicious characteristics consistent with active ${type} campaigns.`,
  ];
  if (severity > 70) base.push("Severity elevated due to correlation with recently reported zero-day exploits.");
  return base;
};

const getSolution = (type: string, severity: number): string => {
  if (type === "malware") {
    if (severity > 80) return "Immediately isolate the infected endpoint from the network. Run a full offline antivirus scan. If the threat persists, re-image the system from a clean backup. Update all security patches and review endpoint protection policies.";
    return "Quarantine the suspicious file and run a targeted scan. Update your antivirus definitions. Monitor the system for unusual behavior over the next 24 hours.";
  }
  if (type === "phishing") {
    if (severity > 80) return "Block this URL across your entire network immediately. Reset passwords for any users who may have visited it. Enable MFA on all affected accounts. Report the domain to your threat intelligence provider.";
    return "Add this URL to your blocklist. Warn users about this phishing attempt via email. Review email gateway filters and tighten URL scanning rules.";
  }
  if (severity > 70) return "Investigate the anomalous traffic source. Block the suspicious IP at your firewall. Review network segmentation to limit lateral movement. Enable enhanced logging for the affected subnet.";
  return "Monitor the flagged activity for the next 48 hours. Ensure IDS/IPS signatures are up to date. Review firewall rules for the affected ports.";
};

const getBasicExplanation = (type: string, severity: number): string => {
  if (type === "malware") return severity > 70
    ? "🚨 A dangerous program was found that could harm your computer. Think of it like a virus that makes your computer sick. We need to remove it right away!"
    : "⚠️ We found a file that looks a bit suspicious — like a stranger knocking on your door. It might be harmless, but we should check it carefully.";
  if (type === "phishing") return severity > 70
    ? "🚨 This website is trying to trick you into giving away your password! It's like a fake bank pretending to be your real bank. Never enter your details here!"
    : "⚠️ This website looks a little fishy (pun intended). It might be trying to trick you, so be careful before clicking anything on it.";
  return severity > 70
    ? "🚨 Something unusual is happening on your network — like someone trying to peek through your windows. We need to investigate immediately!"
    : "⚠️ We noticed some strange network activity. It's probably nothing serious, but we're keeping an eye on it just in case.";
};

const getIntermediateExplanation = (type: string, severity: number): string => {
  if (type === "malware") return `This file exhibits characteristics of ${severity > 80 ? "an active threat" : "potentially unwanted software"}. The detection engine analyzed its code structure, API calls, and behavioral patterns. File entropy is unusually high, suggesting packed or encrypted content commonly used to evade detection.`;
  if (type === "phishing") return `This URL shows ${severity > 80 ? "strong" : "moderate"} indicators of a phishing attempt. The domain was recently registered, uses URL obfuscation techniques, and ${severity > 80 ? "closely mimics a legitimate website" : "has some suspicious characteristics"}. The page structure matches known phishing templates.`;
  return `Network traffic analysis reveals ${severity > 80 ? "highly suspicious" : "unusual"} patterns. ${severity > 80 ? "Multiple indicators suggest active reconnaissance or data exfiltration" : "Some anomalies detected that warrant further investigation"}. Traffic volume and port activity deviate from your baseline.`;
};

const getQuizQuestion = (type: string): { question: string; options: string[]; correct: number; explanation: string } => {
  if (type === "malware") return {
    question: "What should you do FIRST when malware is detected on your computer?",
    options: ["Delete all your files", "Disconnect from the network", "Ignore it", "Share the file with others"],
    correct: 1,
    explanation: "Disconnecting from the network prevents the malware from spreading to other computers or sending your data to attackers.",
  };
  if (type === "phishing") return {
    question: "How can you best identify a phishing website?",
    options: ["It has colorful graphics", "Check if the URL matches the real website", "It loads quickly", "It asks for your name"],
    correct: 1,
    explanation: "Phishing sites often use URLs that look similar to real ones but have small differences like misspellings or extra characters.",
  };
  return {
    question: "What is a port scan used for?",
    options: ["To speed up your internet", "To find open entry points on a network", "To download files faster", "To update your software"],
    correct: 1,
    explanation: "Attackers use port scans to discover which services are running on your network, looking for vulnerabilities they can exploit.",
  };
};

const XAIExplanation = ({ threatType, severity, confidence, features, reasoning, decisionPath, solution }: XAIProps) => {
  const [expanded, setExpanded] = useState(false);
  const [level, setLevel] = useState<ExplanationLevel>("basic");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [learningScore, setLearningScore] = useState(() => {
    const stored = localStorage.getItem("xai_learning_score");
    return stored ? parseInt(stored) : 0;
  });

  const feats = features || defaultFeatures(threatType);
  const reasons = reasoning || defaultReasoning(threatType, severity);
  const path = decisionPath || [
    "Input received → Feature extraction",
    "Signature matching → No exact match",
    "Anomaly detection → Pattern identified",
    "ML classification → Threat confirmed",
    `Confidence: ${confidence}% → Severity: ${severity}`,
  ];
  const autoSolution = solution || getSolution(threatType, severity);
  const quiz = getQuizQuestion(threatType);

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === quiz.correct) {
      const newScore = learningScore + 10;
      setLearningScore(newScore);
      localStorage.setItem("xai_learning_score", newScore.toString());
    }
  };

  const levelLabels: Record<ExplanationLevel, string> = { basic: "🟢 Basic", intermediate: "🟡 Intermediate", advanced: "🔴 Advanced" };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Explanation & Solution</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{confidence}% confidence</span>
          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-mono">🎓 {learningScore} pts</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* Explanation Level Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground mr-2">Explanation Level:</span>
            {(["basic", "intermediate", "advanced"] as ExplanationLevel[]).map((l) => (
              <Button
                key={l}
                size="sm"
                variant={level === l ? "default" : "outline"}
                onClick={() => setLevel(l)}
                className={`text-xs h-7 ${level === l ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
              >
                {levelLabels[l]}
              </Button>
            ))}
          </div>

          {/* Level-based explanation */}
          <div className="bg-secondary/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">What's Happening ({levelLabels[level]})</h4>
            </div>
            {level === "basic" && (
              <p className="text-sm text-muted-foreground leading-relaxed">{getBasicExplanation(threatType, severity)}</p>
            )}
            {level === "intermediate" && (
              <p className="text-sm text-muted-foreground leading-relaxed">{getIntermediateExplanation(threatType, severity)}</p>
            )}
            {level === "advanced" && (
              <div className="space-y-2">
                {reasons.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-xs text-primary font-mono mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-muted-foreground">{r}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto Solution */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-success" />
              <h4 className="text-sm font-semibold text-foreground">Recommended Solution</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{autoSolution}</p>
          </div>

          {/* Feature Importance (intermediate + advanced) */}
          {level !== "basic" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Feature Importance (SHAP-style)</h4>
              </div>
              <div className="space-y-2">
                {feats!.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-40 truncate">{f.name}</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${f.importance * 100}%`,
                          background: f.direction === "positive" ? "hsl(var(--destructive))" : "hsl(var(--success))",
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                      {f.direction === "positive" ? "+" : "-"}{(f.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Red bars increase threat score, green bars decrease it
              </p>
            </div>
          )}

          {/* Decision Path (advanced only) */}
          {level === "advanced" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold text-foreground">Decision Logic Path</h4>
              </div>
              <div className="relative pl-4 border-l-2 border-primary/30 space-y-2">
                {path.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="absolute left-[-5px] w-2 h-2 rounded-full bg-primary" />
                    <p className="text-xs font-mono text-muted-foreground ml-2">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Quiz */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Quick Security Quiz</h4>
            </div>
            <p className="text-sm text-foreground mb-3">{quiz.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quiz.options.map((opt, i) => {
                let btnClass = "border-border text-muted-foreground hover:bg-secondary/50";
                if (quizAnswer !== null) {
                  if (i === quiz.correct) btnClass = "border-success/50 bg-success/10 text-success";
                  else if (i === quizAnswer) btnClass = "border-destructive/50 bg-destructive/10 text-destructive";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    disabled={quizAnswer !== null}
                    className={`text-left text-xs p-2.5 rounded-lg border transition-colors ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {quizAnswer !== null && (
              <div className="mt-3 flex items-start gap-2">
                {quizAnswer === quiz.correct ? (
                  <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                )}
                <p className="text-xs text-muted-foreground">{quiz.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default XAIExplanation;
