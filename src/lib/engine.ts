import type { Order, AnalyzedOrder, OptimizationResult } from "./types";

const LOCATIONS = [
  "Mumbai Central", "Andheri West", "Bandra East", "Powai", "Thane",
  "Navi Mumbai", "Borivali", "Dadar", "Worli", "Goregaon",
  "Malad", "Kandivali", "Jogeshwari", "Vikhroli", "Ghatkopar",
  "Mulund", "Kurla", "Chembur", "Wadala", "Sion",
  "Parel", "Lower Parel", "Mahalaxmi", "Churchgate", "Colaba",
  "Fort", "Marine Lines", "Grant Road", "Santacruz", "Vile Parle",
];

export function generateSampleOrders(
  count: number = 30,
  codPct: number = 0.4,
  riskMult: number = 1,
  avgValue: number = 500
): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const isCOD = Math.random() < codPct;
    orders.push({
      id: `ORD-${String(i + 1).padStart(4, "0")}`,
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      distance: Math.round((2 + Math.random() * 48) * 10) / 10,
      orderValue: Math.round(avgValue * (0.3 + Math.random() * 1.7)),
      paymentType: isCOD ? "COD" : "Prepaid",
      customerReliability: Math.round((0.1 + Math.random() * 0.9) * 100) / 100,
    });
  }
  return orders;
}

export function analyzeOrder(order: Order, riskMultiplier: number = 1): AnalyzedOrder {
  let sp: number;
  if (order.paymentType === "Prepaid") {
    sp = 0.85 + order.customerReliability * 0.15;
  } else {
    sp = order.customerReliability * 0.7 * (1 / riskMultiplier);
  }
  sp = Math.max(0, Math.min(1, sp));
  sp = Math.round(sp * 100) / 100;

  const riskCategory = sp >= 0.75 ? "low" : sp >= 0.4 ? "medium" : "high";

  return { ...order, successProbability: sp, riskCategory, priorityScore: 0 };
}

export function computePriorityScores(orders: AnalyzedOrder[]): AnalyzedOrder[] {
  const maxValue = Math.max(...orders.map((o) => o.orderValue), 1);
  const maxDist = Math.max(...orders.map((o) => o.distance), 1);

  return orders.map((o) => ({
    ...o,
    priorityScore:
      Math.round(
        (0.5 * o.successProbability +
          0.3 * (o.orderValue / maxValue) -
          0.2 * (o.distance / maxDist)) *
          1000
      ) / 1000,
  }));
}

function computeMetrics(orders: AnalyzedOrder[]) {
  let totalDistance = 0;
  let expectedRevenue = 0;
  let highRiskCount = 0;
  let riskSum = 0;

  for (const o of orders) {
    totalDistance += o.distance;
    expectedRevenue += o.orderValue * o.successProbability;
    if (o.riskCategory === "high") highRiskCount++;
    riskSum += 1 - o.successProbability;
  }

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    expectedRevenue: Math.round(expectedRevenue),
    highRiskCount,
    avgRisk: Math.round((riskSum / orders.length) * 100) / 100,
  };
}

export function runOptimization(rawOrders: Order[], riskMultiplier: number = 1): OptimizationResult {
  const analyzed = rawOrders.map((o) => analyzeOrder(o, riskMultiplier));
  const scored = computePriorityScores(analyzed);

  const beforeOrders = [...scored].sort((a, b) => a.distance - b.distance);
  const afterOrders = [...scored].sort((a, b) => b.priorityScore - a.priorityScore);

  const beforeMetrics = computeMetrics(beforeOrders);
  const afterMetrics = computeMetrics(afterOrders);

  // Revenue from top N deliveries (simulate limited capacity — top 70%)
  const topN = Math.ceil(scored.length * 0.7);
  const beforeTopRevenue = beforeOrders.slice(0, topN).reduce((s, o) => s + o.orderValue * o.successProbability, 0);
  const afterTopRevenue = afterOrders.slice(0, topN).reduce((s, o) => s + o.orderValue * o.successProbability, 0);

  const revenueGain = beforeTopRevenue > 0 ? Math.round(((afterTopRevenue - beforeTopRevenue) / beforeTopRevenue) * 100) : 0;

  const beforeTopRisk = beforeOrders.slice(0, topN).filter((o) => o.riskCategory === "high").length;
  const afterTopRisk = afterOrders.slice(0, topN).filter((o) => o.riskCategory === "high").length;
  const riskReduction = beforeTopRisk > 0 ? Math.round(((beforeTopRisk - afterTopRisk) / beforeTopRisk) * 100) : 0;

  const efficiencyGain = Math.round(((afterTopRevenue / afterMetrics.totalDistance) / (beforeTopRevenue / beforeMetrics.totalDistance) - 1) * 100);

  return {
    before: { orders: beforeOrders, ...beforeMetrics },
    after: { orders: afterOrders, ...afterMetrics },
    revenueGain,
    riskReduction: Math.max(0, riskReduction),
    efficiencyGain: isFinite(efficiencyGain) ? efficiencyGain : 0,
  };
}

export function getExplanation(order: AnalyzedOrder): string {
  const spPct = Math.round(order.successProbability * 100);
  const parts: string[] = [];

  if (order.successProbability >= 0.75) {
    parts.push(`high payment success probability (${spPct}%)`);
  } else if (order.successProbability >= 0.4) {
    parts.push(`moderate payment success probability (${spPct}%)`);
  } else {
    parts.push(`low payment success probability (${spPct}%)`);
  }

  if (order.orderValue >= 600) {
    parts.push("high order value");
  } else if (order.orderValue >= 300) {
    parts.push("moderate order value");
  } else {
    parts.push("low order value");
  }

  if (order.distance <= 15) {
    parts.push("short delivery distance");
  } else if (order.distance <= 30) {
    parts.push("moderate distance");
  } else {
    parts.push("long delivery distance");
  }

  const action =
    order.priorityScore >= 0.5
      ? "prioritized for early delivery"
      : order.priorityScore >= 0.2
        ? "scheduled for standard delivery"
        : "flagged for verification before dispatch";

  return `This order is ${action} due to ${parts.join(", ")}. Payment type: ${order.paymentType}, Customer reliability: ${Math.round(order.customerReliability * 100)}%.`;
}

export function parseCSV(text: string): Order[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const orders: Order[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 6) continue;
    orders.push({
      id: cols[headers.indexOf("order id")] || cols[headers.indexOf("orderid")] || cols[headers.indexOf("id")] || `ORD-${i}`,
      location: cols[headers.indexOf("location")] || "Unknown",
      distance: parseFloat(cols[headers.indexOf("distance")]) || 10,
      orderValue: parseFloat(cols[headers.indexOf("order value")] || cols[headers.indexOf("ordervalue")] || cols[headers.indexOf("value")]) || 100,
      paymentType: (cols[headers.indexOf("payment type")] || cols[headers.indexOf("paymenttype")] || "COD").toUpperCase().includes("PRE") ? "Prepaid" : "COD",
      customerReliability: parseFloat(cols[headers.indexOf("customer reliability")] || cols[headers.indexOf("customerreliability")] || cols[headers.indexOf("reliability")]) || 0.5,
    });
  }
  return orders;
}
