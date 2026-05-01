import type { SimulationParams } from "@/lib/types";

interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
}

function SliderControl({ label, value, min, max, step, format, onChange }: { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div className="flex-1 min-w-[180px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono font-semibold text-primary">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
      />
    </div>
  );
}

export function SimulationControls({ params, onChange }: SimulationControlsProps) {
  const set = (key: keyof SimulationParams, v: number) => onChange({ ...params, [key]: v });

  return (
    <div className="metric-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">🧪 What-If Scenario Simulation</h3>
        <span className="text-[10px] text-primary uppercase tracking-wider font-semibold">Real-time Stress Testing</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <SliderControl label="COD Percentage" value={params.codPercentage} min={0} max={1} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => set("codPercentage", v)} />
        <SliderControl label="Risk Multiplier" value={params.riskMultiplier} min={0.5} max={3} step={0.1} format={(v) => `${v.toFixed(1)}x`} onChange={(v) => set("riskMultiplier", v)} />
        <SliderControl label="Avg Order Value" value={params.avgOrderValue} min={100} max={2000} step={50} format={(v) => `₹${v}`} onChange={(v) => set("avgOrderValue", v)} />
        <SliderControl label="COD Failure Rate" value={params.codFailureRate} min={0} max={0.8} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => set("codFailureRate", v)} />
        <SliderControl label="Distance Cost Factor" value={params.distanceCostFactor} min={1} max={15} step={0.5} format={(v) => `₹${v}/km`} onChange={(v) => set("distanceCostFactor", v)} />
        <SliderControl label="Reliability Shift" value={params.reliabilityShift} min={-0.3} max={0.3} step={0.05} format={(v) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}%`} onChange={(v) => set("reliabilityShift", v)} />
      </div>
      <p className="text-xs text-muted-foreground mt-3">Adjust parameters to stress-test logistics decisions. Changes recompute instantly on re-generate.</p>
    </div>
  );
}
