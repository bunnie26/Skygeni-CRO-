import express from "express";
import cors from "cors";
import { loadData, getSummary, getDrivers, getRiskFactors, getRecommendations, getTrend } from "./data.js";

const app = express();
app.use(cors());
app.use(express.json());

const data = loadData();

app.get("/api/summary", (_req, res) => {
  try {
    const s = getSummary(data);
    const trend = getTrend(data);
    res.json({
      currentQuarterRevenue: s.currentQuarterRevenue,
      target: s.target,
      gapPercent: s.gapPercent,
      changePercent: s.changePercent,
      changeLabel: s.changeLabel,
      trendMonths: trend.months,
      trendRevenue: trend.revenue,
      trendTarget: trend.target,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/drivers", (_req, res) => {
  try {
    const d = getDrivers(data);
    res.json({
      pipelineValue: d.pipelineValue,
      pipelineChangePercent: d.pipelineChangePercent,
      winRate: d.winRate,
      winRateChangePercent: d.winRateChangePercent,
      avgDealSize: d.avgDealSize,
      avgDealSizeChangePercent: d.avgDealSizeChangePercent,
      salesCycleDays: d.salesCycleDays,
      salesCycleChangeDays: d.salesCycleChangeDays,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/risk-factors", (_req, res) => {
  try {
    res.json(getRiskFactors(data));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/recommendations", (_req, res) => {
  try {
    res.json(getRecommendations(data));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
