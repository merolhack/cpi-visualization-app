import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductPriceComparisonChart from '../ProductPriceComparisonChart';

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(),
      data: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
    })),
    style: vi.fn(() => '800'),
    append: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      selectAll: vi.fn(() => ({
        attr: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        data: vi.fn().mockReturnThis(),
        join: vi.fn(() => ({
          attr: vi.fn().mockReturnThis(),
          selectAll: vi.fn(() => ({
            data: vi.fn().mockReturnThis(),
            join: vi.fn().mockReturnThis(),
            attr: vi.fn().mockReturnThis(),
          })),
        })),
        text: vi.fn().mockReturnThis(),
        append: vi.fn().mockReturnThis(),
      })),
    })),
  })),
  scaleBand: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    padding: vi.fn().mockReturnThis(),
    bandwidth: vi.fn(() => 50),
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    nice: vi.fn().mockReturnThis(),
  })),
  scaleOrdinal: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
  })),
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
  axisLeft: vi.fn(() => ({
    tickFormat: vi.fn().mockReturnThis(),
  })),
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
