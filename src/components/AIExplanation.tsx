import type { AnalyzedOrder, LearningWeights } from "@/lib/types";
import { getExplanation, getFactorContributions } from "@/lib/engine";

interface AIExplanationProps {
  order: AnalyzedOrder | null;
  weights: LearningWeights;
  allOrders: AnalyzedOrder[];
}

export function AIExplanation({ order, weights, allOrders }: AIExplanationProps) {
  if (!order) {
    return (
      <div className="metric-card p-6 mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">🧠 AI Explanation</h3>
        <p className="text-sm text-muted-foreground italic">Click on any order in the table or heatmap to see the AI-powered analysis.</p>
      </div>
    );
  }

  const explanation = getExplanation(order);
  const factors = getFactorContributions(order, weights, allOrders);
  const riskCls = order.riskCategory === "low" ? "risk-badge-low" : order.riskCategory === "medium" ? "risk-badge-medium" : "risk-badge-high";
  const confCls = order.confidenceLevel === "High" ? "text-risk-low" : order.confidenceLevel === "Medium" ? "text-risk-medium" : "text-risk-high";

  const FactorBar = ({ label, value, positive }: { label: string; value: number; positive: boolean }) => (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono font-bold w-16 text-right ${positive ? "text-risk-low" : "text-risk-high"}`}>
        {positive ? "+" : ""}{value.toFixed(3)}
      </span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.abs(value) * 200)}%`,
            backgroundColor: positive ? "var(--risk-low)" : "var(--risk-high)",
          }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-28">{label}</span>
    </div>
  );

  return (
    <div className="metric-card glow-border p-6 mb-6" style={{ animation: "slideUp 0.3s ease-out" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">🧠 AI Explanation — Factor Contribution</h3>
        <div className="flex items-center gap-2">
          <span className={`${riskCls} px-2 py-0.5 rounded-full text-xs font-medium`}>
            {order.riskCategory.toUpperCase()} RISK
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-surface border border-border ${confCls}`} title={`Confidence: ${order.confidenceScore}%`}>
            {order.confidenceLevel} Conf.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-lg font-bold text-primary">{order.id}</span>
        <span className="text-sm text-muted-foreground">→ {order.location}</span>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-4">{explanation}</p>

      <div className="mb-4 p-3 rounded-lg bg-surface/80">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Why this order is prioritized</p>
        <div className="space-y-2">
          <FactorBar label="Payment reliability" value={factors.successContribution} positive={true} />
          <FactorBar label="Order value impact" value={factors.valueContribution} positive={true} />
          <FactorBar label="Distance penalty" value={factors.distancePenalty} positive={false} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Success Prob.", value: `${Math.round(order.successProbability * 100)}%` },
          { label: "Priority Score", value: order.priorityScore.toFixed(3) },
          { label: "Expected Profit", value: `₹${order.expectedProfit}` },
          { label: "Confidence", value: `${order.confidenceScore}%` },
        ].map((m) => (
          <div key={m.label} className="rounded-md bg-surface px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className="text-sm font-mono font-semibold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
