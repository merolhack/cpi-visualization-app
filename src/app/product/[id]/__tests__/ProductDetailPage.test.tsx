import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductoPage from '../page';
import { notFound } from 'next/navigation';

// Mock components
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/app/_components/ProductPriceHistoryChart', () => ({
  default: () => <div data-testid="price-chart">Price Chart</div>,
}));

vi.mock('../DownloadDataButton', () => ({
  default: () => <button>Download Data</button>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock Supabase client
const mockFrom = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe('ProductoPage', () => {
  const mockParams = Promise.resolve({ id: '123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product details correctly', async () => {
    // Mock product data
    const mockProduct = {
      product_id: 123,
      product_name: 'Test Product',
      product_photo_url: 'http://example.com/photo.jpg',
      cpi_categories: { category_name: 'Test Category' },
      cpi_countries: { country_name: 'Test Country' },
    };

    // Mock prices data
    const mockPrices = [
      {
        price_id: 1,
        price_value: 100,
        date: '2023-01-01',
        price_photo_url: 'http://example.com/price.jpg',
        cpi_locations: { location_name: 'Test Location' },
        cpi_establishments: { establishment_name: 'Test Store' },
      },
    ];

    // Setup mock chain
    mockFrom.mockImplementation((table) => {
      if (table === 'cpi_products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProduct, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'cpi_prices') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: mockPrices, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    const jsx = await ProductoPage({ params: mockParams });
    render(jsx);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test Country')).toBeInTheDocument();
    expect(screen.getAllByText('$100.00')).toHaveLength(2); // Current price and table row
    expect(screen.getByTestId('price-chart')).toBeInTheDocument();
  });

  it('calls notFound if product does not exist', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'cpi_products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    try {
      await ProductoPage({ params: mockParams });
    } catch (e) {
      // Ignore
    }

    expect(notFound).toHaveBeenCalled();
  });

  it('renders "no data" message if there are no prices', async () => {
    // Mock product data
    const mockProduct = {
      product_id: 123,
      product_name: 'Test Product',
      product_photo_url: null,
      cpi_categories: { category_name: 'Test Category' },
      cpi_countries: { country_name: 'Test Country' },
    };

    mockFrom.mockImplementation((table) => {
      if (table === 'cpi_products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockProduct, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'cpi_prices') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    const jsx = await ProductoPage({ params: mockParams });
    render(jsx);

    expect(screen.getByText('Este producto aún no tiene registros de precios')).toBeInTheDocument();
    expect(screen.queryByTestId('price-chart')).not.toBeInTheDocument();
  });
});
