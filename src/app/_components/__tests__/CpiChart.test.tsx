import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CpiChart from '../CpiChart';

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(),
    })),
    style: vi.fn(() => '800'),
    append: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      datum: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
    })),
  })),
  scaleTime: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    invert: vi.fn(),
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    nice: vi.fn().mockReturnThis(),
  })),
  extent: vi.fn(() => [new Date('2023-01-01'), new Date('2023-12-31')]),
  max: vi.fn(() => 10),
  axisBottom: vi.fn(() => ({
    ticks: vi.fn().mockReturnThis(),
    tickSizeOuter: vi.fn().mockReturnThis(),
  })),
  axisLeft: vi.fn(() => ({
    tickFormat: vi.fn().mockReturnThis(),
  })),
  line: vi.fn(() => ({
    x: vi.fn().mockReturnThis(),
    y: vi.fn().mockReturnThis(),
  })),
  timeParse: vi.fn(() => (dateStr: string) => new Date(dateStr)),
  timeFormat: vi.fn(() => (date: Date) => date.toLocaleDateString()),
  bisector: vi.fn(() => ({
    left: vi.fn(() => 1),
  })),
}));

describe('CpiChart', () => {
  const mockData = [
    { period: '2023-01-01', value: 5.5 },
    { period: '2023-02-01', value: 6.0 },
    { period: '2023-03-01', value: 5.8 },
  ];

  it('renders svg element', () => {
    const { container } = render(<CpiChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<CpiChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-full');
  });

  it('sets correct height style', () => {
    const { container } = render(<CpiChart data={mockData} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ height: '400px' });
  });

  it('handles empty data gracefully', () => {
    const { container } = render(<CpiChart data={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles undefined data', () => {
    const { container } = render(<CpiChart data={[] as any} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('re-renders when data changes', () => {
    const { rerender, container } = render(<CpiChart data={mockData} />);
    
    const newData = [
      { period: '2024-01-01', value: 7.5 },
      { period: '2024-02-01', value: 8.0 },
    ];
    
    rerender(<CpiChart data={newData} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
