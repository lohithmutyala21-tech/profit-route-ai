import type { AnalyzedOrder } from "@/lib/types";

interface RouteVisualizationProps {
  beforeOrders: AnalyzedOrder[];
  afterOrders: AnalyzedOrder[];
}

export function RouteVisualization({ beforeOrders, afterOrders }: RouteVisualizationProps) {
  // Build position map for animation
  const beforeIds = beforeOrders.slice(0, 12).map((o) => o.id);
  const afterIds = afterOrders.slice(0, 12).map((o) => o.id);

  const positionChange = (id: string) => {
    const beforeIdx = beforeIds.indexOf(id);
    const afterIdx = afterIds.indexOf(id);
    if (beforeIdx === -1 || afterIdx === -1) return 0;
    return beforeIdx - afterIdx; // positive = moved up
  };

  const OrderNode = ({ order, accent, showChange }: { order: AnalyzedOrder; accent: boolean; showChange: boolean }) => {
    const change = positionChange(order.id);
    const bg = accent
      ? order.riskCategory === "low"
        ? "bg-risk-low/15 border-risk-low/40 text-risk-low"
        : order.riskCategory === "medium"
          ? "bg-risk-medium/15 border-risk-medium/40 text-risk-medium"
          : "bg-risk-high/15 border-risk-high/40 text-risk-high"
      : "bg-secondary border-border text-muted-foreground";

    return (
      <div className={`${bg} border rounded-md px-2 py-1.5 text-[10px] font-mono flex items-center gap-1 transition-all duration-500`}>
        <span className="font-bold">{order.id.replace("ORD-", "#")}</span>
        {showChange && change !== 0 && (
          <span className={`text-[9px] font-bold ${change > 0 ? "text-risk-low" : "text-risk-high"}`}>
            {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">🧭 Dynamic Route Optimization</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="metric-card p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Distance-Based Route</h4>
          <div className="flex flex-wrap gap-1.5 items-center">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">🏭</div>
            {beforeOrders.slice(0, 12).map((o, i) => (
              <div key={o.id} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <OrderNode order={o} accent={false} showChange={false} />
              </div>
            ))}
            {beforeOrders.length > 12 && <span className="text-[10px] text-muted-foreground">+{beforeOrders.length - 12} more</span>}
          </div>
        </div>
        <div className="metric-card glow-border p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Profit-Optimized Route</h4>
          <div className="flex flex-wrap gap-1.5 items-center">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">🏭</div>
            {afterOrders.slice(0, 12).map((o, i) => (
              <div key={o.id} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <OrderNode order={o} accent={true} showChange={true} />
              </div>
            ))}
            {afterOrders.length > 12 && <span className="text-[10px] text-muted-foreground">+{afterOrders.length - 12} more</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
