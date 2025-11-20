import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductSearch from '../ProductSearch';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase client
const mockFrom = vi.fn();
vi.mock('@/app/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe('ProductSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<ProductSearch />);
    expect(screen.getByPlaceholderText(/buscar producto/i)).toBeInTheDocument();
  });

  it('shows minimum character hint when query is too short', () => {
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i);
    
    fireEvent.change(input, { target: { value: 'a' } });
    
    expect(screen.getByText(/escribe al menos 2 caracteres/i)).toBeInTheDocument();
  });

  it('does not search with less than 2 characters', async () => {
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i);
    
    fireEvent.change(input, { target: { value: 'a' } });
    
    // Wait a bit to ensure no search is triggered
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('displays search results', async () => {
    const mockProducts = [
      {
        product_id: 1,
        product_name: 'Leche entera',
        cpi_categories: { category_name: 'Lácteos' },
        cpi_countries: { country_name: 'México' },
      },
      {
        product_id: 2,
        product_name: 'Leche descremada',
        cpi_categories: { category_name: 'Lácteos' },
        cpi_countries: { country_name: 'México' },
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
          }),
        }),
      }),
    });
    
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i);
    
    fireEvent.change(input, { target: { value: 'leche' } });
    
    await waitFor(() => {
      expect(screen.getByText('Leche entera')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows no results message when no products found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });
    
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i);
    
    fireEvent.change(input, { target: { value: 'xyz' } });
    
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('navigates to product page when result is clicked', async () => {
    const mockProducts = [
      {
        product_id: 123,
        product_name: 'Leche entera',
        cpi_categories: { category_name: 'Lácteos' },
        cpi_countries: { country_name: 'México' },
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
          }),
        }),
      }),
    });
    
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i);
    
    fireEvent.change(input, { target: { value: 'leche' } });
    
    await waitFor(() => {
      expect(screen.getByText('Leche entera')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    const resultButton = screen.getByText('Leche entera');
    fireEvent.click(resultButton);
    
    expect(mockPush).toHaveBeenCalledWith('/product/123');
  });

  it('handles search errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Search failed') }),
          }),
        }),
      }),
    });
    
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i);
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    consoleErrorSpy.mockRestore();
  });

  it('clears search input after selecting product', async () => {
    const mockProducts = [
      {
        product_id: 1,
        product_name: 'Leche entera',
        cpi_categories: { category_name: 'Lácteos' },
        cpi_countries: { country_name: 'México' },
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
          }),
        }),
      }),
    });
    
    render(<ProductSearch />);
    const input = screen.getByPlaceholderText(/buscar producto/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'leche' } });
    
    await waitFor(() => {
      expect(screen.getByText('Leche entera')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    const resultButton = screen.getByText('Leche entera');
    fireEvent.click(resultButton);
    
    expect(input.value).toBe('');
  });
});
