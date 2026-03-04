import { useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface AIThreatAnalysisProps {
  threatData: Record<string, any>;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-threat-analysis`;

const AIThreatAnalysis = ({ threatData }: AIThreatAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis("");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: "threat-analysis",
          messages: [
            {
              role: "user",
              content: `Analyze the following threat detection results and provide a comprehensive, beginner-friendly security assessment:\n\n${JSON.stringify(threatData, null, 2)}`,
            },
          ],
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "AI analysis failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAnalysis(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI-Powered Threat Analysis</h3>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate AI Analysis</>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {analysis !== null && (
        <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6">
          <div className="prose prose-sm prose-invert max-w-none [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>p]:text-sm [&>ul]:text-sm [&>ol]:text-sm [&>p]:text-muted-foreground [&>ul]:text-muted-foreground [&>ol]:text-muted-foreground [&>h1]:text-foreground [&>h2]:text-foreground [&>h3]:text-foreground">
            <ReactMarkdown>{analysis || "Generating analysis..."}</ReactMarkdown>
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary mt-3" />}
        </div>
      )}

      {analysis === null && !loading && (
        <p className="text-sm text-muted-foreground">Click "Generate AI Analysis" to get an in-depth, AI-powered assessment of the detected threats with remediation steps.</p>
      )}
    </div>
  );
};

export default AIThreatAnalysis;
