import type { Order, AnalyzedOrder, OptimizationResult, LearningWeights, DeliveryOutcome, ProfitMetrics } from "./types";

const LOCATIONS = [
  "Mumbai Central", "Andheri West", "Bandra East", "Powai", "Thane",
  "Navi Mumbai", "Borivali", "Dadar", "Worli", "Goregaon",
  "Malad", "Kandivali", "Jogeshwari", "Vikhroli", "Ghatkopar",
  "Mulund", "Kurla", "Chembur", "Wadala", "Sion",
  "Parel", "Lower Parel", "Mahalaxmi", "Churchgate", "Colaba",
  "Fort", "Marine Lines", "Grant Road", "Santacruz", "Vile Parle",
];

export function getDefaultWeights(): LearningWeights {
  return {
    successWeight: 0.5,
    valueWeight: 0.3,
    distanceWeight: 0.2,
    history: [{ iteration: 0, success: 0.5, value: 0.3, distance: 0.2 }],
  };
}

export function updateWeightsFromOutcomes(
  weights: LearningWeights,
  orders: AnalyzedOrder[],
  outcomes: DeliveryOutcome[]
): LearningWeights {
  const codOrders = orders.filter((o) => o.paymentType === "COD");
  const codOutcomes = outcomes.filter((out) => codOrders.some((o) => o.id === out.orderId));
  const codFailRate = codOutcomes.length > 0 ? codOutcomes.filter((o) => !o.delivered).length / codOutcomes.length : 0;

  const highValueOrders = orders.filter((o) => o.orderValue >= 500);
  const highValueOutcomes = outcomes.filter((out) => highValueOrders.some((o) => o.id === out.orderId));
  const highValueSuccessRate = highValueOutcomes.length > 0 ? highValueOutcomes.filter((o) => o.delivered).length / highValueOutcomes.length : 0.5;

  const lr = 0.05;
  let newSuccess = weights.successWeight + (codFailRate > 0.4 ? lr : -lr * 0.5);
  let newValue = weights.valueWeight + (highValueSuccessRate > 0.6 ? lr : -lr * 0.5);
  let newDistance = weights.distanceWeight;

  // Normalize
  const total = newSuccess + newValue + newDistance;
  newSuccess = Math.round((newSuccess / total) * 1000) / 1000;
  newValue = Math.round((newValue / total) * 1000) / 1000;
  newDistance = Math.round((1 - newSuccess - newValue) * 1000) / 1000;

  const iteration = weights.history.length;
  return {
    successWeight: newSuccess,
    valueWeight: newValue,
    distanceWeight: newDistance,
    history: [...weights.history, { iteration, success: newSuccess, value: newValue, distance: newDistance }],
  };
}

export function generateSampleOrders(
  count: number = 30,
  codPct: number = 0.4,
  _riskMult: number = 1,
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

export function analyzeOrder(order: Order, riskMultiplier: number = 1, distanceCostFactor: number = 5, reliabilityShift: number = 0): AnalyzedOrder {
  const adjustedReliability = Math.max(0, Math.min(1, order.customerReliability + reliabilityShift));
  let sp: number;
  if (order.paymentType === "Prepaid") {
    sp = 0.85 + adjustedReliability * 0.15;
  } else {
    sp = adjustedReliability * 0.7 * (1 / riskMultiplier);
  }
  sp = Math.max(0, Math.min(1, sp));
  sp = Math.round(sp * 100) / 100;

  const riskCategory = sp >= 0.75 ? "low" : sp >= 0.4 ? "medium" : "high";

  const expectedRevenue = Math.round(order.orderValue * sp);
  const deliveryCost = Math.round(order.distance * distanceCostFactor);
  const riskLoss = Math.round(order.orderValue * (1 - sp) * 0.3);
  const expectedProfit = expectedRevenue - deliveryCost - riskLoss;

  // Confidence score
  const spStability = 1 - Math.abs(sp - 0.5) * 0.5; // more confident at extremes
  const valueDistBalance = 1 - Math.abs(order.orderValue / 1000 - order.distance / 50);
  const riskConsistency = riskCategory === "low" ? 1 : riskCategory === "medium" ? 0.6 : 0.3;
  const confidenceScore = Math.round(Math.max(0, Math.min(100, (sp * 40 + riskConsistency * 35 + Math.max(0, valueDistBalance) * 25))));
  const confidenceLevel = confidenceScore >= 70 ? "High" : confidenceScore >= 40 ? "Medium" : "Low";

  return {
    ...order,
    successProbability: sp,
    riskCategory,
    priorityScore: 0,
    confidenceScore,
    confidenceLevel,
    expectedRevenue,
    deliveryCost,
    riskLoss,
    expectedProfit,
  };
}

export function computePriorityScores(orders: AnalyzedOrder[], weights: LearningWeights): AnalyzedOrder[] {
  const maxValue = Math.max(...orders.map((o) => o.orderValue), 1);
  const maxDist = Math.max(...orders.map((o) => o.distance), 1);

  return orders.map((o) => ({
    ...o,
    priorityScore:
      Math.round(
        (weights.successWeight * o.successProbability +
          weights.valueWeight * (o.orderValue / maxValue) -
          weights.distanceWeight * (o.distance / maxDist)) *
          1000
      ) / 1000,
  }));
}

function computeProfitMetrics(orders: AnalyzedOrder[]): ProfitMetrics {
  return {
    totalExpectedRevenue: orders.reduce((s, o) => s + o.expectedRevenue, 0),
    totalDeliveryCost: orders.reduce((s, o) => s + o.deliveryCost, 0),
    totalRiskLoss: orders.reduce((s, o) => s + o.riskLoss, 0),
    totalExpectedProfit: orders.reduce((s, o) => s + o.expectedProfit, 0),
  };
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
    profit: computeProfitMetrics(orders),
  };
}

export function runOptimization(
  rawOrders: Order[],
  riskMultiplier: number = 1,
  weights: LearningWeights = getDefaultWeights(),
  distanceCostFactor: number = 5,
  reliabilityShift: number = 0
): OptimizationResult {
  const analyzed = rawOrders.map((o) => analyzeOrder(o, riskMultiplier, distanceCostFactor, reliabilityShift));
  const scored = computePriorityScores(analyzed, weights);

  const beforeOrders = [...scored].sort((a, b) => a.distance - b.distance);
  const afterOrders = [...scored].sort((a, b) => b.priorityScore - a.priorityScore);

  const beforeMetrics = computeMetrics(beforeOrders);
  const afterMetrics = computeMetrics(afterOrders);

  const topN = Math.ceil(scored.length * 0.7);
  const beforeTopRevenue = beforeOrders.slice(0, topN).reduce((s, o) => s + o.orderValue * o.successProbability, 0);
  const afterTopRevenue = afterOrders.slice(0, topN).reduce((s, o) => s + o.orderValue * o.successProbability, 0);

  const revenueGain = beforeTopRevenue > 0 ? Math.round(((afterTopRevenue - beforeTopRevenue) / beforeTopRevenue) * 100) : 0;

  const beforeTopRisk = beforeOrders.slice(0, topN).filter((o) => o.riskCategory === "high").length;
  const afterTopRisk = afterOrders.slice(0, topN).filter((o) => o.riskCategory === "high").length;
  const riskReduction = beforeTopRisk > 0 ? Math.round(((beforeTopRisk - afterTopRisk) / beforeTopRisk) * 100) : 0;

  const efficiencyGain = Math.round(((afterTopRevenue / afterMetrics.totalDistance) / (beforeTopRevenue / beforeMetrics.totalDistance) - 1) * 100);

  const beforeProfit = beforeMetrics.profit.totalExpectedProfit;
  const afterProfit = afterMetrics.profit.totalExpectedProfit;
  const profitImprovement = beforeProfit > 0 ? Math.round(((afterProfit - beforeProfit) / Math.abs(beforeProfit)) * 100) : 0;

  return {
    before: { orders: beforeOrders, ...beforeMetrics },
    after: { orders: afterOrders, ...afterMetrics },
    revenueGain,
    riskReduction: Math.max(0, riskReduction),
    efficiencyGain: isFinite(efficiencyGain) ? efficiencyGain : 0,
    profitImprovement,
  };
}

export function simulateDeliveryDay(orders: AnalyzedOrder[]): DeliveryOutcome[] {
  return orders.map((o) => {
    const delivered = Math.random() < o.successProbability;
    return {
      orderId: o.id,
      delivered,
      actualRevenue: delivered ? o.orderValue : 0,
      lostRevenue: delivered ? 0 : o.orderValue,
    };
  });
}

export function generateInsights(orders: AnalyzedOrder[], result: OptimizationResult): string[] {
  const insights: string[] = [];
  const codOrders = orders.filter((o) => o.paymentType === "COD");
  const highRiskCod = codOrders.filter((o) => o.riskCategory === "high");
  if (highRiskCod.length > codOrders.length * 0.3) {
    insights.push(`${Math.round((highRiskCod.length / codOrders.length) * 100)}% of COD orders fall in high-risk zones — consider pre-verification for these orders.`);
  }

  const highValueOrders = orders.filter((o) => o.orderValue >= 600);
  const highValueLowRisk = highValueOrders.filter((o) => o.riskCategory === "low");
  if (highValueLowRisk.length > highValueOrders.length * 0.5) {
    insights.push(`${highValueLowRisk.length} high-value orders have low risk — these are prime candidates for priority delivery.`);
  }

  if (result.riskReduction > 10) {
    insights.push(`Optimized routing reduces exposure to risky COD orders by ${result.riskReduction}%.`);
  }

  const avgDist = orders.reduce((s, o) => s + o.distance, 0) / orders.length;
  const highRiskAvgDist = orders.filter((o) => o.riskCategory === "high").reduce((s, o) => s + o.distance, 0) / (orders.filter((o) => o.riskCategory === "high").length || 1);
  if (highRiskAvgDist < avgDist) {
    insights.push("Distance is not the strongest predictor of failure — payment type and reliability matter more.");
  }

  if (result.profitImprovement > 5) {
    insights.push(`Profit-aware routing yields ${result.profitImprovement}% higher expected profit than distance-based routing.`);
  }

  const prepaidOrders = orders.filter((o) => o.paymentType === "Prepaid");
  const prepaidAvgProfit = prepaidOrders.reduce((s, o) => s + o.expectedProfit, 0) / (prepaidOrders.length || 1);
  const codAvgProfit = codOrders.reduce((s, o) => s + o.expectedProfit, 0) / (codOrders.length || 1);
  if (prepaidAvgProfit > codAvgProfit * 1.5) {
    insights.push(`Prepaid orders generate ${Math.round((prepaidAvgProfit / codAvgProfit - 1) * 100)}% more profit per order than COD.`);
  }

  return insights.slice(0, 5);
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

  if (order.orderValue >= 600) parts.push("high order value");
  else if (order.orderValue >= 300) parts.push("moderate order value");
  else parts.push("low order value");

  if (order.distance <= 15) parts.push("short delivery distance");
  else if (order.distance <= 30) parts.push("moderate distance");
  else parts.push("long delivery distance");

  const action =
    order.priorityScore >= 0.5
      ? "prioritized for early delivery"
      : order.priorityScore >= 0.2
        ? "scheduled for standard delivery"
        : "flagged for verification before dispatch";

  return `This order is ${action} due to ${parts.join(", ")}. Payment type: ${order.paymentType}, Customer reliability: ${Math.round(order.customerReliability * 100)}%.`;
}

export function getFactorContributions(order: AnalyzedOrder, weights: LearningWeights, allOrders: AnalyzedOrder[]) {
  const maxValue = Math.max(...allOrders.map((o) => o.orderValue), 1);
  const maxDist = Math.max(...allOrders.map((o) => o.distance), 1);

  return {
    successContribution: Math.round(weights.successWeight * order.successProbability * 1000) / 1000,
    valueContribution: Math.round(weights.valueWeight * (order.orderValue / maxValue) * 1000) / 1000,
    distancePenalty: Math.round(-weights.distanceWeight * (order.distance / maxDist) * 1000) / 1000,
  };
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
