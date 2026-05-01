export interface Order {
  id: string;
  location: string;
  distance: number;
  orderValue: number;
  paymentType: "COD" | "Prepaid";
  customerReliability: number;
}

export interface AnalyzedOrder extends Order {
  successProbability: number;
  riskCategory: "low" | "medium" | "high";
  priorityScore: number;
  confidenceScore: number;
  confidenceLevel: "High" | "Medium" | "Low";
  expectedProfit: number;
  deliveryCost: number;
  riskLoss: number;
  expectedRevenue: number;
}

export interface LearningWeights {
  successWeight: number;
  valueWeight: number;
  distanceWeight: number;
  history: { iteration: number; success: number; value: number; distance: number }[];
}

export interface DeliveryOutcome {
  orderId: string;
  delivered: boolean;
  actualRevenue: number;
  lostRevenue: number;
}

export interface ProfitMetrics {
  totalExpectedProfit: number;
  totalDeliveryCost: number;
  totalRiskLoss: number;
  totalExpectedRevenue: number;
}

export interface OptimizationResult {
  before: {
    orders: AnalyzedOrder[];
    totalDistance: number;
    expectedRevenue: number;
    highRiskCount: number;
    avgRisk: number;
    profit: ProfitMetrics;
  };
  after: {
    orders: AnalyzedOrder[];
    totalDistance: number;
    expectedRevenue: number;
    highRiskCount: number;
    avgRisk: number;
    profit: ProfitMetrics;
  };
  revenueGain: number;
  riskReduction: number;
  efficiencyGain: number;
  profitImprovement: number;
}

export interface SimulationParams {
  codPercentage: number;
  riskMultiplier: number;
  avgOrderValue: number;
  codFailureRate: number;
  distanceCostFactor: number;
  reliabilityShift: number;
}
