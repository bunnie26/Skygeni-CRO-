const API_BASE = "/api";

export interface Summary {
  currentQuarterRevenue: number;
  target: number;
  gapPercent: number;
  changePercent: number;
  changeLabel: string;
  trendMonths?: string[];
  trendRevenue?: number[];
  trendTarget?: number[];
}

export interface Drivers {
  pipelineValue: number;
  pipelineChangePercent: number;
  winRate: number;
  winRateChangePercent: number;
  avgDealSize: number;
  avgDealSizeChangePercent: number;
  salesCycleDays: number;
  salesCycleChangeDays: number;
}

export interface StaleDeal {
  count: number;
  segment?: string;
  detail: string;
}

export interface UnderperformingRep {
  repName: string;
  repId: string;
  metric: string;
  value: string;
}

export interface LowActivityAccount {
  count: number;
  detail: string;
}

export interface RiskFactors {
  staleDeals: StaleDeal[];
  underperformingReps: UnderperformingRep[];
  lowActivityAccounts: LowActivityAccount[];
}

export async function fetchSummary(): Promise<Summary> {
  const r = await fetch(`${API_BASE}/summary`);
  if (!r.ok) throw new Error("Failed to fetch summary");
  return r.json();
}

export async function fetchDrivers(): Promise<Drivers> {
  const r = await fetch(`${API_BASE}/drivers`);
  if (!r.ok) throw new Error("Failed to fetch drivers");
  return r.json();
}

export async function fetchRiskFactors(): Promise<RiskFactors> {
  const r = await fetch(`${API_BASE}/risk-factors`);
  if (!r.ok) throw new Error("Failed to fetch risk factors");
  return r.json();
}

export async function fetchRecommendations(): Promise<string[]> {
  const r = await fetch(`${API_BASE}/recommendations`);
  if (!r.ok) throw new Error("Failed to fetch recommendations");
  return r.json();
}
