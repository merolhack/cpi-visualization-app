// file: src/app/_components/ProductPriceComparisonChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type PriceComparisonData = {
  product_name: string;
  establishment_name: string;
  price_value: number;
};

interface ChartProps {
  data: PriceComparisonData[];
}

interface GroupedData extends Array<unknown> {
  0: string; // Product name (key)
  1: PriceComparisonData[]; // Array of price data (values)
}

export default function ProductPriceComparisonChart({ data }: ChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = parseInt(svg.style('width'));
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 150, left: 60 };

    const groupedData = d3.group(data, (d) => d.product_name);
    const products = Array.from(groupedData.keys());
    const establishments = Array.from(new Set(data.map((d) => d.establishment_name)));

    const x0 = d3.scaleBand().domain(products).range([margin.left, width - margin.right]).padding(0.2);
    const x1 = d3.scaleBand().domain(establishments).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.price_value) ?? 0]).nice().range([height - margin.bottom, margin.top]);
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(establishments);

    // Ejes (sin cambios)
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`));

    // Barras
const productGroup = svg.selectAll('.product-group')
  .data(Array.from(groupedData) as GroupedData[])
  .join('g')
  .attr('class', 'product-group')
  .attr('transform', d => {
    const xPos = x0(d[0]);
    return xPos !== undefined ? `translate(${xPos}, 0)` : `translate(0, 0)`;
  });

    productGroup.selectAll('rect')
      // FIX: Access the values (array of prices) from index 1
      .data(d => d[1]) // Use index 1 instead of index 4
      .join('rect')
      .attr('x', d => x1(d.establishment_name) || 0) // Added fallback for null values
      .attr('y', d => y(d.price_value))
      .attr('width', x1.bandwidth())
      .attr('height', d => height - margin.bottom - y(d.price_value))
      .attr('fill', d => color(d.establishment_name));

    // Leyenda (sin cambios)
    const legend = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(establishments)
      .join('g')
      .attr('transform', (d, i) => `translate(${width - margin.right - 100}, ${margin.top + i * 20})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', color);

    legend.append('text')
      .attr('x', 24)
      .attr('y', 9.5)
      .attr('dy', '0.35em')
      .text(d => d);

  }, [data]);

  return <svg ref={svgRef} className="w-full h-[500px]"></svg>;
}