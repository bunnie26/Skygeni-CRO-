import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import * as d3 from "d3";

interface RevenueTrendChartProps {
  months: string[];
  revenue: number[];
  target: number[];
}

export function RevenueTrendChart({ months, revenue, target }: RevenueTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || months.length === 0) return;

    const width = containerRef.current.clientWidth || 600;
    const height = 280;
    const margin = { top: 20, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxVal = Math.max(
      ...revenue,
      ...target,
      1
    );

    const xScale = d3
      .scaleBand()
      .domain(months)
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0]);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("font-size", "12px");

    g.append("g")
      .call(
        d3.axisLeft(yScale).tickFormat((d) => (Number(d) >= 1000 ? `${Number(d) / 1000}K` : String(d)))
      )
      .selectAll("text")
      .attr("font-size", "12px");

    g.selectAll(".bar-revenue")
      .data(revenue)
      .join("rect")
      .attr("class", "bar-revenue")
      .attr("x", (_, i) => (xScale(months[i]) ?? 0))
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d))
      .attr("fill", "#1976d2");

    const lineGenerator = d3
      .line<number>()
      .x((_, i) => (xScale(months[i]) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d));

    g.append("path")
      .datum(target)
      .attr("fill", "none")
      .attr("stroke", "#ed6c02")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", lineGenerator);
  }, [months, revenue, target]);

  return (
    <Box ref={containerRef} sx={{ width: "100%", overflow: "hidden" }}>
      <svg ref={svgRef} style={{ display: "block" }} />
    </Box>
  );
}
