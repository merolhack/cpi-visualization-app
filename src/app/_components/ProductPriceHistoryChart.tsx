'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export type PriceHistoryPoint = {
  date: Date;
  price: number;
  establishment: string;
  location: string;
};

interface ChartProps {
  data: PriceHistoryPoint[];
}

export default function ProductPriceHistoryChart({ data }: ChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    // Clear previous chart
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Dimensions
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };

    // Group data by series (Establishment + Location)
    const groupedData = d3.group(data, d => `${d.establishment} - ${d.location}`);
    const series = Array.from(groupedData);

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.price) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(series.map(s => s[0]));

    // Axes
    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      .call(g => g.select('.domain').remove());

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').clone()
        .attr('x2', width - margin.left - margin.right)
        .attr('stroke-opacity', 0.1))
      .call(g => g.append('text')
        .attr('x', -margin.left)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text('Precio (MXN)'));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    // Lines
    const line = d3.line<PriceHistoryPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.date))
      .y(d => y(d.price));

    const path = svg.append('g')
      .attr('fill', 'none')
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .selectAll('path')
      .data(series)
      .join('path')
      .style('mix-blend-mode', 'multiply')
      .attr('stroke', d => color(d[0]))
      .attr('d', d => line(d[1]));

    // Dots
    svg.append('g')
      .attr('fill', 'white')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.price))
      .attr('r', 3)
      .attr('stroke', d => color(`${d.establishment} - ${d.location}`))
      .append('title')
      .text(d => `${d.establishment} (${d.location})\n${d.date.toLocaleDateString()}\n$${d.price.toFixed(2)}`);

    // Legend
    const legend = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('transform', (d, i) => `translate(${width - margin.right + 10}, ${margin.top + i * 20})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => color(d[0]));

    legend.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .attr('dy', '0.35em')
      .text(d => d[0].length > 15 ? d[0].substring(0, 15) + '...' : d[0])
      .append('title')
      .text(d => d[0]);

  }, [data]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full h-[400px]"></svg>
    </div>
  );
}
