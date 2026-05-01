export function HeroBanner() {
  return (
    <div className="hero-gradient rounded-2xl border border-border p-8 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            PayRoute AI
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Profit-Aware Logistics Decision Engine
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
        Transforming logistics from distance-based routing to profit-aware decision intelligence.
      </p>
    </div>
  );
}
