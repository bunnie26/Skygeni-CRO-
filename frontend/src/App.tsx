import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import type { Summary, Drivers, RiskFactors } from "./api";
import {
  fetchSummary,
  fetchDrivers,
  fetchRiskFactors,
  fetchRecommendations,
} from "./api";
import { SummaryBar } from "./components/SummaryBar";
import { RevenueDrivers } from "./components/RevenueDrivers";
import { RiskFactorsPanel } from "./components/RiskFactorsPanel";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { RevenueTrendChart } from "./components/RevenueTrendChart";

// Avoid duplicate API calls when React Strict Mode double-invokes effects in development
let dataFetchStarted = false;

export default function App() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [drivers, setDrivers] = useState<Drivers | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactors | null>(null);
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataFetchStarted) return;
    dataFetchStarted = true;
    Promise.all([
      fetchSummary(),
      fetchDrivers(),
      fetchRiskFactors(),
      fetchRecommendations(),
    ])
      .then(([s, d, r, rec]) => {
        setSummary(s);
        setDrivers(d);
        setRiskFactors(r);
        setRecommendations(rec);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}. Ensure the backend is running on port 3001.</Alert>
      </Box>
    );
  }

  if (!summary || !drivers || !riskFactors || recommendations === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="h1">
            SkyGeni
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SummaryBar summary={summary} />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <RevenueDrivers drivers={drivers} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <RiskFactorsPanel riskFactors={riskFactors} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <RecommendationsPanel recommendations={recommendations} />
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Revenue Trend (Last 6 Months)
          </Typography>
          <RevenueTrendChart
            months={summary.trendMonths ?? []}
            revenue={summary.trendRevenue ?? []}
            target={summary.trendTarget ?? []}
          />
        </Paper>
      </Container>
    </Box>
  );
}
