import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import type { Order, AnalyzedOrder, OptimizationResult } from "@/lib/types";
import { runOptimization } from "@/lib/engine";
import { HeroBanner } from "@/components/HeroBanner";
import { DataInput } from "@/components/DataInput";
import { KPIDashboard } from "@/components/KPIDashboard";
import { BeforeAfterComparison } from "@/components/BeforeAfterComparison";
import { OrdersTable } from "@/components/OrdersTable";
import { Recommendations } from "@/components/Recommendations";
import { AIExplanation } from "@/components/AIExplanation";
import { SimulationControls } from "@/components/SimulationControls";
import { RouteVisualization } from "@/components/RouteVisualization";

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
  const [codPct, setCodPct] = useState(0.4);
  const [riskMult, setRiskMult] = useState(1);
  const [avgValue, setAvgValue] = useState(500);

  const handleDataLoaded = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
    const opt = runOptimization(newOrders, riskMult);
    setResult(opt);
    setSelectedOrder(null);
  }, [riskMult]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <HeroBanner />

        <SimulationControls
          codPct={codPct}
          riskMult={riskMult}
          avgValue={avgValue}
          onCodPctChange={setCodPct}
          onRiskMultChange={setRiskMult}
          onAvgValueChange={setAvgValue}
        />

        <DataInput onDataLoaded={handleDataLoaded} codPct={codPct} riskMult={riskMult} avgValue={avgValue} />

        {result && (
          <div style={{ animation: "slideUp 0.4s ease-out" }}>
            <KPIDashboard result={result} totalOrders={orders.length} />
            <BeforeAfterComparison result={result} />
            <RouteVisualization beforeOrders={result.before.orders} afterOrders={result.after.orders} />
            <AIExplanation order={selectedOrder} />
            <OrdersTable orders={result.after.orders} onSelectOrder={setSelectedOrder} selectedOrderId={selectedOrder?.id} />
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
