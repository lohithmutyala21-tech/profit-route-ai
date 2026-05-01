import type { OptimizationResult } from "@/lib/types";

interface ComparisonProps {
  result: OptimizationResult;
}

function MetricRow({ label, before, after, unit, improved }: { label: string; before: string; after: string; unit?: string; improved: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-muted-foreground">{before}{unit}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className={`text-sm font-mono font-semibold ${improved ? "text-risk-low" : "text-risk-high"}`}>
          {after}{unit}
        </span>
      </div>
    </div>
  );
}

export function BeforeAfterComparison({ result }: ComparisonProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div className="metric-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Before — Distance Based</h3>
        </div>
        <div className="space-y-1">
          <MetricRow label="Total Distance" before={String(result.before.totalDistance)} after={String(result.after.totalDistance)} unit=" km" improved={result.after.totalDistance <= result.before.totalDistance} />
          <MetricRow label="Expected Revenue" before={`₹${result.before.expectedRevenue.toLocaleString()}`} after={`₹${result.after.expectedRevenue.toLocaleString()}`} improved={result.after.expectedRevenue >= result.before.expectedRevenue} />
          <MetricRow label="High-Risk Delivered" before={String(result.before.highRiskCount)} after={String(result.after.highRiskCount)} improved={result.after.highRiskCount <= result.before.highRiskCount} />
        </div>
      </div>
      <div className="metric-card glow-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">After — Profit Optimized</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-risk-low/10 px-3 py-2">
            <span className="text-risk-low font-bold text-lg">+{result.revenueGain}%</span>
            <span className="text-xs text-muted-foreground">Revenue Efficiency</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
            <span className="text-primary font-bold text-lg">-{result.riskReduction}%</span>
            <span className="text-xs text-muted-foreground">Risk Exposure</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
            <span className="text-foreground font-bold text-lg">+{result.efficiencyGain}%</span>
            <span className="text-xs text-muted-foreground">Delivery Efficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
