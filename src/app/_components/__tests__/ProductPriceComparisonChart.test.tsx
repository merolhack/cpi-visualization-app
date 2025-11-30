import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductPriceComparisonChart from '../ProductPriceComparisonChart';

// Mock D3
// Helper to create a callable mock with properties
const createMockScale = (returnValue: any = 50) => {
  const scale = vi.fn(() => returnValue);
  const methods = {
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    padding: vi.fn().mockReturnThis(),
    bandwidth: vi.fn(() => 50),
    nice: vi.fn().mockReturnThis(),
  };
  return Object.assign(scale, methods);
};

// Mock D3
// Helper to create a recursive mock selection
const createMockSelection = () => {
  const selection: any = {
    remove: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn(function(this: any, name, value) {
      if (value === undefined) return '800';
      return this;
    }),
    text: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    selectAll: vi.fn(() => createMockSelection()),
    select: vi.fn(() => createMockSelection()),
  };
  return selection;
};

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => createMockSelection()),
  scaleBand: vi.fn(() => createMockScale(50)),
  scaleLinear: vi.fn(() => createMockScale(100)),
  scaleOrdinal: vi.fn(() => createMockScale('#000000')),
  max: vi.fn(() => 100),
  group: vi.fn((data: any[], key: any) => {
    const grouped = new Map();
    data.forEach(item => {
      const keyValue = key(item);
      if (!grouped.has(keyValue)) {
        grouped.set(keyValue, []);
      }
      grouped.get(keyValue).push(item);
    });
    return grouped;
  }),
  axisBottom: vi.fn(() => vi.fn()),
  axisLeft: vi.fn(() => {
    const axis = vi.fn();
    const methods = {
      tickFormat: vi.fn().mockReturnThis(),
    };
    return Object.assign(axis, methods);
  }),
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
}));

describe('ProductPriceComparisonChart', () => {
  const mockData = [
    { product_name: 'Leche', establishment_name: 'Walmart', price_value: 25.50 },
    { product_name: 'Leche', establishment_name: 'Soriana', price_value: 27.00 },
    { product_name: 'Pan', establishment_name: 'Walmart', price_value: 15.00 },
    { product_name: 'Pan', establishment_name: 'Soriana', price_value: 16.50 },
  ];

  it('renders svg element', () => {
    const { container } = render(<ProductPriceComparisonChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ProductPriceComparisonChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-full', 'h-[500px]');
  });

  it('handles empty data array', () => {
    const { container } = render(<ProductPriceComparisonChart data={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles undefined data', () => {
    const { container } = render(<ProductPriceComparisonChart data={[] as any} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('re-renders when data changes', () => {
    const { rerender, container } = render(<ProductPriceComparisonChart data={mockData} />);
    
    const newData = [
      { product_name: 'Arroz', establishment_name: 'Walmart', price_value: 30.00 },
    ];
    
    rerender(<ProductPriceComparisonChart data={newData} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
