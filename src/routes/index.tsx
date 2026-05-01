import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import type { Order, AnalyzedOrder, OptimizationResult, SimulationParams, LearningWeights, DeliveryOutcome } from "@/lib/types";
import { runOptimization, generateSampleOrders, simulateDeliveryDay, updateWeightsFromOutcomes, getDefaultWeights, generateInsights } from "@/lib/engine";
import { HeroBanner } from "@/components/HeroBanner";
import { DataInput } from "@/components/DataInput";
import { KPIDashboard } from "@/components/KPIDashboard";
import { BeforeAfterComparison } from "@/components/BeforeAfterComparison";
import { OrdersTable } from "@/components/OrdersTable";
import { Recommendations } from "@/components/Recommendations";
import { AIExplanation } from "@/components/AIExplanation";
import { SimulationControls } from "@/components/SimulationControls";
import { RouteVisualization } from "@/components/RouteVisualization";
import { LearningStatusPanel } from "@/components/LearningStatusPanel";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { ProfitComparison } from "@/components/ProfitComparison";
import { DeliveryOutcomesPanel } from "@/components/DeliveryOutcomesPanel";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "PayRoute AI — Profit-Aware Logistics Decision Engine" },
      { name: "description", content: "Optimize delivery routes based on profit, risk, and efficiency — not just distance." },
    ],
  }),
});

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AnalyzedOrder | null>(null);
  const [weights, setWeights] = useState<LearningWeights>(getDefaultWeights());
  const [outcomes, setOutcomes] = useState<DeliveryOutcome[] | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  const [params, setParams] = useState<SimulationParams>({
    codPercentage: 0.4,
    riskMultiplier: 1,
    avgOrderValue: 500,
    codFailureRate: 0.3,
    distanceCostFactor: 5,
    reliabilityShift: 0,
  });

  const recompute = useCallback((newOrders: Order[], w: LearningWeights, p: SimulationParams) => {
    const opt = runOptimization(newOrders, p.riskMultiplier, w, p.distanceCostFactor, p.reliabilityShift);
    setResult(opt);
    setInsights(generateInsights(opt.after.orders, opt));
    setSelectedOrder(null);
    setOutcomes(null);
  }, []);

  const handleDataLoaded = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
    recompute(newOrders, weights, params);
  }, [weights, params, recompute]);

  // Auto-recompute when params change and orders exist
  useEffect(() => {
    if (orders.length > 0) {
      recompute(orders, weights, params);
    }
  }, [params, weights]);

  const handleSimulateDay = useCallback(() => {
    if (!result) return;
    const dayOutcomes = simulateDeliveryDay(result.after.orders);
    setOutcomes(dayOutcomes);

    // Trigger learning
    setIsLearning(true);
    const newWeights = updateWeightsFromOutcomes(weights, result.after.orders, dayOutcomes);
    setTimeout(() => {
      setWeights(newWeights);
      setIsLearning(false);
    }, 1000);
  }, [result, weights]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <HeroBanner />

        {/* System Identity Banner */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 flex items-center gap-3" style={{ animation: "fadeIn 0.6s ease-out" }}>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs text-primary font-medium tracking-wide">
            PayRoute AI is running in <span className="font-bold">Adaptive Decision Intelligence Mode</span> — continuously learning from simulated logistics outcomes.
          </p>
        </div>

        <SimulationControls params={params} onChange={setParams} />

        <DataInput
          onDataLoaded={handleDataLoaded}
          codPct={params.codPercentage}
          riskMult={params.riskMultiplier}
          avgValue={params.avgOrderValue}
        />

        {result && (
          <div style={{ animation: "slideUp 0.4s ease-out" }}>
            <KPIDashboard result={result} totalOrders={orders.length} />
            <ProfitComparison result={result} />
            <BeforeAfterComparison result={result} />

            <LearningStatusPanel weights={weights} isLearning={isLearning} />

            <RouteVisualization beforeOrders={result.before.orders} afterOrders={result.after.orders} />

            <RiskHeatmap orders={result.after.orders} onSelectOrder={setSelectedOrder} />

            <AIExplanation order={selectedOrder} weights={weights} allOrders={result.after.orders} />

            <OrdersTable orders={result.after.orders} onSelectOrder={setSelectedOrder} selectedOrderId={selectedOrder?.id} />

            {/* Delivery Simulation */}
            <div className="metric-card p-5 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">📦 Delivery Day Simulator</h3>
                <p className="text-xs text-muted-foreground mt-1">Simulate a full delivery day to test predictions and trigger adaptive learning.</p>
              </div>
              <Button onClick={handleSimulateDay} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Simulate Delivery Day
              </Button>
            </div>

            {outcomes && <DeliveryOutcomesPanel outcomes={outcomes} orders={result.after.orders} />}

            <AIInsightsPanel insights={insights} />

            <Recommendations orders={result.after.orders} />
          </div>
        )}

        {!result && (
          <div className="metric-card p-12 text-center">
            <p className="text-lg text-muted-foreground">Generate or upload order data to begin optimization.</p>
            <p className="text-sm text-muted-foreground mt-2">Use the controls above to adjust simulation parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
