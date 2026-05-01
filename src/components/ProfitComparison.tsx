import type { OptimizationResult } from "@/lib/types";

interface ProfitComparisonProps {
  result: OptimizationResult;
}

export function ProfitComparison({ result }: ProfitComparisonProps) {
  const bp = result.before.profit;
  const ap = result.after.profit;
  const maxProfit = Math.max(Math.abs(bp.totalExpectedProfit), Math.abs(ap.totalExpectedProfit), 1);

  const ProfitBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono font-semibold" style={{ color }}>₹{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(5, (Math.abs(value) / max) * 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );

  return (
    <div className="metric-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">📊 Profit Simulation</h3>
        {result.profitImprovement !== 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${result.profitImprovement > 0 ? "bg-risk-low/15 text-risk-low" : "bg-risk-high/15 text-risk-high"}`}>
            {result.profitImprovement > 0 ? "+" : ""}{result.profitImprovement}% Profit
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Before (Distance-Based)</p>
          <ProfitBar label="Revenue" value={bp.totalExpectedRevenue} max={Math.max(bp.totalExpectedRevenue, ap.totalExpectedRevenue)} color="var(--muted-foreground)" />
          <ProfitBar label="Delivery Cost" value={bp.totalDeliveryCost} max={Math.max(bp.totalDeliveryCost, ap.totalDeliveryCost)} color="var(--risk-medium)" />
          <ProfitBar label="Risk Loss" value={bp.totalRiskLoss} max={Math.max(bp.totalRiskLoss, ap.totalRiskLoss)} color="var(--risk-high)" />
          <div className="border-t border-border/50 pt-2">
            <ProfitBar label="Net Profit" value={bp.totalExpectedProfit} max={maxProfit} color="var(--muted-foreground)" />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-primary font-semibold uppercase">After (Profit-Optimized)</p>
          <ProfitBar label="Revenue" value={ap.totalExpectedRevenue} max={Math.max(bp.totalExpectedRevenue, ap.totalExpectedRevenue)} color="var(--primary)" />
          <ProfitBar label="Delivery Cost" value={ap.totalDeliveryCost} max={Math.max(bp.totalDeliveryCost, ap.totalDeliveryCost)} color="var(--risk-medium)" />
          <ProfitBar label="Risk Loss" value={ap.totalRiskLoss} max={Math.max(bp.totalRiskLoss, ap.totalRiskLoss)} color="var(--risk-high)" />
          <div className="border-t border-border/50 pt-2">
            <ProfitBar label="Net Profit" value={ap.totalExpectedProfit} max={maxProfit} color="var(--risk-low)" />
          </div>
        </div>
      </div>
    </div>
  );
}
