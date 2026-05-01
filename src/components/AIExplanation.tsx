import type { AnalyzedOrder } from "@/lib/types";
import { getExplanation } from "@/lib/engine";

interface AIExplanationProps {
  order: AnalyzedOrder | null;
}

export function AIExplanation({ order }: AIExplanationProps) {
  if (!order) {
    return (
      <div className="metric-card p-6 mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">🧠 AI Explanation</h3>
        <p className="text-sm text-muted-foreground italic">Click on any order in the table to see the AI-powered analysis.</p>
      </div>
    );
  }

  const explanation = getExplanation(order);
  const riskCls = order.riskCategory === "low" ? "risk-badge-low" : order.riskCategory === "medium" ? "risk-badge-medium" : "risk-badge-high";

  return (
    <div className="metric-card glow-border p-6 mb-6" style={{ animation: "slideUp 0.3s ease-out" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">🧠 AI Explanation</h3>
        <span className={`${riskCls} px-2 py-0.5 rounded-full text-xs font-medium`}>
          {order.riskCategory.toUpperCase()} RISK
        </span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-lg font-bold text-primary">{order.id}</span>
        <span className="text-sm text-muted-foreground">→ {order.location}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-4">{explanation}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Success Prob.", value: `${Math.round(order.successProbability * 100)}%` },
          { label: "Priority Score", value: order.priorityScore.toFixed(3) },
          { label: "Order Value", value: `₹${order.orderValue}` },
          { label: "Distance", value: `${order.distance} km` },
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
