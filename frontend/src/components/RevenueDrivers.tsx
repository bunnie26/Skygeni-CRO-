import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import type { Drivers } from "../api";

function formatValue(d: Drivers, key: keyof Drivers): string {
  switch (key) {
    case "pipelineValue":
      return d.pipelineValue >= 1_000_000
        ? `$${(d.pipelineValue / 1_000_000).toFixed(1)}M`
        : `$${Math.round(d.pipelineValue).toLocaleString()}`;
    case "winRate":
      return `${d.winRate.toFixed(0)}%`;
    case "avgDealSize":
      return d.avgDealSize >= 1000
        ? `$${(d.avgDealSize / 1000).toFixed(1)}K`
        : `$${Math.round(d.avgDealSize)}`;
    case "salesCycleDays":
      return `${d.salesCycleDays} Days`;
    default:
      return "";
  }
}

function formatChange(d: Drivers, key: keyof Drivers): { text: string; positive: boolean } {
  switch (key) {
    case "pipelineValue":
      return { text: `${d.pipelineChangePercent >= 0 ? "+" : ""}${d.pipelineChangePercent}%`, positive: d.pipelineChangePercent >= 0 };
    case "winRate":
      return { text: `${d.winRateChangePercent >= 0 ? "+" : ""}${d.winRateChangePercent}%`, positive: d.winRateChangePercent >= 0 };
    case "avgDealSize":
      return { text: `${d.avgDealSizeChangePercent >= 0 ? "+" : ""}${d.avgDealSizeChangePercent}%`, positive: d.avgDealSizeChangePercent >= 0 };
    case "salesCycleDays":
      return { text: `+${d.salesCycleChangeDays} Days`, positive: false };
    default:
      return { text: "", positive: true };
  }
}

const DRIVER_KEYS: { key: keyof Drivers; label: string }[] = [
  { key: "pipelineValue", label: "Pipeline Value" },
  { key: "winRate", label: "Win Rate" },
  { key: "avgDealSize", label: "Avg Deal Size" },
  { key: "salesCycleDays", label: "Sales Cycle" },
];

function MiniAreaChart({ width, height, positive }: { width: number; height: number; positive: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const data = [2, 5, 3, 7, 4, 8, 5, 9].map((y, i) => ({ x: i, y }));
    const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3.select(ref.current).attr("viewBox", `0 0 ${width} ${height}`);
    const area = d3
      .area<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y0(height)
      .y1((d) => yScale(d.y));
    svg
      .append("path")
      .datum(data)
      .attr("fill", positive ? "rgba(46, 125, 50, 0.4)" : "rgba(211, 47, 47, 0.4)")
      .attr("d", area);
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", positive ? "#2e7d32" : "#d32f2f")
      .attr("stroke-width", 1)
      .attr("d", d3.line<{ x: number; y: number }>().x((d) => xScale(d.x)).y((d) => yScale(d.y)));
  }, [width, height, positive]);
  return <svg ref={ref} width={width} height={height} />;
}

function MiniBarChart({ width, height, positive }: { width: number; height: number; positive: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const data = [4, 6, 5, 7, 5, 6, 4, 5];
    const xScale = d3.scaleBand().domain(data.map((_, i) => String(i))).range([0, width]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);
    d3.select(ref.current).selectAll("*").remove();
    const svg = d3.select(ref.current).attr("viewBox", `0 0 ${width} ${height}`);
    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (_, i) => xScale(String(i)) ?? 0)
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d))
      .attr("fill", positive ? "#2e7d32" : "#d32f2f");
  }, [width, height, positive]);
  return <svg ref={ref} width={width} height={height} />;
}

export function RevenueDrivers({ drivers }: { drivers: Drivers }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Revenue Drivers
      </Typography>
      {DRIVER_KEYS.map(({ key, label }) => {
        const change = formatChange(drivers, key);
        const useBar = key === "winRate";
        return (
          <Box key={key} sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: change.positive ? "success.main" : "error.main" }}
              >
                {change.text}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight="bold">
                {formatValue(drivers, key)}
              </Typography>
              <Box sx={{ width: 80, height: 32, ml: "auto" }}>
                {useBar ? (
                  <MiniBarChart width={80} height={32} positive={change.positive} />
                ) : (
                  <MiniAreaChart width={80} height={32} positive={change.positive} />
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
