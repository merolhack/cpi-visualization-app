import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistorialPage from '../page';
import { redirect } from 'next/navigation';

// Mock Navbar
vi.mock('@/app/_components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock HistoryTable
vi.mock('../HistoryTable', () => ({
  default: () => <div data-testid="history-table">History Table</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

describe('HistorialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    try {
      await HistorialPage();
    } catch (e) {
      // Ignore redirect error
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login?next=/dashboard/history');
  });

  it('renders history page with data', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123' } }, 
      error: null 
    });

    // Mock balance fetch
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ 
                data: { current_balance: 500 }, 
                error: null 
              }),
            }),
          }),
        }),
      }),
    });

    // Mock history fetch
    mockRpc.mockResolvedValue({ 
      data: [
        { id: 1, reason: 'Test', created_at: '2023-01-01', points_change: 10 }
      ], 
      error: null 
    });

    const jsx = await HistorialPage();
    render(jsx);

    expect(screen.getByText('Historial de Movimientos')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('history-table')).toBeInTheDocument();
  });
});
