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
}

export interface OptimizationResult {
  before: {
    orders: AnalyzedOrder[];
    totalDistance: number;
    expectedRevenue: number;
    highRiskCount: number;
    avgRisk: number;
  };
  after: {
    orders: AnalyzedOrder[];
    totalDistance: number;
    expectedRevenue: number;
    highRiskCount: number;
    avgRisk: number;
  };
  revenueGain: number;
  riskReduction: number;
  efficiencyGain: number;
}

export interface SimulationParams {
  codPercentage: number;
  riskMultiplier: number;
  avgOrderValue: number;
}
