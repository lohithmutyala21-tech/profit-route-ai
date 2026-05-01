import type { LearningWeights } from "@/lib/types";

interface LearningStatusPanelProps {
  weights: LearningWeights;
  isLearning: boolean;
}

export function LearningStatusPanel({ weights, isLearning }: LearningStatusPanelProps) {
  const latest = weights.history[weights.history.length - 1];
  const prev = weights.history.length > 1 ? weights.history[weights.history.length - 2] : null;

  const delta = (curr: number, old: number | undefined) => {
    if (old === undefined) return null;
    const d = curr - old;
    if (Math.abs(d) < 0.001) return null;
    return d;
  };

  const WeightBar = ({ label, value, change, color }: { label: string; value: number; change: number | null; color: string }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-foreground">{value.toFixed(3)}</span>
          {change !== null && (
            <span className={`text-[10px] font-mono font-bold ${change > 0 ? "text-risk-low" : "text-risk-high"}`}>
              {change > 0 ? "↑" : "↓"}{Math.abs(change).toFixed(3)}
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );

  return (
    <div className="metric-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">🧠 Adaptive Learning Engine</h3>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isLearning ? "bg-risk-low animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {isLearning ? "Learning Active" : "Standby"}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <WeightBar label="Success Probability" value={latest.success} change={prev ? delta(latest.success, prev.success) : null} color="var(--primary)" />
        <WeightBar label="Order Value" value={latest.value} change={prev ? delta(latest.value, prev.value) : null} color="var(--risk-low)" />
        <WeightBar label="Distance Penalty" value={latest.distance} change={prev ? delta(latest.distance, prev.distance) : null} color="var(--risk-medium)" />
      </div>

      {weights.history.length > 1 && (
        <div className="border-t border-border/50 pt-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Weight Evolution ({weights.history.length} iterations)</p>
          <div className="flex items-end gap-0.5 h-8">
            {weights.history.slice(-20).map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-px">
                <div className="rounded-t-sm" style={{ height: `${h.success * 30}px`, backgroundColor: "var(--primary)", opacity: 0.7 }} />
                <div className="rounded-b-sm" style={{ height: `${h.value * 30}px`, backgroundColor: "var(--risk-low)", opacity: 0.7 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-3 italic">
        System is learning from delivery outcomes — weights adjust automatically based on COD failure rates and high-value order success.
      </p>
    </div>
  );
}
