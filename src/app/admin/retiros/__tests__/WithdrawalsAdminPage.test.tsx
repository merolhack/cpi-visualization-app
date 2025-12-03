import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminWithdrawalsPage from '../page';

// Mock AdminSidebar
vi.mock('@/app/_components/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

// Mock WithdrawalListClient
vi.mock('../WithdrawalListClient', () => ({
  default: () => <div data-testid="withdrawal-list-client">Withdrawal List Client</div>,
}));

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('AdminWithdrawalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders withdrawals page with sidebar and client component', async () => {
    mockRpc.mockResolvedValue({ 
      data: [{ id: 1, amount: 100 }], 
      error: null 
    });

    const jsx = await AdminWithdrawalsPage();
    render(jsx);

    expect(screen.getByText('Retiros Pendientes')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('withdrawal-list-client')).toBeInTheDocument();
  });
});
