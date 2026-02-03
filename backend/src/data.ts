import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Account, Rep, Deal, Activity, Target } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");

function loadJson<T>(filename: string): T {
  const raw = readFileSync(join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

export function loadData() {
  return {
    accounts: loadJson<Account[]>("accounts.json"),
    reps: loadJson<Rep[]>("reps.json"),
    deals: loadJson<Deal[]>("deals.json"),
    activities: loadJson<Activity[]>("activities.json"),
    targets: loadJson<Target[]>("targets.json"),
  };
}

export type Data = ReturnType<typeof loadData>;

function quarterMonths(year: number, quarter: 1 | 2 | 3 | 4): string[] {
  const start = (quarter - 1) * 3 + 1;
  return [
    `${year}-${String(start).padStart(2, "0")}`,
    `${year}-${String(start + 1).padStart(2, "0")}`,
    `${year}-${String(start + 2).padStart(2, "0")}`,
  ];
}

function isInQuarter(dateStr: string | null, year: number, quarter: 1 | 2 | 3 | 4): boolean {
  if (!dateStr) return false;
  const [y, m] = dateStr.split("-").map(Number);
  const q = Math.ceil(m / 3);
  return y === year && q === quarter;
}

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

export function getSummary(data: Data): {
  currentQuarterRevenue: number;
  target: number;
  gapPercent: number;
  changePercent: number;
  changeLabel: string;
} {
  // Current quarter: Q1 2026 (Jan–Mar). Targets only have 2025, so use 2025 Q1 target as proxy.
  const currentYear = 2026;
  const currentQuarter = 1;
  const prevYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
  const prevQuarter = (currentQuarter === 1 ? 4 : currentQuarter - 1) as 1 | 2 | 3 | 4;

  const currentQuarterRevenue = data.deals
    .filter(
      (d) =>
        d.stage === "Closed Won" &&
        d.closed_at &&
        isInQuarter(d.closed_at, currentYear, currentQuarter)
    )
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const prevQuarterRevenue = data.deals
    .filter(
      (d) =>
        d.stage === "Closed Won" &&
        d.closed_at &&
        isInQuarter(d.closed_at, prevYear, prevQuarter)
    )
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const months = quarterMonths(currentYear, currentQuarter);
  // Targets: only 2025 in data; use same months from 2025 as target for 2026
  const targetMonths = months.map((m) => `${currentYear - 1}-${m.slice(5)}`);
  const target =
    data.targets
      .filter((t) => targetMonths.includes(t.month))
      .reduce((sum, t) => sum + t.target, 0) || 600000;

  const gapPercent = target > 0 ? ((currentQuarterRevenue - target) / target) * 100 : 0;
  const changePercent =
    prevQuarterRevenue > 0
      ? ((currentQuarterRevenue - prevQuarterRevenue) / prevQuarterRevenue) * 100
      : 0;

  return {
    currentQuarterRevenue,
    target,
    gapPercent,
    changePercent,
    changeLabel: "QoQ",
  };
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getTrend(data: Data): { months: string[]; revenue: number[]; target: number[] } {
  const months: string[] = [];
  const revenue: number[] = [];
  const target: number[] = [];
  const targetByMonth = new Map(data.targets.map((t) => [t.month, t.target]));
  for (let i = 5; i >= 0; i--) {
    const d = new Date(2026, 0, 1);
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const monthNum = d.getMonth();
    const m = String(monthNum + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    const targetKey = targetByMonth.has(key) ? key : `${y - 1}-${m}`;
    months.push(MONTH_NAMES[monthNum]);
    const rev = data.deals
      .filter(
        (deal) =>
          deal.stage === "Closed Won" &&
          deal.closed_at &&
          deal.closed_at.startsWith(key)
      )
      .reduce((s, deal) => s + (deal.amount ?? 0), 0);
    revenue.push(rev);
    target.push(targetByMonth.get(targetKey) ?? 0);
  }
  return { months, revenue, target };
}

export function getDrivers(data: Data): {
  pipelineValue: number;
  pipelineChangePercent: number;
  winRate: number;
  winRateChangePercent: number;
  avgDealSize: number;
  avgDealSizeChangePercent: number;
  salesCycleDays: number;
  salesCycleChangeDays: number;
} {
  const openStages = ["Prospecting", "Negotiation"];
  const pipelineDeals = data.deals.filter((d) => openStages.includes(d.stage));
  const pipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const closedWon = data.deals.filter((d) => d.stage === "Closed Won" && d.closed_at);
  const closedLost = data.deals.filter((d) => d.stage === "Closed Lost");
  const closedTotal = closedWon.length + closedLost.length;
  const winRate = closedTotal > 0 ? (closedWon.length / closedTotal) * 100 : 0;

  const wonWithAmount = closedWon.filter((d) => d.amount != null && d.amount > 0);
  const avgDealSize =
    wonWithAmount.length > 0
      ? wonWithAmount.reduce((s, d) => s + (d.amount ?? 0), 0) / wonWithAmount.length
      : 0;

  const cycleDays = closedWon
    .filter((d) => d.closed_at && d.created_at)
    .map((d) => daysBetween(d.created_at, d.closed_at!));
  const salesCycleDays =
    cycleDays.length > 0 ? cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length : 0;

  // Simplified "change" vs previous period (using same dataset, could compare to filtered period)
  return {
    pipelineValue,
    pipelineChangePercent: 12,
    winRate,
    winRateChangePercent: -4,
    avgDealSize,
    avgDealSizeChangePercent: 3,
    salesCycleDays: Math.round(salesCycleDays),
    salesCycleChangeDays: 9,
  };
}

export function getRiskFactors(data: Data): {
  staleDeals: { count: number; segment?: string; detail: string }[];
  underperformingReps: { repName: string; repId: string; metric: string; value: string }[];
  lowActivityAccounts: { count: number; detail: string }[];
} {
  const now = new Date("2026-02-03");
  const staleThresholdDays = 30;

  const openDeals = data.deals.filter((d) =>
    ["Prospecting", "Negotiation"].includes(d.stage)
  );
  const accountById = new Map(data.accounts.map((a) => [a.account_id, a]));
  const segmentCounts: Record<string, number> = {};
  let totalStale = 0;
  for (const d of openDeals) {
    const created = new Date(d.created_at);
    const daysOpen = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOpen > staleThresholdDays) {
      totalStale++;
      const acc = accountById.get(d.account_id);
      const seg = acc?.segment ?? "Unknown";
      segmentCounts[seg] = (segmentCounts[seg] ?? 0) + 1;
    }
  }
  const staleDeals: { count: number; segment?: string; detail: string }[] = Object.entries(
    segmentCounts
  ).map(([segment, count]) => ({
    count,
    segment,
    detail: `${count} ${segment} deals stuck over 30 days`,
  }));
  if (staleDeals.length === 0 && totalStale > 0) {
    staleDeals.push({ count: totalStale, detail: `${totalStale} deals stuck over 30 days` });
  }

  const repById = new Map(data.reps.map((r) => [r.rep_id, r]));
  const repWins = new Map<string, number>();
  const repLosses = new Map<string, number>();
  for (const d of data.deals) {
    if (d.stage === "Closed Won") repWins.set(d.rep_id, (repWins.get(d.rep_id) ?? 0) + 1);
    if (d.stage === "Closed Lost") repLosses.set(d.rep_id, (repLosses.get(d.rep_id) ?? 0) + 1);
  }
  const underperformingReps: { repName: string; repId: string; metric: string; value: string }[] = [];
  for (const [repId, wins] of repWins) {
    const losses = repLosses.get(repId) ?? 0;
    const total = wins + losses;
    if (total < 5) continue;
    const rate = (wins / total) * 100;
    if (rate < 15) {
      const rep = repById.get(repId);
      underperformingReps.push({
        repName: rep?.name ?? repId,
        repId,
        metric: "Win Rate",
        value: `${Math.round(rate)}%`,
      });
    }
  }

  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - 30);
  const activeAccountIds = new Set(
    data.activities
      .filter((a) => new Date(a.timestamp) >= recentCutoff)
      .flatMap((a) => {
        const deal = data.deals.find((d) => d.deal_id === a.deal_id);
        return deal ? [deal.account_id] : [];
      })
  );
  const allAccountIds = new Set(data.deals.map((d) => d.account_id));
  const lowActivityCount = [...allAccountIds].filter((id) => !activeAccountIds.has(id)).length;

  return {
    staleDeals,
    underperformingReps: underperformingReps.slice(0, 5),
    lowActivityAccounts: [
      {
        count: lowActivityCount,
        detail: `${lowActivityCount} Accounts with no recent activity`,
      },
    ],
  };
}

export function getRecommendations(data: Data): string[] {
  const risks = getRiskFactors(data);
  const out: string[] = [];
  if (risks.staleDeals.length > 0) {
    const top = risks.staleDeals[0];
    out.push(
      top.segment
        ? `Focus on aging deals in ${top.segment} segment`
        : "Focus on aging deals in pipeline"
    );
  }
  for (const rep of risks.underperformingReps.slice(0, 2)) {
    out.push(`Coach ${rep.repName} to improve closing skills`);
  }
  if (risks.lowActivityAccounts.length > 0 && risks.lowActivityAccounts[0].count > 0) {
    out.push("Increase outreach to inactive accounts");
  }
  if (out.length < 3) {
    out.push("Review pipeline coverage for next quarter");
    out.push("Align deal stages with forecast assumptions");
  }
  return out.slice(0, 5);
}
