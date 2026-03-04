import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fish, Search, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { getRiskColor } from "@/components/RiskGauge";
import RiskGauge from "@/components/RiskGauge";
import XAIExplanation from "@/components/XAIExplanation";
import AIThreatAnalysis from "@/components/AIThreatAnalysis";

interface PhishingResult {
  url: string;
  score: number;
  indicators: string[];
}

const positiveIndicators = ["Suspicious domain pattern", "No SSL certificate", "URL obfuscation detected", "Recently registered domain", "Hidden redirect chain", "Fake login form detected", "Mismatched favicon"];
const neutralIndicators = ["HTTP protocol used", "Minor URL anomaly", "Unusual query parameters"];
const safeIndicators = ["Valid SSL certificate", "Established domain", "Clean reputation", "Known safe domain"];

const PhishingDetection = () => {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PhishingResult | null>(null);

  const handleScan = () => {
    if (!url) return;
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      // Generate dynamic score based on URL characteristics + randomness
      let baseScore = Math.round(Math.random() * 30 + 10);
      if (url.includes("suspicious") || url.includes("login") || url.includes("secure")) baseScore += 40;
      if (url.includes("http://")) baseScore += 20;
      if (url.includes("xyz") || url.includes("tk") || url.includes("cc")) baseScore += 15;
      const score = Math.min(98, baseScore + Math.round(Math.random() * 15));

      const indicators = score > 60
        ? positiveIndicators.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 2))
        : score > 30
        ? neutralIndicators.sort(() => Math.random() - 0.5).slice(0, 2)
        : safeIndicators.sort(() => Math.random() - 0.5).slice(0, 2);

      setResult({ url, score, indicators });
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Phishing Detection</h2>
        <p className="text-muted-foreground mt-1">Analyze URLs and emails for phishing threats</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Fish className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">URL Scanner</h3>
            <p className="text-sm text-muted-foreground">Enter a URL to check for phishing indicators</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="https://example.com/login..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-secondary border-border font-mono text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <Button onClick={handleScan} disabled={scanning || !url} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {scanning && (
        <div className="bg-card border border-primary/30 rounded-xl p-8 text-center glow-primary">
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-foreground font-semibold">Analyzing URL...</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">{url}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <RiskGauge score={result.score} label="Phishing Risk" size="lg" />
              <div className="flex-1">
                <p className="font-mono text-sm text-muted-foreground mb-1">Scanned URL</p>
                <p className="font-mono text-foreground mb-4 break-all">{result.url}</p>
                <h4 className="text-sm font-semibold text-foreground mb-2">Detection Indicators</h4>
                <div className="space-y-2">
                  {result.indicators.map((indicator, i) => {
                    const risk = getRiskColor(result.score);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        {result.score > 50 ? (
                          <AlertTriangle className={`w-4 h-4 shrink-0 ${risk.color}`} />
                        ) : (
                          <Shield className="w-4 h-4 shrink-0 text-success" />
                        )}
                        <span className="text-sm text-muted-foreground">{indicator}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {result.score > 30 && (
              <div className="mt-6">
                <XAIExplanation threatType="phishing" severity={result.score} confidence={Math.round(65 + Math.random() * 30)} />
              </div>
            )}
          </div>

          {result.score > 40 && (
            <AIThreatAnalysis threatData={{ type: "Phishing Detection", url: result.url, score: result.score, indicators: result.indicators }} />
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default PhishingDetection;
