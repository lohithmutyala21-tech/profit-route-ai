import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import type { Order, AnalyzedOrder, OptimizationResult, SimulationParams, LearningWeights, DeliveryOutcome } from "@/lib/types";
import { runOptimization, simulateDeliveryDay, updateWeightsFromOutcomes, getDefaultWeights, generateInsights } from "@/lib/engine";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — PayRoute AI" }] }),
});

function Dashboard() {
  const { user, company, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  // Load persisted orders + weights from DB once company is known
  useEffect(() => {
    if (!company) return;
    (async () => {
      const [{ data: dbOrders }, { data: w }] = await Promise.all([
        supabase.from("orders").select("*").eq("company_id", company.id).order("created_at", { ascending: true }),
        supabase.from("learning_weights").select("*").eq("company_id", company.id).maybeSingle(),
      ]);
      if (dbOrders) {
        const mapped: Order[] = dbOrders.map((o: any) => ({
          id: o.external_id || o.id,
          location: o.location,
          distance: Number(o.distance),
          orderValue: Number(o.order_value),
          paymentType: o.payment_type as "COD" | "Prepaid",
          customerReliability: Number(o.customer_reliability),
        }));
        setOrders(mapped);
      }
      if (w) {
        setWeights({
          successWeight: Number(w.success_weight),
          valueWeight: Number(w.value_weight),
          distanceWeight: Number(w.distance_weight),
          history: (w.history as any) || [{ iteration: 0, success: Number(w.success_weight), value: Number(w.value_weight), distance: Number(w.distance_weight) }],
        });
      }
    })();
  }, [company]);

  const recompute = useCallback((newOrders: Order[], w: LearningWeights, p: SimulationParams) => {
    if (newOrders.length === 0) { setResult(null); return; }
    const opt = runOptimization(newOrders, p.riskMultiplier, w, p.distanceCostFactor, p.reliabilityShift);
    setResult(opt);
    setInsights(generateInsights(opt.after.orders, opt));
    setSelectedOrder(null);
    setOutcomes(null);
  }, []);

  const handleDataLoaded = useCallback(async (newOrders: Order[]) => {
    setOrders(newOrders);
    recompute(newOrders, weights, params);
    if (company) {
      // Persist: replace existing orders for this company
      await supabase.from("orders").delete().eq("company_id", company.id);
      const rows = newOrders.map((o) => ({
        company_id: company.id,
        external_id: o.id,
        location: o.location,
        distance: o.distance,
        order_value: o.orderValue,
        payment_type: o.paymentType,
        customer_reliability: o.customerReliability,
      }));
      const { error } = await supabase.from("orders").insert(rows);
      if (error) toast.error("Failed to save orders: " + error.message);
    }
  }, [weights, params, recompute, company]);

  useEffect(() => {
    if (orders.length > 0) recompute(orders, weights, params);
  }, [params, weights]);

  const persistWeights = async (w: LearningWeights) => {
    if (!company) return;
    await supabase.from("learning_weights").upsert({
      company_id: company.id,
      success_weight: w.successWeight,
      value_weight: w.valueWeight,
      distance_weight: w.distanceWeight,
      history: w.history as any,
    });
  };

  const handleSimulateDay = useCallback(async () => {
    if (!result) return;
    const dayOutcomes = simulateDeliveryDay(result.after.orders);
    setOutcomes(dayOutcomes);
    setIsLearning(true);
    const newWeights = updateWeightsFromOutcomes(weights, result.after.orders, dayOutcomes);
    setTimeout(async () => {
      setWeights(newWeights);
      setIsLearning(false);
      await persistWeights(newWeights);
    }, 1000);

    if (company) {
      // log outcomes (non-blocking)
      const { data: dbOrders } = await supabase.from("orders").select("id, external_id").eq("company_id", company.id);
      const idMap = new Map<string, string>((dbOrders ?? []).map((r: any) => [r.external_id, r.id]));
      const rows = dayOutcomes.map((o) => ({
        company_id: company.id,
        order_id: idMap.get(o.orderId) ?? null,
        delivered: o.delivered,
        actual_revenue: o.actualRevenue,
        lost_revenue: o.lostRevenue,
      }));
      if (rows.length) await supabase.from("delivery_outcomes").insert(rows);
    }
  }, [result, weights, company]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Decision Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Workspace: <span className="text-foreground font-medium">{company?.name ?? "—"}</span>
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs text-primary font-medium tracking-wide">
            Running in <span className="font-bold">Adaptive Decision Intelligence Mode</span> — continuously learning from simulated logistics outcomes.
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
