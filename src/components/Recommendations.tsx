import type { AnalyzedOrder } from "@/lib/types";

interface RecommendationsProps {
  orders: AnalyzedOrder[];
}

function RecommendationGroup({ title, icon, orders, badgeCls }: { title: string; icon: string; orders: AnalyzedOrder[]; badgeCls: string }) {
  if (orders.length === 0) return null;
  return (
    <div className="metric-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h4>
        <span className={`${badgeCls} px-2 py-0.5 rounded-full text-xs font-bold ml-auto`}>{orders.length}</span>
      </div>
      <div className="space-y-1.5">
        {orders.slice(0, 5).map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-xs">
            <span className="font-mono text-foreground">{o.id}</span>
            <span className="text-muted-foreground">{o.location}</span>
            <span className="font-mono text-foreground">₹{o.orderValue}</span>
          </div>
        ))}
        {orders.length > 5 && <p className="text-xs text-muted-foreground text-center">+{orders.length - 5} more</p>}
      </div>
    </div>
  );
}

export function Recommendations({ orders }: RecommendationsProps) {
  const sorted = [...orders].sort((a, b) => b.priorityScore - a.priorityScore);
  const deliverFirst = sorted.filter((o) => o.riskCategory === "low" && o.priorityScore >= 0.4);
  const deliverLater = sorted.filter((o) => o.riskCategory === "medium");
  const verify = sorted.filter((o) => o.riskCategory === "high");

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Smart Recommendations</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <RecommendationGroup title="Deliver First" icon="🟢" orders={deliverFirst} badgeCls="risk-badge-low" />
        <RecommendationGroup title="Deliver Later" icon="🟡" orders={deliverLater} badgeCls="risk-badge-medium" />
        <RecommendationGroup title="Verify Before Dispatch" icon="🔴" orders={verify} badgeCls="risk-badge-high" />
      </div>
    </div>
  );
}
