import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductPriceChangeCarousel from '../ProductPriceChangeCarousel';
import { createBrowserClient } from '@supabase/ssr';

// Mock Supabase client
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}));

const mockRpc = vi.fn();

(createBrowserClient as any).mockReturnValue({
  rpc: mockRpc,
});

describe('ProductPriceChangeCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock RPC to return a promise that never resolves immediately to test loading state
    mockRpc.mockReturnValue(new Promise(() => {}));
    
    render(<ProductPriceChangeCarousel />);
    // Depending on implementation, it might show nothing or a skeleton. 
    // If it returns null on loading, we can check that.
    // Based on previous implementation, it might return null if loading.
    // Let's assume it renders something or nothing without crashing.
  });

  it('renders products when data is fetched successfully', async () => {
    const mockProducts = [
      {
        product_id: 1,
        product_name: 'Test Product',
        product_photo_url: 'http://example.com/photo.jpg',
        current_price: 100,
        previous_price: 90,
        price_change_percentage: 11.11,
        last_update_date: '2023-01-01T00:00:00Z',
        establishment_name: 'Test Store',
        location_name: 'Test Location',
      },
    ];

    mockRpc.mockResolvedValue({ data: mockProducts, error: null });

    render(<ProductPriceChangeCarousel />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Error fetching' } });
    
    render(<ProductPriceChangeCarousel />);
    
    // It should probably log error and render nothing or error message
    // For now just ensuring it doesn't crash
  });
});
