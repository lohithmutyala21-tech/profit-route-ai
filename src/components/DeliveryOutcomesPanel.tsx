import type { DeliveryOutcome, AnalyzedOrder } from "@/lib/types";

interface DeliveryOutcomesPanelProps {
  outcomes: DeliveryOutcome[];
  orders: AnalyzedOrder[];
}

export function DeliveryOutcomesPanel({ outcomes, orders }: DeliveryOutcomesPanelProps) {
  const delivered = outcomes.filter((o) => o.delivered);
  const failed = outcomes.filter((o) => !o.delivered);
  const actualRevenue = delivered.reduce((s, o) => s + o.actualRevenue, 0);
  const lostRevenue = failed.reduce((s, o) => s + o.lostRevenue, 0);
  const predictedRevenue = orders.reduce((s, o) => s + o.expectedRevenue, 0);
  const accuracy = Math.round((actualRevenue / (predictedRevenue || 1)) * 100);

  return (
    <div className="metric-card p-5 mb-6" style={{ animation: "slideUp 0.4s ease-out" }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">📦 Delivery Day Simulation Results</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg bg-risk-low/10 p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Delivered</p>
          <p className="text-xl font-bold text-risk-low">{delivered.length}</p>
        </div>
        <div className="rounded-lg bg-risk-high/10 p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Failed</p>
          <p className="text-xl font-bold text-risk-high">{failed.length}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Actual Revenue</p>
          <p className="text-xl font-bold text-primary">₹{actualRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-risk-high/10 p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Lost Revenue</p>
          <p className="text-xl font-bold text-risk-high">₹{lostRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
        <span className="text-sm text-muted-foreground">Prediction Accuracy:</span>
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(100, accuracy)}%` }} />
        </div>
        <span className="text-sm font-mono font-bold text-primary">{accuracy}%</span>
      </div>

      <div className="mt-4 max-h-[200px] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {outcomes.map((o) => (
            <div key={o.orderId} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono ${o.delivered ? "bg-risk-low/10 text-risk-low" : "bg-risk-high/10 text-risk-high"}`}>
              <span>{o.delivered ? "✅" : "❌"}</span>
              <span>{o.orderId.replace("ORD-", "#")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
