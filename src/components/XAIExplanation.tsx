import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, BarChart3, AlertTriangle, Shield, Info } from "lucide-react";

interface XAIProps {
  threatType: string;
  severity: number;
  confidence: number;
  features?: { name: string; importance: number; direction: "positive" | "negative" }[];
  reasoning?: string[];
  decisionPath?: string[];
}

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

const XAIExplanation = ({ threatType, severity, confidence, features, reasoning, decisionPath }: XAIProps) => {
  const [expanded, setExpanded] = useState(false);
  const feats = features || defaultFeatures(threatType);
  const reasons = reasoning || defaultReasoning(threatType, severity);
  const path = decisionPath || [
    "Input received → Feature extraction",
    "Signature matching → No exact match",
    "Anomaly detection → Pattern identified",
    "ML classification → Threat confirmed",
    `Confidence: ${confidence}% → Severity: ${severity}`,
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Explanation</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{confidence}% confidence</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* Feature Importance */}
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

          {/* Reasoning */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h4 className="text-sm font-semibold text-foreground">Why This Was Flagged</h4>
            </div>
            <div className="space-y-2">
              {reasons.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-xs text-primary font-mono mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-muted-foreground">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Path */}
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
        </div>
      )}
    </div>
  );
};

export default XAIExplanation;
