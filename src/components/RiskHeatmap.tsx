import type { AnalyzedOrder } from "@/lib/types";

interface RiskHeatmapProps {
  orders: AnalyzedOrder[];
  onSelectOrder: (order: AnalyzedOrder) => void;
}

export function RiskHeatmap({ orders, onSelectOrder }: RiskHeatmapProps) {
  const low = orders.filter((o) => o.riskCategory === "low");
  const medium = orders.filter((o) => o.riskCategory === "medium");
  const high = orders.filter((o) => o.riskCategory === "high");

  const HeatCell = ({ order }: { order: AnalyzedOrder }) => {
    const bg = order.riskCategory === "low"
      ? "bg-risk-low/20 hover:bg-risk-low/40 border-risk-low/30"
      : order.riskCategory === "medium"
        ? "bg-risk-medium/20 hover:bg-risk-medium/40 border-risk-medium/30"
        : "bg-risk-high/20 hover:bg-risk-high/40 border-risk-high/30";

    const size = Math.max(28, Math.min(48, order.orderValue / 20));

    return (
      <div
        onClick={() => onSelectOrder(order)}
        className={`${bg} border rounded-md cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center group relative`}
        style={{ width: size, height: size }}
        title={`${order.id} | Risk: ${Math.round((1 - order.successProbability) * 100)}% | ${order.paymentType}`}
      >
        <span className="text-[8px] font-mono font-bold text-foreground/80">{order.id.replace("ORD-", "")}</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
          <div className="bg-card border border-border rounded-md px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
            <p className="font-mono font-bold text-foreground">{order.id}</p>
            <p className="text-muted-foreground">Risk: {Math.round((1 - order.successProbability) * 100)}%</p>
            <p className="text-muted-foreground">{order.paymentType} • ₹{order.orderValue}</p>
          </div>
        </div>
      </div>
    );
  };

  const Zone = ({ label, icon, orders: zoneOrders, color }: { label: string; icon: string; orders: AnalyzedOrder[]; color: string }) => (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{zoneOrders.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border/50 bg-surface/50 min-h-[60px]">
        {zoneOrders.map((o) => <HeatCell key={o.id} order={o} />)}
        {zoneOrders.length === 0 && <span className="text-[10px] text-muted-foreground italic">No orders</span>}
      </div>
    </div>
  );

  return (
    <div className="metric-card p-5 mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">🚨 Risk Heatmap</h3>
      <div className="flex flex-wrap gap-4">
        <Zone label="Low Risk" icon="🟢" orders={low} color="var(--risk-low)" />
        <Zone label="Medium Risk" icon="🟡" orders={medium} color="var(--risk-medium)" />
        <Zone label="High Risk" icon="🔴" orders={high} color="var(--risk-high)" />
      </div>
    </div>
  );
}
