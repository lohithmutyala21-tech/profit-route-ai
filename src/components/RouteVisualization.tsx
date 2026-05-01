import type { AnalyzedOrder } from "@/lib/types";

interface RouteVisualizationProps {
  beforeOrders: AnalyzedOrder[];
  afterOrders: AnalyzedOrder[];
}

function RouteSequence({ orders, label, accent }: { orders: AnalyzedOrder[]; label: string; accent: boolean }) {
  return (
    <div className="metric-card p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{label}</h4>
      <div className="flex flex-wrap gap-1.5 items-center">
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">🏭</div>
        {orders.slice(0, 10).map((o, i) => (
          <div key={o.id} className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <div className={`px-2 py-1 rounded text-[10px] font-mono ${accent ? (o.riskCategory === "low" ? "bg-risk-low/10 text-risk-low" : o.riskCategory === "medium" ? "bg-risk-medium/10 text-risk-medium" : "bg-risk-high/10 text-risk-high") : "bg-secondary text-muted-foreground"}`}>
              {o.id.replace("ORD-", "#")}
            </div>
          </div>
        ))}
        {orders.length > 10 && <span className="text-[10px] text-muted-foreground">+{orders.length - 10} more</span>}
      </div>
    </div>
  );
}

export function RouteVisualization({ beforeOrders, afterOrders }: RouteVisualizationProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">🗺️ Route Sequence</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <RouteSequence orders={beforeOrders} label="Distance-Based Route" accent={false} />
        <RouteSequence orders={afterOrders} label="Profit-Optimized Route" accent={true} />
      </div>
    </div>
  );
}
