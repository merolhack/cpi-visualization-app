import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminProductsPage from '../page';

// Mock AdminSidebar
vi.mock('@/app/_components/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

// Mock ProductListClient
vi.mock('../ProductListClient', () => ({
  default: () => <div data-testid="product-list-client">Product List Client</div>,
}));

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products page with sidebar and client component', async () => {
    mockRpc.mockResolvedValue({ 
      data: [{ id: 1, name: 'Product 1' }], 
      error: null 
    });

    const jsx = await AdminProductsPage();
    render(jsx);

    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('product-list-client')).toBeInTheDocument();
  });
});
