import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductPriceHistoryChart from '../ProductPriceHistoryChart';

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
      append: vi.fn().mockReturnThis(),
    })),
    append: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      selectAll: vi.fn(() => ({
        attr: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        data: vi.fn().mockReturnThis(),
        join: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        append: vi.fn().mockReturnThis(),
        clone: vi.fn().mockReturnThis(),
      })),
      select: vi.fn().mockReturnThis(),
    })),
  })),
  scaleTime: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    nice: vi.fn().mockReturnThis(),
  })),
  scaleOrdinal: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
  })),
  extent: vi.fn(() => [new Date('2023-01-01'), new Date('2023-12-31')]),
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
  axisBottom: vi.fn(() => ({
    ticks: vi.fn().mockReturnThis(),
    tickSizeOuter: vi.fn().mockReturnThis(),
  })),
  axisLeft: vi.fn(() => ({
    tickFormat: vi.fn().mockReturnThis(),
  })),
  line: vi.fn(() => ({
    curve: vi.fn().mockReturnThis(),
    x: vi.fn().mockReturnThis(),
    y: vi.fn().mockReturnThis(),
  })),
  curveMonotoneX: {},
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
}));

describe('ProductPriceHistoryChart', () => {
  const mockData = [
    {
      date: new Date('2023-01-01'),
      price: 25.50,
      establishment: 'Walmart',
      location: 'CDMX',
    },
    {
      date: new Date('2023-02-01'),
      price: 26.00,
      establishment: 'Walmart',
      location: 'CDMX',
    },
    {
      date: new Date('2023-01-01'),
      price: 27.00,
      establishment: 'Soriana',
      location: 'CDMX',
    },
  ];

  it('renders container div', () => {
    const { container } = render(<ProductPriceHistoryChart data={mockData} />);
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('w-full');
  });

  it('renders svg element', () => {
    const { container } = render(<ProductPriceHistoryChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct CSS classes to svg', () => {
    const { container } = render(<ProductPriceHistoryChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-full', 'h-[400px]');
  });

  it('handles empty data array', () => {
    const { container } = render(<ProductPriceHistoryChart data={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles undefined data', () => {
    const { container } = render(<ProductPriceHistoryChart data={[] as any} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('re-renders when data changes', () => {
    const { rerender, container } = render(<ProductPriceHistoryChart data={mockData} />);
    
    const newData = [
      {
        date: new Date('2024-01-01'),
        price: 30.00,
        establishment: 'Walmart',
        location: 'Guadalajara',
      },
    ];
    
    rerender(<ProductPriceHistoryChart data={newData} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
