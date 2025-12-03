import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboardPage from '../page';

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin dashboard with stats', async () => {
    mockRpc.mockResolvedValue({ 
      data: [{ 
        total_volunteers: 10, 
        total_products: 50, 
        total_prices: 200, 
        pending_withdrawals: 3 
      }], 
      error: null 
    });

    const jsx = await AdminDashboardPage();
    render(jsx);

    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Volunteers
    expect(screen.getByText('50')).toBeInTheDocument(); // Products
    expect(screen.getByText('200')).toBeInTheDocument(); // Prices
    expect(screen.getByText('3')).toBeInTheDocument(); // Withdrawals
  });

  it('renders quick actions', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const jsx = await AdminDashboardPage();
    render(jsx);

    expect(screen.getByText('Gestionar Voluntarios')).toBeInTheDocument();
    expect(screen.getByText('Gestionar Productos')).toBeInTheDocument();
    expect(screen.getByText('Procesar Retiros')).toBeInTheDocument();
  });
});
