// types.ts

export interface Feed {
  id: string;
  productCode: string;
  pricePerBag: number;
  bagsConsumed: number | string;
}

export interface Stage {
  name: string;
  startWeight: number;
  endWeight: number;
  feeds: Feed[];
}

export interface Program {
    name: string;
    stages: Stage[];
}

export interface CalculationParams {
  herdSize: number;
  startWeight: number | string;
  mortalityRate: number | string;
  sellingPricePerKg: number;
  startDate: string;
  geneticPrice: number;
  medicineCost: number;
  managementCost: number;
  daysToMarket: number;
  finalWeight: number | string;
  geneticType: string;
}

export interface ProfitScenario {
    name: string;
    sellingPrice: number;
    revenue: number;
    profit: number;
}

export interface CostBreakdown {
    genetic: number;
    feed: number;
    medicine: number;
    management: number;
}

export interface FeedProgramDetail {
    stageName: string;
    productCode: string;
    bagsConsumed: number;
    totalKg: number;
    pricePerBag: number;
    totalCost: number;
}

export interface Result {
    // Key Metrics
    profitPerPig: number;
    totalCostPerKgGain: number; 
    feedCostPerKgGain: number; 
    averageFCR: number; 
    averageADG: number; 
    averageDailyFeedIntake: number;
    finalWeight: number;
    totalWeightGain: number;


    // Schedule
    daysToMarket: number;
    startDate: string;
    sellingDate: string;

    // Financials
    profitScenarios: ProfitScenario[];
    costBreakdown: CostBreakdown;
    totalCost: number;
    
    // Details
    feedProgram: FeedProgramDetail[];

    // Whole herd numbers
    totalRevenue: number; // For base scenario
    pigsSold: number;
}