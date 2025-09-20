// src/app/_components/CpiChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type DataPoint = { period: string; value: number };
interface InflationChartProps {
  data: DataPoint[];
}

type CpiDataPoint = { period: string; value: number };

export default function CpiChart({ data }: InflationChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpiar renderizados previos

    const width = parseInt(svg.style("width")) || 800;
    const height = 400; // Altura fija
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const parseDate = d3.timeParse("%Y-%m-%d");
    const processedData = data
      .map(d => ({
        period: parseDate(d.period)!,
        value: d.value
      }))
      .filter(d => d.period); // Asegurarse de que las fechas sean válidas

    // Si no hay datos procesados, no hacer nada
    if (processedData.length === 0 || !d3.max(processedData, d => d.value)) return;

    const x = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.period) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) ?? 1])
      .nice() // Asegura que los ticks del eje Y sean números "redondos"
      .range([height - margin.bottom, margin.top]);

    // CORRECCIÓN: Tipado genérico para las selecciones de D3 en funciones de eje
    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`)) // MEJORA: Formato de porcentaje
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
      .attr("stroke-width", 2)
      .attr("d", line);

    // Lógica del Tooltip (sin cambios, ya era funcional)
    const tooltip = svg.append("g").style("display", "none");
    tooltip.append("circle").attr("r", 5).attr("fill", "steelblue");
    const tooltipText = tooltip.append("text").attr("font-size", 12).attr("text-anchor", "middle").attr("y", -10);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => tooltip.style("display", null))
      .on("mouseout", () => tooltip.style("display", "none"))
      .on("mousemove", function (event: any) {
          const bisectDate = d3.bisector((d: { period: Date }) => d.period).left;
          const x0 = x.invert(event);
          const i = bisectDate(processedData, x0, 1);
          const d0 = processedData[i - 1];
          const d1 = processedData[i];
          const d = d1 && d0 ? (x0.getTime() - d0.period.getTime() > d1.period.getTime() - x0.getTime() ? d1 : d0) : (d0 || d1);
          
          if (!d) return;

          tooltip.attr("transform", `translate(${x(d.period)},${y(d.value)})`);
          tooltipText.text(`${d.value.toFixed(2)}% - ${d3.timeFormat("%b %Y")(d.period)}`);
      });

  }, [data]);

  return <svg ref={svgRef} className="w-full" style={{ height: '400px' }}></svg>;
}
