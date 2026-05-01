import type { OptimizationResult } from "@/lib/types";

interface KPIDashboardProps {
  result: OptimizationResult;
  totalOrders: number;
}

function KPICard({ icon, label, value, sub, color, before }: { icon: React.ReactNode; label: string; value: string; sub?: string; color?: string; before?: string }) {
  return (
    <div className="metric-card p-5 flex flex-col gap-2" style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${color || "text-foreground"}`} style={{ animation: "slideUp 0.6s ease-out" }}>{value}</p>
      {before && <p className="text-[10px] text-muted-foreground font-mono">Before: {before}</p>}
      {sub && (
        <p className="text-xs text-muted-foreground" style={{ animation: "fadeIn 0.8s ease-out" }}>{sub}</p>
      )}
    </div>
  );
}

export function KPIDashboard({ result, totalOrders }: KPIDashboardProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <KPICard
        icon={<span className="text-base">💰</span>}
        label="Expected Revenue"
        value={`₹${result.after.expectedRevenue.toLocaleString()}`}
        before={`₹${result.before.expectedRevenue.toLocaleString()}`}
        sub={`+${result.revenueGain}% vs distance-based`}
        color="text-risk-low"
      />
      <KPICard
        icon={<span className="text-base">📈</span>}
        label="Expected Profit"
        value={`₹${result.after.profit.totalExpectedProfit.toLocaleString()}`}
        before={`₹${result.before.profit.totalExpectedProfit.toLocaleString()}`}
        sub={`${result.profitImprovement > 0 ? "+" : ""}${result.profitImprovement}% improvement`}
        color="text-primary"
      />
      <KPICard
        icon={<span className="text-base">⚠️</span>}
        label="Avg Risk Score"
        value={`${Math.round(result.after.avgRisk * 100)}%`}
        before={`${Math.round(result.before.avgRisk * 100)}%`}
        sub={`-${result.riskReduction}% risk exposure`}
        color="text-risk-medium"
      />
      <KPICard
        icon={<span className="text-base">🚚</span>}
        label="Efficiency Gain"
        value={`${result.efficiencyGain > 0 ? "+" : ""}${result.efficiencyGain}%`}
        sub="Revenue per km improvement"
        color="text-primary"
      />
      <KPICard
        icon={<span className="text-base">📦</span>}
        label="Total Orders"
        value={String(totalOrders)}
        sub={`${result.after.highRiskCount} high-risk flagged`}
      />
    </div>
  );
}
