interface AIInsightsPanelProps {
  insights: string[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  if (insights.length === 0) return null;

  return (
    <div className="metric-card glow-border p-5 mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">🧠 AI-Generated Insights</h3>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div key={i} className="flex gap-3 rounded-lg bg-surface/80 px-4 py-3 items-start">
            <span className="text-primary mt-0.5 text-sm">💡</span>
            <p className="text-sm text-foreground leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
