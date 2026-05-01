interface SimulationControlsProps {
  codPct: number;
  riskMult: number;
  avgValue: number;
  onCodPctChange: (v: number) => void;
  onRiskMultChange: (v: number) => void;
  onAvgValueChange: (v: number) => void;
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

export function SimulationControls({ codPct, riskMult, avgValue, onCodPctChange, onRiskMultChange, onAvgValueChange }: SimulationControlsProps) {
  return (
    <div className="metric-card p-5 mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">🧪 Simulation Controls</h3>
      <div className="flex flex-wrap gap-6">
        <SliderControl label="COD Percentage" value={codPct} min={0} max={1} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={onCodPctChange} />
        <SliderControl label="Risk Multiplier" value={riskMult} min={0.5} max={3} step={0.1} format={(v) => `${v.toFixed(1)}x`} onChange={onRiskMultChange} />
        <SliderControl label="Avg Order Value" value={avgValue} min={100} max={2000} step={50} format={(v) => `₹${v}`} onChange={onAvgValueChange} />
      </div>
      <p className="text-xs text-muted-foreground mt-3">Adjust parameters and re-generate data to see impact on optimization.</p>
    </div>
  );
}
