import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, ScanLine } from "lucide-react";
import RiskGauge from "./RiskGauge";
import { toast } from "@/hooks/use-toast";

interface ModuleScore {
  module: string;
  score: number;
}

const OverallRiskScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ModuleScore[] | null>(null);

  const handleFullScan = () => {
    setScanning(true);
    setResults(null);

    setTimeout(() => {
      const scores: ModuleScore[] = [
        { module: "Malware", score: Math.floor(Math.random() * 40) + 50 },
        { module: "Phishing", score: Math.floor(Math.random() * 50) + 30 },
        { module: "Network", score: Math.floor(Math.random() * 60) + 20 },
        { module: "Logs", score: Math.floor(Math.random() * 45) + 35 },
      ];
      setResults(scores);
      setScanning(false);

      const overall = Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length);
      toast({
        title: "Full System Scan Complete",
        description: `Overall risk score: ${overall}/100`,
        variant: overall >= 70 ? "destructive" : "default",
      });
    }, 4000);
  };

  const overall = results
    ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
    : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Full System Risk Scan</h3>
        </div>
        <Button
          onClick={handleFullScan}
          disabled={scanning}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning All Modules...
            </>
          ) : (
            <>
              <ScanLine className="w-4 h-4 mr-2" />
              Run Full Scan
            </>
          )}
        </Button>
      </div>

      {scanning && (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <Shield className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
      )}

      {results && (
        <div className="flex items-center justify-around flex-wrap gap-6 pt-4">
          <RiskGauge score={overall} label="Overall Risk" size="lg" />
          {results.map((r) => (
            <RiskGauge key={r.module} score={r.score} label={r.module} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OverallRiskScanner;
