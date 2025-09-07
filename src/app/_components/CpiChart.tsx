// src/app/_components/CpiChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type CpiDataPoint = { period: string; value: number };
interface CpiChartProps { data: CpiDataPoint[] }

export default function CpiChart({ data }: CpiChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous contents

    const width = parseInt(svg.style("width")) || 800;
    const height = parseInt(svg.style("height")) || 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const parseDate = d3.timeParse("%Y-%m-%d");
    const processedData = data
      .map(d => ({
        period: parseDate(d.period)!,
        value: d.value
      }))
      .filter(d => d.period)
      .sort((a, b) => a.period.getTime() - b.period.getTime());

    const x = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.period) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(processedData, d => d.value) ?? 0, d3.max(processedData, d => d.value) ?? 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove());

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    const line = d3.line<{ period: Date; value: number }>()
      .x(d => x(d.period))
      .y(d => y(d.value));

    svg.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Tooltip implementation
    const tooltip = svg.append("g").style("display", "none");

    tooltip.append("circle").attr("r", 4).attr("fill", "steelblue");
    const tooltipText = tooltip.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#333");

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => tooltip.style("display", null))
      .on("mouseout", () => tooltip.style("display", "none"))
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const x0 = x.invert(mx);
        const bisectDate = d3.bisector((d: { period: Date }) => d.period).left;
        const i = bisectDate(processedData, x0, 1);
        const d0 = processedData[i - 1];
        const d1 = processedData[i];
        const d = d1 && d0
          ? (x0.getTime() - d0.period.getTime() > d1.period.getTime() - x0.getTime() ? d1 : d0)
          : (d0 || d1);

        if (!d) return;

        tooltip.attr("transform", `translate(${x(d.period)},${y(d.value)})`);

        tooltipText.selectAll("tspan").remove();
        tooltipText.append("tspan")
          .attr("x", 0)
          .attr("y", -20)
          .attr("font-weight", "bold")
          .text(d3.timeFormat("%b %Y")(d.period));
        tooltipText.append("tspan")
          .attr("x", 0)
          .attr("y", -8)
          .text(`Value: ${d.value.toFixed(3)}`);
      });

  }, [data]);

  return <svg ref={svgRef} className="w-full" style={{ height: '400px' }}></svg>;
}