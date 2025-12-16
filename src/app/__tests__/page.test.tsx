import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Page from '../page';

// Mock child components to avoid complex integration issues in unit test
vi.mock('../_components/ProductPriceChangeCarousel', () => ({
  default: () => <div data-testid="carousel">Carousel</div>,
}));

vi.mock('../_components/ProductSearch', () => ({
  default: () => <div data-testid="search">Search</div>,
}));

vi.mock('../_components/CpiChart', () => ({
  default: () => <div data-testid="inflation-chart">Inflation Chart</div>,
}));

vi.mock('../_components/ProductPriceComparisonChart', () => ({
  default: () => <div data-testid="price-chart">Price Chart</div>,
}));

vi.mock('../_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../_components/CountrySelector', () => ({
  default: () => <div data-testid="country-selector">Country Selector</div>,
}));

// Mock Supabase
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ 
                data: table === 'cpi_real_cpi' ? [{ year: 2023, month: 1, real_cpi_inflation_rate: 5.5 }] : [], 
                error: null 
              }),
            })),
            limit: vi.fn().mockResolvedValue({ 
              data: table === 'cpi_real_cpi' ? [{ year: 2023, month: 1, real_cpi_inflation_rate: 5.5 }] : [], 
              error: null 
            }),
          })),
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  })),
  createServerClient: vi.fn(() => ({
    from: vi.fn((table) => {
      if (table === 'cpi_countries') {
        return {
          select: vi.fn().mockResolvedValue({ 
            data: [{ country_id: 1, country_name: 'Mexico' }], 
            error: null 
          }),
        };
      }
      return {
        select: vi.fn(() => {
          const mockBuilder = {
            eq: vi.fn(() => {
              const innerBuilder = {
                order: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({ 
                      data: [{ year: 2023, month: 1, real_cpi_inflation_rate: 5.5 }], 
                      error: null 
                    }),
                  })),
                })),
                // Allow awaiting the builder for count queries
                then: (resolve: any) => resolve({ count: 100, error: null }),
              };
              return innerBuilder;
            }),
          };
          return mockBuilder;
        }),
      };
    }),
    rpc: vi.fn((fnName) => {
      if (fnName === 'get_latest_prices_by_country') {
        return Promise.resolve({ 
          data: [{ establishment: 'Test Store', price: 100 }], 
          error: null 
        });
      }
      return Promise.resolve({ data: [], error: null });
    }),
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    get: vi.fn(() => null),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

describe('Home Page', () => {
  it('renders main sections', async () => {
    render(await Page({ searchParams: Promise.resolve({}) }));
    
    expect(screen.getByRole('heading', { name: /Índice Real de Precios al Consumidor/i })).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByTestId('inflation-chart')).toBeInTheDocument();
    // Note: price-chart (ProductPriceComparisonChart) is currently hidden
  });
});
