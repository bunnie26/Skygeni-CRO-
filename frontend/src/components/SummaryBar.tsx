import { Box, Typography } from "@mui/material";
import type { Summary } from "../api";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function SummaryBar({ summary }: { summary: Summary }) {
  const gapText =
    summary.gapPercent >= 0
      ? `+${summary.gapPercent.toFixed(0)}% to Goal`
      : `${summary.gapPercent.toFixed(0)}% to Goal`;
  const changeText =
    summary.changePercent >= 0
      ? `+${summary.changePercent.toFixed(1)}% ${summary.changeLabel}`
      : `${summary.changePercent.toFixed(1)}% ${summary.changeLabel}`;

  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        borderRadius: 1,
        px: 3,
        py: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          QTD Revenue
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {formatCurrency(summary.currentQuarterRevenue)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          Target
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {formatCurrency(summary.target)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          Gap (%)
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {gapText}
        </Typography>
      </Box>
      <Box>
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          {summary.changeLabel} Change
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {changeText}
        </Typography>
      </Box>
    </Box>
  );
}
