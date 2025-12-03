import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminVolunteersPage from '../page';

// Mock AdminSidebar
vi.mock('@/app/_components/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

// Mock Supabase client
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('AdminVolunteersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders volunteers page with list', async () => {
    mockRpc.mockResolvedValue({ 
      data: [
        { 
          user_id: 'user-123', 
          products_tracked: 5, 
          total_points: 100, 
          last_active: '2023-01-01' 
        }
      ], 
      error: null 
    });

    const jsx = await AdminVolunteersPage();
    render(jsx);

    expect(screen.getByText('Voluntarios')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByText('user-123...')).toBeInTheDocument();
    expect(screen.getByText('100 pts')).toBeInTheDocument();
  });

  it('renders empty state if no volunteers', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const jsx = await AdminVolunteersPage();
    render(jsx);

    expect(screen.getByText('No se encontraron voluntarios activos')).toBeInTheDocument();
  });
});
